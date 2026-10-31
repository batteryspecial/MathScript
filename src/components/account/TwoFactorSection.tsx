"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import chrome from "@/app/landing.module.css";
import { PasswordField } from "@/components/auth/Field";
import { Notice } from "@/components/auth/Notice";
import { BackupCodes, TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import styles from "@/components/auth/auth.module.css";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { Badge, Section } from "./Section";

type Mode = null | "setup" | "disable" | "regenerate";

export function TwoFactorSection({ enabled, hasPassword }: { enabled: boolean; hasPassword: boolean }) {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>(null);
    const [codes, setCodes] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const close = () => {
        setMode(null);
        setCodes(null);
        setError(null);
        router.refresh();
    };

    async function confirmPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const password = String(new FormData(event.currentTarget).get("password"));
        setPending(true);
        setError(null);

        if (mode === "disable") {
            const { error } = await authClient.twoFactor.disable({ password });
            setPending(false);
            if (error) return setError(authErrorMessage(error));
            toast.success("Two-factor authentication is off");
            return close();
        }

        const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
        setPending(false);
        if (error || !data) return setError(authErrorMessage(error));
        setCodes(data.backupCodes);
    }

    const badge = <Badge on={enabled}>{enabled ? "On" : "Off"}</Badge>;

    if (!hasPassword) {
        return (
            <Section title="Two-factor authentication" badge={badge}>
                <p className={styles.lead}>Add a password first. Sign-ins through Google or GitHub use that provider's own 2FA.</p>
            </Section>
        );
    }

    return (
        <Section title="Two-factor authentication" badge={badge}>
            <Notice tone="error">{error}</Notice>

            {mode === null && (
                <>
                    <p className={styles.lead}>
                        {enabled
                            ? "Signing in with your password also asks for a code from your authenticator app, your email, or a backup code."
                            : "Ask for a second code whenever someone signs in with your password."}
                    </p>
                    <div className={styles.actions}>
                        {enabled ? (
                            <>
                                <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => setMode("regenerate")}>
                                    New backup codes
                                </button>
                                <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => setMode("disable")}>
                                    Turn off
                                </button>
                            </>
                        ) : (
                            <button type="button" className={chrome.btn} onClick={() => setMode("setup")}>
                                Turn on
                            </button>
                        )}
                    </div>
                </>
            )}

            {mode === "setup" && <TwoFactorSetup onDone={close} />}

            {codes && <BackupCodes codes={codes} onDone={close} />}

            {(mode === "disable" || mode === "regenerate") && !codes && (
                <form className={styles.form} onSubmit={confirmPassword}>
                    <p className={styles.lead}>
                        {mode === "disable"
                            ? "Turning this off removes your authenticator and backup codes."
                            : "Your old backup codes stop working as soon as new ones are made."}
                    </p>
                    <PasswordField label="Confirm your password" name="password" autoComplete="current-password" required autoFocus />
                    <div className={styles.actions}>
                        <button type="submit" className={chrome.btn} disabled={pending}>
                            {mode === "disable" ? "Turn off 2FA" : "Make new codes"}
                        </button>
                        <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => setMode(null)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {mode === "setup" && (
                <div className={styles.links}>
                    <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => setMode(null)}>
                        Cancel
                    </button>
                </div>
            )}
        </Section>
    );
}
