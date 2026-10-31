"use client";

import chrome from "@/app/landing.module.css";
import { authClient } from "@/lib/auth/client";

import styles from "./auth.module.css";

export function SocialButtons({ next }: { next: string }) {
    const go = (provider: "google" | "github") =>
        authClient.signIn.social({
            provider,
            callbackURL: next,
            errorCallbackURL: "/sign-in",
        });

    return (
        <div className={styles.social}>
            <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => go("google")}>
                Google
            </button>
            <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => go("github")}>
                GitHub
            </button>
        </div>
    );
}
