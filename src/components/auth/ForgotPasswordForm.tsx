"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import chrome from "@/app/landing.module.css";
import { CountdownButton, startCooldown } from "@/components/ui/countdown-button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, withRetryAfter } from "@/lib/auth/errors";

import { Field } from "./Field";
import { Notice } from "./Notice";
import styles from "./auth.module.css";

const request = (email: string) =>
    withRetryAfter((fetchOptions) =>
        authClient.requestPasswordReset({ email, redirectTo: "/reset-password", fetchOptions }),
    );

/**
 * Two states driven by the URL (`?email=&sent=1`), so a reload or Back lands on the same screen.
 *
 * @param email prefilled or already-sent address
 * @param sent whether a link was already requested
 */
export function ForgotPasswordForm({ email, sent }: { email?: string; sent: boolean }) {
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = String(new FormData(event.currentTarget).get("email"));

        setPending(true);
        setError(null);
        const { error } = await request(address);
        if (error) {
            setError(authErrorMessage(error));
            setPending(false);
            return;
        }
        startCooldown(`reset:${address}`, 30);
        window.location.replace(`/forgot-password?email=${encodeURIComponent(address)}&sent=1`);
    }

    async function resend() {
        const { error, retryAfter } = await request(email!);
        if (error) setError(authErrorMessage(error));
        return error ? (retryAfter ?? 0) : undefined;
    }

    if (sent && email) {
        return (
            <>
                <Notice>
                    If an account exists for <strong>{email}</strong>, a reset link is on its way. In
                    development it is printed in the server console.
                </Notice>
                <Notice tone="error">{error}</Notice>
                <div className={styles.actions}>
                    <CountdownButton storageKey={`reset:${email}`} onSend={resend} className={`${chrome.btn} ${chrome.btnGhost}`}>
                        Resend link
                    </CountdownButton>
                    <Link href="/forgot-password" className={styles.inlineLink}>
                        Use a different email
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Notice tone="error">{error}</Notice>
            <form className={styles.form} onSubmit={submit}>
                <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={email} required autoFocus />
                <button type="submit" className={chrome.btn} disabled={pending}>
                    {pending ? "Sending…" : "Send reset link"}
                </button>
            </form>
            <div className={styles.links}>
                <Link href="/sign-in">Back to sign in</Link>
            </div>
        </>
    );
}
