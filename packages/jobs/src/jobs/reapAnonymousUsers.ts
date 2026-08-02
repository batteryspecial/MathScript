import { prisma } from "@mathscript/postgres";

import type { CleanupJob, JobDependencies } from "../types";

const DEFAULT_AGE_DAYS = 30;

/**
 * Anonymous users with no session touched since the cutoff.
 *
 * Row age alone would reap someone who has used the app for 31 days straight.
 * The activity signal is `session.updatedAt`, which better-auth refreshes on
 * use (at most once per `updateAge`) — not `expiresAt`, which stays in the
 * future for a whole session lifetime after the user has already walked away.
 * A user who never opened a session has none, so `none` holds vacuously.
 */
export function staleAnonymousWhere(cutoff: Date) {
    return {
        isAnonymous: true,
        createdAt: { lt: cutoff },
        sessions: { none: { updatedAt: { gt: cutoff } } },
    };
}

export const reapAnonymousUsers: CleanupJob = {
    name: "reap-anonymous-users",

    async run(deps: JobDependencies = {}) {
        const days = deps.olderThanDays ?? DEFAULT_AGE_DAYS;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const where = staleAnonymousWhere(cutoff);

        if (deps.dryRun) {
            return { size: await prisma.user.count({ where }), dryRun: true };
        }

        // Project cascades from user, and Node/Document/Cell cascade from Project,
        // so one delete takes the whole tree.
        const { count } = await prisma.user.deleteMany({ where });
        return { size: count };
    },
};
