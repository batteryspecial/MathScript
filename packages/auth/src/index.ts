import { prisma } from "@mathscript/postgres";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins/anonymous";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { twoFactor } from "better-auth/plugins/two-factor";

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

export function buildAuth(config: AuthConfig) {
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
            // Off until email delivery exists. Turn back on before launch: without it
            // anyone can sign up as an address they don't own.
            requireEmailVerification: false,
            minPasswordLength: 12,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: async ({ user, url }) => {
                await config.sendEmail({
                    to: user.email,
                    subject: "Reset your MathScript password!",
                    body: `Reset your password using ${url}\n\n. If you didn't ask for this, ignore it.`,
                });
            },
        },
        emailVerification: {
            sendOnSignUp: false,
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({ user, url }) => {
                await config.sendEmail({
                    to: user.email,
                    subject: "Verify your MathScript email",
                    body: `Verify your email: ${url}`,
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
            customRules: {
                "/sign-in/email": { window: 60, max: 5 },
                "/sign-up/email": { window: 60, max: 5 },
                "/forget-password": { window: 60, max: 3 },
                "/send-verification-email": { window: 60, max: 3 },
                "/two-factor/verify-totp": { window: 60, max: 5 },
                "/two-factor/verify-otp": { window: 60, max: 5 },
                "/two-factor/verify-backup-code": { window: 60, max: 5 },
            },
        },
        plugins: [
            // k-anonymity range lookup, only a 5-char hash prefix leaves the server.
            // Fails sign-up w/ 500 while the HIBP API is down.
            haveIBeenPwned(),
            twoFactor({ issuer: "MathScript" }),
            anonymous({
                // Never delete on the conversion path
                disableDeleteAnonymousUser: true,
                onLinkAccount: async ({ anonymousUser, newUser }) => {
                    await prisma.project.updateMany({
                        where: { userId: anonymousUser.user.id },
                        data: { userId: newUser.user.id },
                    });
                },
            }),
            nextCookies(), // ! MUST BE LAST ! flushes Set-Cookie into the Next response
        ],
    });
}

export type Auth = ReturnType<typeof buildAuth>;
