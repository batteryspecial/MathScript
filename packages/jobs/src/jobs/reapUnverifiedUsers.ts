import { prisma } from "@mathscript/postgres";

import type { CleanupJob, JobDependencies } from "../types";

const DEFAULT_AGE_DAYS = 3;

export function staleUnverifiedWhere(cutoff: Date) {
    // `accounts: every credential` spares OAuth users whose provider reported an unverified email;
    // they can sign in and own data. An unverified credential user can't, so they never own anything.
    return {
        isAnonymous: false,
        emailVerified: false,
        createdAt: { lt: cutoff },
        accounts: { every: { providerId: "credential" } },
        projects: { none: {} },
    };
}

export const reapUnverifiedUsers: CleanupJob = {
    name: "reap-unverified-users",

    async run(deps: JobDependencies = {}) {
        const days = deps.olderThanDays ?? DEFAULT_AGE_DAYS;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const where = staleUnverifiedWhere(cutoff);

        if (deps.dryRun) {
            return { size: await prisma.user.count({ where }), dryRun: true };
        }

        const { count } = await prisma.user.deleteMany({ where });
        return { size: count };
    },
};
