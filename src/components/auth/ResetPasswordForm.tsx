"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import chrome from "@/app/landing.module.css";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { PasswordField } from "./Field";
import { Notice } from "./Notice";
import styles from "./auth.module.css";

export function ResetPasswordForm({ token }: { token: string }) {
    const [error, setError] = useState<{ code?: string; text: string } | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setError(null);

        const { error } = await authClient.resetPassword({
            newPassword: String(new FormData(event.currentTarget).get("password")),
            token,
        });
        if (error) {
            setError({ code: error.code, text: authErrorMessage(error)! });
            setPending(false);
            return;
        }
        // replace(): the token is spent, so Back must not offer this form again
        window.location.replace("/sign-in?reset=1");
    }

    if (error?.code === "INVALID_TOKEN") return <InvalidResetLink />;

    return (
        <>
            <Notice tone="error">{error?.text}</Notice>
            <form className={styles.form} onSubmit={submit}>
                <PasswordField
                    label="New password"
                    name="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    autoFocus
                    hint="At least 12 characters. This signs you out on every device."
                />
                <button type="submit" className={chrome.btn} disabled={pending}>
                    {pending ? "Saving…" : "Set new password"}
                </button>
            </form>
        </>
    );
}

export function InvalidResetLink() {
    return (
        <>
            <Notice tone="error">This reset link has expired or was already used.</Notice>
            <Link href="/forgot-password" className={chrome.btn}>
                Request a new link
            </Link>
        </>
    );
}
