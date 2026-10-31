import Link from "next/link";

import chrome from "@/app/landing.module.css";
import { getAccountSession } from "@/lib/auth/session";

export async function SiteNav() {
    const session = await getAccountSession();

    return (
        <header className={chrome.nav}>
            <nav className={chrome.navInner}>
                <Link href="/" className={chrome.wordmark}>
                    Math<span>Script</span>
                </Link>
                <Link href="/projects" className={chrome.navLink}>
                    Projects
                </Link>
                <a href="#" className={chrome.navLink}>
                    Documentation
                </a>
                {session ? (
                    <Link href="/account" className={chrome.navLink}>
                        Account
                    </Link>
                ) : (
                    <Link href="/sign-in" className={chrome.navLink}>
                        Sign in
                    </Link>
                )}
            </nav>
        </header>
    );
}
