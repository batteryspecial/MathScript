import { prisma } from "@mathscript/postgres";

import type { CleanupJob, JobDependencies } from "../types";

// Reset tokens, 2FA challenges and trust-device records all live in `verification`.
// BetterAuth only deletes them on use, so abandoned ones would pile up forever.
export const purgeExpiredAuthRows: CleanupJob = {
    name: "purge-expired-auth-rows",

    async run(deps: JobDependencies = {}) {
        const where = { expiresAt: { lt: new Date() } };

        if (deps.dryRun) {
            const [verifications, sessions] = await Promise.all([
                prisma.verification.count({ where }),
                prisma.session.count({ where }),
            ]);
            return { size: verifications + sessions, verifications, sessions, dryRun: true };
        }

        const [verifications, sessions] = await prisma.$transaction([
            prisma.verification.deleteMany({ where }),
            prisma.session.deleteMany({ where }),
        ]);
        return {
            size: verifications.count + sessions.count,
            verifications: verifications.count,
            sessions: sessions.count,
        };
    },
};
