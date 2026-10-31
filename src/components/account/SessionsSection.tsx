"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import chrome from "@/app/landing.module.css";
import styles from "@/components/auth/auth.module.css";
import { revokeSessionAction } from "@/lib/auth/actions";
import { authClient } from "@/lib/auth/client";

import { Badge, Section } from "./Section";

interface Device {
    id: string;
    device: string;
    ipAddress: string | null;
    lastActive: string;
    current: boolean;
}

export function SessionsSection({ sessions }: { sessions: Device[] }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const revokeOthers = () =>
        startTransition(async () => {
            const { error } = await authClient.revokeOtherSessions();
            if (error) toast.error("Couldn't sign out your other devices. Try again.");
            router.refresh();
        });

    return (
        <Section title="Devices">
            <div className={styles.rows}>
                {sessions.map((s) => (
                    <div key={s.id} className={styles.row}>
                        <span>
                            {s.device}
                            <br />
                            <span className={styles.rowMeta}>
                                {s.ipAddress ?? "Unknown IP"} · active {formatDistanceToNow(new Date(s.lastActive), { addSuffix: true })}
                            </span>
                        </span>
                        {s.current ? (
                            <Badge on>This device</Badge>
                        ) : (
                            <button
                                type="button"
                                className={`${chrome.btn} ${chrome.btnGhost}`}
                                disabled={pending}
                                onClick={() => startTransition(() => revokeSessionAction(s.id))}
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {sessions.length > 1 && (
                <div className={styles.links}>
                    <span />
                    <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} disabled={pending} onClick={revokeOthers}>
                        Sign out of all other devices
                    </button>
                </div>
            )}
        </Section>
    );
}
