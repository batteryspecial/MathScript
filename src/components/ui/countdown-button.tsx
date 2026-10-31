"use client";

import { useEffect, useState, type ReactNode } from "react";

const MAX_SECONDS = 120;

function readDeadline(key: string) {
    try {
        const until = Number(sessionStorage.getItem(key));
        const left = until - Date.now();
        // A deadline further out than any we set is stale or tampered with. Dropping it is
        // what stops one bad entry from disabling the button for good.
        if (left > 0 && left <= MAX_SECONDS * 1000) return until;
        sessionStorage.removeItem(key);
    } catch {
        // Storage can be unavailable (private mode); the countdown just won't survive a reload
    }
    return 0;
}

/**
 * Begins a cooldown for a CountdownButton, e.g. right before navigating to the page that renders it.
 *
 * @param storageKey string
 * @param seconds number
 * @returns the deadline in epoch ms
 */
export function startCooldown(storageKey: string, seconds: number) {
    const until = Date.now() + Math.min(seconds, MAX_SECONDS) * 1000;
    try {
        sessionStorage.setItem(storageKey, String(until));
    } catch {}
    return until;
}

/**
 * Send button that disables itself while a cooldown runs. Cosmetic only: the server's rate limit decides.
 *
 * @param storageKey scope it per action and recipient, e.g. `verify:${email}`
 * @param onSend resolves to the cooldown to show, e.g. the server's X-Retry-After; undefined = `seconds`, 0 = none
 */
export function CountdownButton({
    storageKey,
    onSend,
    seconds = 30,
    className,
    children,
}: {
    storageKey: string;
    onSend: () => Promise<number | undefined>;
    seconds?: number;
    className?: string;
    children: ReactNode;
}) {
    const [until, setUntil] = useState(0);
    const [now, setNow] = useState(0);
    const [pending, setPending] = useState(false);

    // After mount, never during render: the server can't see storage, so reading it in render breaks hydration
    useEffect(() => {
        setUntil(readDeadline(storageKey));
        setNow(Date.now());
    }, [storageKey]);

    useEffect(() => {
        if (until <= Date.now()) return;
        const id = setInterval(() => {
            setNow(Date.now());
            if (Date.now() >= until) clearInterval(id);
        }, 250);
        return () => clearInterval(id);
    }, [until]);

    const remaining = Math.max(0, Math.ceil((until - now) / 1000));

    async function send() {
        setPending(true);
        try {
            const cooldown = (await onSend()) ?? seconds;
            if (cooldown > 0) {
                setUntil(startCooldown(storageKey, cooldown));
                setNow(Date.now());
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <button type="button" className={className} disabled={pending || remaining > 0} onClick={send}>
            {children}
            {remaining > 0 && ` (${remaining})`}
        </button>
    );
}
