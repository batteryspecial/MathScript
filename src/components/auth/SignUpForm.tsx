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

export function SignUpForm({ next }: { next: string }) {
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email"));

        setPending(true);
        setError(null);
        const { error } = await authClient.signUp.email({
            name: String(form.get("name")),
            email,
            password: String(form.get("password")),
        });

        if (error) {
            setError(authErrorMessage(error));
            setPending(false);
            return;
        }

        // A taken email answers exactly like a new one, so this page can't tell them apart either.
        // replace(): Back must not return to a form that would re-submit the same sign-up.
        startCooldown(`verify:${email}`, 30);
        window.location.replace(`/verify-email?email=${encodeURIComponent(email)}`);
    }

    return (
        <>
            <Notice tone="error">{error}</Notice>

            <form className={styles.form} onSubmit={submit}>
                <Field label="Name" name="name" autoComplete="name" required autoFocus />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
                <PasswordField
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    hint="At least 12 characters. Passwords found in known breaches are rejected."
                />
                <button type="submit" className={chrome.btn} disabled={pending}>
                    {pending ? "Creating account…" : "Create account"}
                </button>
            </form>

            <div className={styles.divider}>or</div>
            <SocialButtons next={next} />

            <div className={styles.links}>
                <span />
                <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>Already have an account?</Link>
            </div>
        </>
    );
}
