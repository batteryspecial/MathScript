import { reapAnonymousUsers } from "./jobs/reapAnonymousUsers";
import type { CleanupJob } from "./types";

// `satisfies` rather than a type annotation, so JobName stays a union of the
// real keys and runJob("typo") fails to compile instead of at 3am.
export const cleanupJobs = {
    "reap-anonymous-users": reapAnonymousUsers,
} satisfies Record<string, CleanupJob>;

export type JobName = keyof typeof cleanupJobs;
