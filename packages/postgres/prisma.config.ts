import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: path.join(__dirname, "../../.env"), quiet: true });

// The CLI (migrate, diff) talks to Neon unpooled; runtime queries go through the pooler in client.ts.
// Plain process.env rather than env(): `prisma generate` runs in builds that have no database.
export default defineConfig({
    schema: path.join(__dirname, "src", "prisma"),
    datasource: {
        url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
        shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
    },
});
