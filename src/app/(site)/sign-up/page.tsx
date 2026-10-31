import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/AuthPage";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getAccountSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/next";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const next = safeNext((await searchParams).next);
    if (await getAccountSession()) redirect(next);

    return (
        <AuthPage title="Create an account" lead="Anything you made before signing up moves into your new account.">
            <SignUpForm next={next} />
        </AuthPage>
    );
}
