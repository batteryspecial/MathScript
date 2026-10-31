import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/AuthPage";
import { TwoFactorChallenge } from "@/components/auth/TwoFactorChallenge";
import { getAccountSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/next";

export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const next = safeNext((await searchParams).next);
    // Forward after a completed challenge lands here again; the session already exists
    if (await getAccountSession()) redirect(next);

    return (
        <AuthPage title="Two-factor authentication" lead="Confirm it's you to finish signing in.">
            <TwoFactorChallenge next={next} />
        </AuthPage>
    );
}
