"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { renderSVG } from "uqr";

import chrome from "@/app/landing.module.css";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { CodeField, PasswordField } from "./Field";
import { Notice } from "./Notice";
import styles from "./auth.module.css";

type Step = { name: "password" } | { name: "scan"; totpURI: string; backupCodes: string[] } | { name: "codes"; backupCodes: string[] };

/**
 * Password → scan + confirm a code → save backup codes. 2FA only turns on at the confirm step.
 *
 * @param onDone called after the user has saved their backup codes
 */
export function TwoFactorSetup({ onDone }: { onDone: () => void }) {
    const [step, setStep] = useState<Step>({ name: "password" });
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    // A reload before the confirm step is harmless: enable() replaces the pending secret next time.
    async function enable(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setError(null);
        const { data, error } = await authClient.twoFactor.enable({
            password: String(new FormData(event.currentTarget).get("password")),
        });
        setPending(false);
        if (error || !data) return setError(authErrorMessage(error));
        setStep({ name: "scan", totpURI: data.totpURI, backupCodes: data.backupCodes });
    }

    async function confirm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (step.name !== "scan") return;
        setPending(true);
        setError(null);
        const { error } = await authClient.twoFactor.verifyTotp({
            code: String(new FormData(event.currentTarget).get("code")).trim(),
        });
        setPending(false);
        if (error) return setError(authErrorMessage(error));
        setStep({ name: "codes", backupCodes: step.backupCodes });
    }

    return (
        <>
            <Notice tone="error">{error}</Notice>

            {step.name === "password" && (
                <form className={styles.form} onSubmit={enable}>
                    <PasswordField label="Confirm your password" name="password" autoComplete="current-password" required autoFocus />
                    <button type="submit" className={chrome.btn} disabled={pending}>
                        {pending ? "Checking…" : "Continue"}
                    </button>
                </form>
            )}

            {step.name === "scan" && (
                <form className={styles.form} onSubmit={confirm}>
                    <p className={styles.lead}>
                        Scan this with an authenticator app (1Password, Google Authenticator, Authy…), then enter the
                        6-digit code it shows.
                    </p>
                    <TotpQr uri={step.totpURI} />
                    <CodeField label="Code from your app" name="code" autoFocus />
                    <button type="submit" className={chrome.btn} disabled={pending}>
                        {pending ? "Verifying…" : "Turn on 2FA"}
                    </button>
                </form>
            )}

            {step.name === "codes" && <BackupCodes codes={step.backupCodes} onDone={onDone} />}
        </>
    );
}

function TotpQr({ uri }: { uri: string }) {
    const svg = useMemo(() => renderSVG(uri, { border: 0 }), [uri]);
    const secret = new URL(uri).searchParams.get("secret") ?? "";

    return (
        <>
            {/* svg is generated locally from our own otpauth URI, never from user input */}
            <div className={styles.qr} dangerouslySetInnerHTML={{ __html: svg }} />
            <span className={styles.hint}>Can't scan? Enter this key instead:</span>
            <span className={styles.secret}>{secret.match(/.{1,4}/g)?.join(" ")}</span>
        </>
    );
}

/**
 * Shows recovery codes once, and won't let the user leave by accident before saving them.
 *
 * @param codes string[]
 * @param onDone called once the user confirms they saved them
 */
export function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (saved) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [saved]);

    const text = codes.join("\n");
    const download = () => {
        const url = URL.createObjectURL(new Blob([`MathScript backup codes\n\n${text}\n`], { type: "text/plain" }));
        Object.assign(document.createElement("a"), { href: url, download: "mathscript-backup-codes.txt" }).click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.form}>
            <p className={styles.lead}>
                Save these backup codes somewhere safe. Each one signs you in once if you lose your authenticator.
                They won't be shown again.
            </p>
            <ul className={styles.codes}>
                {codes.map((code) => (
                    <li key={code}>{code}</li>
                ))}
            </ul>
            <div className={styles.actions}>
                <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={() => navigator.clipboard.writeText(text)}>
                    Copy
                </button>
                <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={download}>
                    Download
                </button>
            </div>
            <label className={styles.check}>
                <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} /> I've saved my backup codes
            </label>
            <div className={styles.actions}>
                <button type="button" className={chrome.btn} disabled={!saved} onClick={onDone}>
                    Done
                </button>
            </div>
        </div>
    );
}
