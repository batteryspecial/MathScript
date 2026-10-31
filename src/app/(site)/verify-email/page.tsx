import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/AuthPage";
import { ResendVerification } from "@/components/auth/ResendVerification";
import styles from "@/components/auth/auth.module.css";

// Same page for any address, registered or not, so it can't confirm which emails have accounts
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
    const { email } = await searchParams;
    if (!email) redirect("/sign-up");

    return (
        <AuthPage
            title="Check your inbox"
            lead={
                <>
                    We sent a verification link to <strong>{email}</strong>. Open it, then sign in. In development the
                    link is printed in the server console.
                </>
            }
        >
            <ResendVerification email={email} />
            <div className={styles.links}>
                <Link href="/sign-up">Wrong address?</Link>
                <Link href="/sign-in">Already verified? Sign in</Link>
            </div>
        </AuthPage>
    );
}
