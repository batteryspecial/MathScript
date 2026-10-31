import { prisma } from "@mathscript/postgres";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins/anonymous";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { twoFactor } from "better-auth/plugins/two-factor";

import { linkAnonymousThroughTwoFactor } from "./link-anonymous.ts";

export interface AuthEmail {
    to: string;
    subject: string;
    body: string;
}

interface OAuthCredentials {
    clientId: string;
    clientSecret: string;
}

export interface AuthConfig {
    // Public origin of the app. Must match the browser's address bar exactly.
    baseURL: string;
    secret: string;
    google: OAuthCredentials;
    github: OAuthCredentials;
    sendEmail: (email: AuthEmail) => Promise<void>;
    // Extra origins allowed to make state-changing requests. 
    // CSRF + OAuth callback allow-list.
    trustedOrigins?: string[];
    // Client-IP headers set by the host, never by the client. Wrong value = spoofable rate limits.
    ipAddressHeaders?: string[];
}

// Only rows still flagged anonymous can be emptied, so a forged id can never drain a real account.
async function moveAnonymousProjects(anonymousId: string, userId: string) {
    if (anonymousId === userId) return;
    await prisma.project.updateMany({
        where: { userId: anonymousId, user: { isAnonymous: true } },
        data: { userId },
    });
}

export function buildAuth(config: AuthConfig) {
    const link = (path: string) => `${config.baseURL}${path}`;

    return betterAuth({
        appName: "MathScript",
        baseURL: config.baseURL,
        secret: config.secret,
        database: prismaAdapter(prisma, { provider: "postgresql" }),

        // client and server are same-origin in next.js
        // no cors, no domain attribute, no subdomain sharing
        trustedOrigins: [config.baseURL, ...(config.trustedOrigins ?? [])],
        advanced: {
            useSecureCookies: config.baseURL.startsWith("https://"),
            ipAddress: { ipAddressHeaders: config.ipAddressHeaders },
        },

        emailAndPassword: {
            enabled: true,
            // Also makes a duplicate sign-up return the same synthetic success as a new one
            requireEmailVerification: true,
            minPasswordLength: 12,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: async ({ user, url }) => {
                await config.sendEmail({
                    to: user.email,
                    subject: "Reset your MathScript password",
                    body: `Reset your password: ${url}\n\nIf you didn't ask for this, ignore it.`,
                });
            },
            // Following the reset link proves inbox control. This is also how the real owner
            // reclaims an address someone else pre-registered: their reset replaces the squatter's password.
            onPasswordReset: async ({ user }) => {
                await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
            },
            onExistingUserSignUp: async ({ user }) => {
                await config.sendEmail({
                    to: user.email,
                    subject: "You already have a MathScript account",
                    body:
                        `Someone tried to sign up with this address. If it was you, sign in at ${link("/sign-in")}` +
                        `\nor reset your password at ${link("/forgot-password")}.`,
                });
            },
        },
        emailVerification: {
            sendOnSignUp: true,
            // Re-sends the link when an unverified user signs in with the right password
            sendOnSignIn: true,
            // Off on purpose: the password on an unverified row may be a squatter's. Signing in after
            // verifying proves the clicker knows it; auto sign-in would hand them a shared account.
            autoSignInAfterVerification: false,
            sendVerificationEmail: async ({ user, url }) => {
                // One landing page for every link. The re-send triggered by sign-in carries no callbackURL,
                // and the token isn't bound to it, so overriding is safe.
                const target = new URL(url);
                target.searchParams.set("callbackURL", "/sign-in?verified=1");
                await config.sendEmail({
                    to: user.email,
                    subject: "Verify your MathScript email",
                    body: `Verify your email: ${target}\n\nIf you didn't create an account, ignore this. It's deleted in 3 days.`,
                });
            },
        },
        socialProviders: {
            google: config.google,
            github: config.github,
        },
        account: {
            accountLinking: {
                enabled: true,
                // Only providers that guarantee a verified email
                trustedProviders: ["google", "github"],
            },
        },
        rateLimit: {
            enabled: true,
            storage: "database",
            window: 60,
            max: 60,
            // Per IP. The send endpoints allow 3/min against the UI's 30s cooldown,
            // so a real user never sees a 429 and a script gets one on its 4th try.
            customRules: {
                "/sign-in/email": { window: 60, max: 5 },
                "/sign-in/social": { window: 60, max: 10 },
                "/sign-up/email": { window: 60, max: 5 },
                "/send-verification-email": { window: 60, max: 3 },
                "/verify-email": { window: 60, max: 10 },
                "/request-password-reset": { window: 60, max: 3 },
                "/reset-password": { window: 60, max: 5 },
                "/change-password": { window: 60, max: 5 },
                "/update-user": { window: 60, max: 10 },
                "/two-factor/enable": { window: 60, max: 5 },
                "/two-factor/disable": { window: 60, max: 5 },
                "/two-factor/generate-backup-codes": { window: 60, max: 5 },
                "/two-factor/send-otp": { window: 60, max: 3 },
                "/two-factor/verify-totp": { window: 60, max: 5 },
                "/two-factor/verify-otp": { window: 60, max: 5 },
                "/two-factor/verify-backup-code": { window: 60, max: 5 },
            },
        },
        plugins: [
            // k-anonymity range lookup, only a 5-char hash prefix leaves the server.
            // Fails sign-up w/ 500 while the HIBP API is down.
            haveIBeenPwned(),
            twoFactor({
                issuer: "MathScript",
                otpOptions: {
                    period: 5,
                    storeOTP: "hashed",
                    sendOTP: async ({ user, otp }) => {
                        await config.sendEmail({
                            to: user.email,
                            subject: "Your MathScript sign-in code",
                            body: `Your code is ${otp}. It expires in 5 minutes.`,
                        });
                    },
                },
            }),
            anonymous({
                // Never delete on the conversion path
                disableDeleteAnonymousUser: true,
                onLinkAccount: ({ anonymousUser, newUser }) =>
                    moveAnonymousProjects(anonymousUser.user.id, newUser.user.id),
            }),
            linkAnonymousThroughTwoFactor(moveAnonymousProjects),
            nextCookies(), // ! MUST BE LAST ! flushes Set-Cookie into the Next response
        ],
    });
}

export type Auth = ReturnType<typeof buildAuth>;
