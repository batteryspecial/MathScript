import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// The schema lives at src/prisma/, so Prisma's default ".env next to the
// schema" lookup finds nothing — point it at the repo root instead.
loadEnv({ path: path.join(__dirname, "../../.env") });

export default defineConfig({
    schema: path.join(__dirname, "src", "prisma"),
});
