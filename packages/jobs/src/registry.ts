import { purgeExpiredAuthRows } from "./jobs/purgeExpiredAuthRows";
import { reapAnonymousUsers } from "./jobs/reapAnonymousUsers";
import { reapUnverifiedUsers } from "./jobs/reapUnverifiedUsers";
import type { CleanupJob } from "./types";

export const cleanupJobs = {
    "reap-anonymous-users": reapAnonymousUsers,
    "reap-unverified-users": reapUnverifiedUsers,
    "purge-expired-auth-rows": purgeExpiredAuthRows,
} satisfies Record<string, CleanupJob>;

export type JobName = keyof typeof cleanupJobs;
