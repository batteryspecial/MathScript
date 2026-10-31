import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/AuthPage";
import { SignInForm } from "@/components/auth/SignInForm";
import { getAccountSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/next";

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
    const params = await searchParams;
    const next = safeNext(params.next);
    if (await getAccountSession()) redirect(next);

    const error = typeof params.error === "string" ? params.error : undefined;
    const banner = params.verified ? "verified" : params.reset ? "reset" : error;
    return (
        <AuthPage title="Sign in">
            <SignInForm next={next} banner={banner} />
        </AuthPage>
    );
}
