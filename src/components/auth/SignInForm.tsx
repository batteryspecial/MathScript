"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import chrome from "@/app/landing.module.css";
import { startCooldown } from "@/components/ui/countdown-button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { Field, PasswordField } from "./Field";
import { Notice } from "./Notice";
import { SocialButtons } from "./SocialButtons";
import styles from "./auth.module.css";

const BANNERS: Record<string, string> = {
    verified: "Email verified. Sign in to finish setting up your account.",
    reset: "Password updated. Sign in with your new password.",
    TOKEN_EXPIRED: "That verification link has expired. Sign in and we'll send you a new one.",
    INVALID_TOKEN: "That verification link is invalid. Sign in and we'll send you a new one.",
};
// OAuth failures land here with the provider's own ?error= code
const OAUTH_FAILED = "Couldn't sign in with that provider. Try again or use your email.";

export function SignInForm({ next, banner }: { next: string; banner?: string }) {
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    // First sign-in after verifying is the end of sign-up, so it continues to the 2FA prompt
    const destination = banner === "verified" ? "/welcome" : next;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email"));

        setPending(true);
        setError(null);
        const { data, error } = await authClient.signIn.email({ email, password: String(form.get("password")) });

        if (error?.code === "EMAIL_NOT_VERIFIED") {
            // The server just re-sent the link (sendOnSignIn), so the resend button starts cooling down
            startCooldown(`verify:${email}`, 30);
            window.location.assign(`/verify-email?email=${encodeURIComponent(email)}`);
            return;
        }
        if (error) {
            setError(authErrorMessage(error));
            setPending(false);
            return;
        }

        // Full navigation, not router.push: the shared layout's nav was rendered for a signed-out user
        if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
            window.location.assign(`/two-factor?next=${encodeURIComponent(destination)}`);
        } else {
            window.location.assign(destination);
        }
    }

    return (
        <>
            <Notice>{banner && (BANNERS[banner] ?? OAUTH_FAILED)}</Notice>
            <Notice tone="error">{error}</Notice>

            <form className={styles.form} onSubmit={submit}>
                <Field label="Email" name="email" type="email" autoComplete="email" required autoFocus />
                <PasswordField label="Password" name="password" autoComplete="current-password" required />
                <button type="submit" className={chrome.btn} disabled={pending}>
                    {pending ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <div className={styles.divider}>or</div>
            <SocialButtons next={next} />

            <div className={styles.links}>
                <Link href="/forgot-password">Forgot password?</Link>
                <Link href={`/sign-up?next=${encodeURIComponent(next)}`}>Create an account</Link>
            </div>
        </>
    );
}
