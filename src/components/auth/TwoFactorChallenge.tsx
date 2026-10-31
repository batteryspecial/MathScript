"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import chrome from "@/app/landing.module.css";
import { CountdownButton } from "@/components/ui/countdown-button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, withRetryAfter, type AuthError } from "@/lib/auth/errors";

import { CodeField, Field } from "./Field";
import { Notice } from "./Notice";
import styles from "./auth.module.css";

type Method = "totp" | "otp" | "backup";

const TABS: { id: Method; label: string }[] = [
    { id: "totp", label: "Authenticator app" },
    { id: "otp", label: "Email code" },
    { id: "backup", label: "Backup code" },
];

// These end the challenge server-side; retrying the form can't succeed
const RESTART = new Set(["INVALID_TWO_FACTOR_COOKIE", "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"]);

export function TwoFactorChallenge({ next }: { next: string }) {
    const [method, setMethod] = useState<Method>("totp");
    const [error, setError] = useState<AuthError | null>(null);
    const [sent, setSent] = useState(false);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const code = String(form.get("code")).trim();
        const trustDevice = form.get("trust") === "on";

        setPending(true);
        setError(null);
        const verify = {
            totp: () => authClient.twoFactor.verifyTotp({ code, trustDevice }),
            otp: () => authClient.twoFactor.verifyOtp({ code, trustDevice }),
            backup: () => authClient.twoFactor.verifyBackupCode({ code, trustDevice }),
        }[method];

        const { error } = await verify();
        if (error) {
            setError(error);
            setPending(false);
            return;
        }
        window.location.assign(next);
    }

    async function sendCode() {
        const { error, retryAfter } = await withRetryAfter((fetchOptions) =>
            authClient.twoFactor.sendOtp({ fetchOptions }),
        );
        if (error) {
            setError(error);
            return retryAfter ?? 0;
        }
        setSent(true);
    }

    if (error?.code && RESTART.has(error.code)) {
        return (
            <>
                <Notice tone="error">{authErrorMessage(error)}</Notice>
                <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className={chrome.btn}>
                    Sign in again
                </Link>
            </>
        );
    }

    return (
        <>
            <div className={styles.tabs} role="tablist">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={method === tab.id}
                        className={`${styles.tab} ${method === tab.id ? styles.tabActive : ""}`}
                        onClick={() => {
                            setMethod(tab.id);
                            setError(null);
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <Notice tone="error">{authErrorMessage(error)}</Notice>
            {method === "otp" && sent && <Notice>Code sent. In development it is printed in the server console.</Notice>}

            {/* key: switching method must not carry a half-typed code across */}
            <form key={method} className={styles.form} onSubmit={submit}>
                {method === "otp" && (
                    <CountdownButton storageKey="2fa-otp" onSend={sendCode} className={`${chrome.btn} ${chrome.btnGhost}`}>
                        Send code
                    </CountdownButton>
                )}

                {method === "backup" ? (
                    <Field label="Backup code" name="code" autoComplete="off" required autoFocus />
                ) : (
                    <CodeField label={method === "totp" ? "Code from your app" : "Code from the email"} name="code" autoFocus />
                )}

                <label className={styles.check}>
                    <input type="checkbox" name="trust" /> Trust this device for 30 days
                </label>
                <button type="submit" className={chrome.btn} disabled={pending}>
                    {pending ? "Verifying…" : "Verify"}
                </button>
            </form>

            <div className={styles.links}>
                <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>Start over</Link>
            </div>
        </>
    );
}
