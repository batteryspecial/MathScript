import { buildAuth } from "@mathscript/auth";
import { env } from "../env";

export const auth = buildAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    // TODO: Swap for Resend before any non-localhost signup
    sendEmail: async ({ to, subject, body }) => {
        console.log(`[auth email] to=${to} subject=${subject}\n${body}`);
    },
});
