import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/AuthPage";
import { WelcomeTwoFactor } from "@/components/auth/WelcomeTwoFactor";
import styles from "@/components/auth/auth.module.css";
import { getAccountSession } from "@/lib/auth/session";

// Stateless on purpose: reloading shows the prompt again until it's accepted or skipped
export default async function WelcomePage() {
    const session = await getAccountSession();
    if (!session) redirect("/sign-in?next=/welcome");
    if (session.user.twoFactorEnabled) redirect("/projects");

    return (
        <AuthPage
            title={`Welcome, ${session.user.name}`}
            lead="Protect your account with two-factor authentication. You can always turn it on later from your account page."
        >
            <WelcomeTwoFactor />
            <div className={styles.links}>
                <span />
                <Link href="/projects">Skip for now</Link>
            </div>
        </AuthPage>
    );
}
