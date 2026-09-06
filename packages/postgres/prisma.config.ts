import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: path.join(__dirname, "../../.env") });

export default defineConfig({
    schema: path.join(__dirname, "src", "prisma"),
    datasource: {
        url: env("DATABASE_URL")
    }
});
