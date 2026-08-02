export interface CleanupJob {
    name: string;
    run(deps?: JobDependencies): Promise<{ size: number } & Record<string, unknown>>;
}

export type JobResult = {
    name: string;
    ms: number;
} & Record<string, unknown>;

export type JobDependencies = {
    /** Count what would be removed instead of removing it. */
    dryRun?: boolean;
    olderThanDays?: number;
};
