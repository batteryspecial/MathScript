"use client";

import Link from "next/link";
import { useState } from "react";

import chrome from "@/app/landing.module.css";
import { PasswordField } from "@/components/auth/Field";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";

import { Section } from "./Section";

/**
 * Three gates: type your name, re-enter your password, then one last confirmation.
 *
 * @param name the user's display name, which they must type exactly
 * @param hasPassword OAuth-only accounts can't pass the password gate
 */
export function DeleteAccountSection({ name, hasPassword }: { name: string; hasPassword: boolean }) {
    const [asking, setAsking] = useState(false);
    const [typed, setTyped] = useState("");
    const [confirming, setConfirming] = useState(false);

    const matches = typed.trim() === name.trim();
    const proceed = () => {
        if (!matches) return;
        setAsking(false);
        setConfirming(true);
    };

    return (
        <Section title="Delete account">
            <p className="mb-6 text-(--ms-sb-text)">
                {hasPassword
                    ? "Permanently deletes your account, every project, file and cell in it, and signs out every device. This cannot be undone."
                    : "Add a password first. Deleting your account requires confirming it."}
            </p>
            <Button
                variant="destructive"
                disabled={!hasPassword}
                onClick={() => {
                    setTyped("");
                    setAsking(true);
                }}
            >
                Delete account
            </Button>

            <Dialog open={asking} onOpenChange={setAsking}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete your account?</DialogTitle>
                        <DialogDescription>
                            Type <strong>{name}</strong> to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && proceed()}
                        autoComplete="off"
                        aria-label="Your name"
                        autoFocus
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAsking(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" disabled={!matches} onClick={proceed}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {confirming && <ConfirmDeletion onCancel={() => setConfirming(false)} />}
        </Section>
    );
}

function ConfirmDeletion({ onCancel }: { onCancel: () => void }) {
    const [password, setPassword] = useState("");

    async function deleteAccount() {
        const { error } = await authClient.deleteUser({ password });
        if (error) return { error: true, message: authErrorMessage(error) ?? undefined };

        // Full navigation: the session cookie is already gone and every server-rendered view is stale
        window.location.assign("/");
        return { error: false };
    }

    return (
        // Covers the dashboard, sticky nav included. Client state, not a route, so it can't be linked to or reloaded into.
        <div className={`${chrome.page} fixed inset-0 z-20`} role="dialog" aria-modal="true" aria-labelledby="confirm-delete">
            <header className={chrome.nav}>
                <nav className={chrome.navInner}>
                    <Link href="/" className={chrome.wordmark}>
                        Math<span>Script</span>
                    </Link>
                </nav>
            </header>
            <main className={chrome.inner}>
                <div className="mx-auto max-w-96 pt-12 pb-16">
                    <h1 id="confirm-delete" className="mb-1.5 font-(family-name:--ms-font-body) text-[1.75rem] font-normal text-(--ms-sb-bright)">
                        Confirm it&apos;s you
                    </h1>
                    <p className="mb-6 text-(--ms-sb-text)">Enter your password to delete your account. This is your last chance to back out.</p>

                    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                        <PasswordField
                            label="Password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                        <div className="flex flex-wrap items-center gap-2.5">
                            <ActionButton
                                action={deleteAccount}
                                requireAreYouSure
                                areYouSureDescription="Your account and everything in it will be deleted immediately. This cannot be undone."
                                variant="destructive"
                                disabled={!password}
                            >
                                Verify and delete
                            </ActionButton>
                            <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={onCancel}>
                                Keep my account
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
