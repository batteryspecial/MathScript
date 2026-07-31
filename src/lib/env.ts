import "server-only";

import { z } from "zod";

export const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);
console.log(parsedEnv)
if (!parsedEnv.success) {
    console.error("Invalid environment variables:");
    console.error(z.prettifyError(parsedEnv.error));

    // Crash the server immediately on startup
    throw new Error("Invalid environment variables. Fix your .env file.");
}

export const env = Object.freeze(parsedEnv.data);
