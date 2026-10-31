"use client";

import { useState, type InputHTMLAttributes } from "react";

import styles from "./auth.module.css";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function Field({ label, hint, className, ...input }: FieldProps) {
    return (
        <label className={styles.field}>
            <span className={styles.label}>{label}</span>
            <input className={`${styles.input} ${className ?? ""}`} {...input} />
            {hint && <span className={styles.hint}>{hint}</span>}
        </label>
    );
}

export function PasswordField({ label, hint, ...input }: FieldProps) {
    const [shown, setShown] = useState(false);

    return (
        <label className={styles.field}>
            <span className={styles.label}>{label}</span>
            <span className={styles.inputRow}>
                <input className={styles.input} type={shown ? "text" : "password"} {...input} />
                <button
                    type="button"
                    className={styles.reveal}
                    onClick={() => setShown((s) => !s)}
                    aria-label={shown ? "Hide password" : "Show password"}
                >
                    {shown ? "Hide" : "Show"}
                </button>
            </span>
            {hint && <span className={styles.hint}>{hint}</span>}
        </label>
    );
}

/** Six-digit one-time code: numeric keypad on phones, autofill from SMS/email where the OS supports it. */
export function CodeField({ label, ...input }: FieldProps) {
    return (
        <Field
            label={label}
            className={styles.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            {...input}
        />
    );
}
