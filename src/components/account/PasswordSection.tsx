"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import chrome from "@/app/landing.module.css";
import { PasswordField } from "@/components/auth/Field";
import { Notice } from "@/components/auth/Notice";
import styles from "@/components/auth/auth.module.css";
import { CountdownButton } from "@/components/ui/countdown-button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, withRetryAfter } from "@/lib/auth/errors";

import { Section } from "./Section";

const PROVIDER_NAMES: Record<string, string> = { google: "Google", github: "GitHub" };

export function PasswordSection({ hasPassword, providers, email }: { hasPassword: boolean; providers: string[]; email: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function change(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        setPending(true);
        setError(null);
        const { error } = await authClient.changePassword({
            currentPassword: String(form.get("current")),
            newPassword: String(form.get("new")),
            revokeOtherSessions: form.get("revoke") === "on",
        });
        setPending(false);
        if (error) return setError(authErrorMessage(error));

        formElement.reset();
        toast.success("Password changed");
        router.refresh();
    }

    // Reset creates the credential account when there isn't one, so it doubles as "add a password"
    async function sendSetupLink() {
        const { error, retryAfter } = await withRetryAfter((fetchOptions) =>
            authClient.requestPasswordReset({ email, redirectTo: "/reset-password", fetchOptions }),
        );
        if (error) {
            setError(authErrorMessage(error));
            return retryAfter ?? 0;
        }
        toast.success("Link sent. In development it is printed in the server console.");
    }

    if (!hasPassword) {
        const via = providers.map((p) => PROVIDER_NAMES[p] ?? p).join(" and ");
        return (
            <Section title="Password">
                <Notice tone="error">{error}</Notice>
                <p className={styles.lead}>
                    You sign in with {via}. Add a password to also sign in with your email, and to turn on two-factor
                    authentication.
                </p>
                <CountdownButton storageKey={`reset:${email}`} onSend={sendSetupLink} className={`${chrome.btn} ${chrome.btnGhost}`}>
                    Email me a link to set one
                </CountdownButton>
            </Section>
        );
    }

    return (
        <Section title="Password">
            <Notice tone="error">{error}</Notice>
            <form className={styles.form} onSubmit={change}>
                <PasswordField label="Current password" name="current" autoComplete="current-password" required />
                <PasswordField label="New password" name="new" autoComplete="new-password" minLength={12} required hint="At least 12 characters." />
                <label className={styles.check}>
                    <input type="checkbox" name="revoke" defaultChecked /> Sign out of my other devices
                </label>
                <button type="submit" className={`${chrome.btn} ${chrome.btnGhost}`} disabled={pending}>
                    {pending ? "Saving…" : "Change password"}
                </button>
            </form>
        </Section>
    );
}
