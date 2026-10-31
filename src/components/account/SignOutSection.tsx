"use client";

import chrome from "@/app/landing.module.css";
import { authClient } from "@/lib/auth/client";

import { Section } from "./Section";

export function SignOutSection() {
    async function signOut() {
        await authClient.signOut();
        window.location.assign("/");
    }

    return (
        <Section title="Sign out">
            <button type="button" className={`${chrome.btn} ${chrome.btnGhost}`} onClick={signOut}>
                Sign out of this device
            </button>
        </Section>
    );
}
