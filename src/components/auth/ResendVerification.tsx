"use client";

import { useState } from "react";

import chrome from "@/app/landing.module.css";
import { CountdownButton } from "@/components/ui/countdown-button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, withRetryAfter } from "@/lib/auth/errors";

import { Notice } from "./Notice";

export function ResendVerification({ email }: { email: string }) {
    const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);

    async function resend() {
        const { error, retryAfter } = await withRetryAfter((fetchOptions) =>
            authClient.sendVerificationEmail({ email, fetchOptions }),
        );
        if (error) {
            setMessage({ tone: "error", text: authErrorMessage(error)! });
            return retryAfter ?? 0;
        }
        setMessage({ tone: "info", text: "Sent. Check your inbox." });
    }

    return (
        <>
            {message && <Notice tone={message.tone}>{message.text}</Notice>}
            <CountdownButton storageKey={`verify:${email}`} onSend={resend} className={`${chrome.btn} ${chrome.btnGhost}`}>
                Resend email
            </CountdownButton>
        </>
    );
}
