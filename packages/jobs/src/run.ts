import { cleanupJobs, type JobName } from "./registry";
import type { JobDependencies, JobResult } from "./types";

export async function runJob(name: JobName, deps?: JobDependencies): Promise<JobResult> {
    const start = performance.now();
    const result = await cleanupJobs[name].run(deps);
    const ms = performance.now() - start;

    return { name, ms, ...result };
}
