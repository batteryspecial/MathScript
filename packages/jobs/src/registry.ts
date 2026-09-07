import { reapAnonymousUsers } from "./jobs/reapAnonymousUsers";
import type { CleanupJob } from "./types";

export const cleanupJobs = {
    "reap-anonymous-users": reapAnonymousUsers,
} satisfies Record<string, CleanupJob>;

export type JobName = keyof typeof cleanupJobs;
