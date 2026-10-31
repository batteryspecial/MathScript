"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import chrome from "@/app/landing.module.css";
import { Field } from "@/components/auth/Field";
import { Notice } from "@/components/auth/Notice";
import styles from "@/components/auth/auth.module.css";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { Badge, Section } from "./Section";

export function ProfileSection({ name, email, emailVerified }: { name: string; email: string; emailVerified: boolean }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setError(null);
        const { error } = await authClient.updateUser({ name: String(new FormData(event.currentTarget).get("name")).trim() });
        setPending(false);
        if (error) return setError(authErrorMessage(error));
        toast.success("Name updated");
        router.refresh();
    }

    return (
        <Section title="Profile">
            <Notice tone="error">{error}</Notice>
            <form className={styles.form} onSubmit={submit}>
                <Field label="Name" name="name" defaultValue={name} autoComplete="name" required maxLength={100} />
                <div className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.actions}>
                        {email} <Badge on={emailVerified}>{emailVerified ? "Verified" : "Unverified"}</Badge>
                    </span>
                </div>
                <button type="submit" className={`${chrome.btn} ${chrome.btnGhost}`} disabled={pending}>
                    Save
                </button>
            </form>
        </Section>
    );
}
