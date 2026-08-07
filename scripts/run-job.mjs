import { prisma } from "@mathscript/postgres";
import { cleanupJobs, runJob } from "@mathscript/jobs";

function isJobName(value) {
    return Object.prototype.hasOwnProperty.call(cleanupJobs, value);
}

// Usage: node dist/cli.js <job-name> [--dry-run] [--older-than-days=N]
async function main() {
    const [name, ...flags] = process.argv.slice(2);

    if (!name || !isJobName(name)) {
        console.error(`Unknown job: ${name ?? "(none)"}`);
        console.error(`Available: ${Object.keys(cleanupJobs).join(", ")}`);
        process.exitCode = 2;
        return;
    }

    const olderThan = flags.find((f) => f.startsWith("--older-than-days="))?.split("=")[1];
    const result = await runJob(name, {
        dryRun: flags.includes("--dry-run"),
        olderThanDays: olderThan ? Number(olderThan) : undefined,
    });

    // One JSON line so the Actions log stays greppable.
    console.log(JSON.stringify(result));
}

main().catch((error) => {
    // Without this the process exits 0 on a rejection and the cron reports success while having deleted nothing.
    console.error(error);
    process.exitCode = 1;
}).finally(() => prisma.$disconnect());
