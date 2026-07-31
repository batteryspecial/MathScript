import { prisma } from "@mathscript/postgres";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
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
        advanced: { useSecureCookies: config.baseURL.startsWith("https://") },

        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
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
            sendOnSignUp: true,
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
                // Only providers that guarantee a verified email — otherwise an
                // unverified OAuth address hands over someone's existing account.
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
            twoFactor({ issuer: "MathScript" }),
            nextCookies(), // must stay last — it flushes Set-Cookie into the Next response
        ],
    });
}

export type Auth = ReturnType<typeof buildAuth>;
