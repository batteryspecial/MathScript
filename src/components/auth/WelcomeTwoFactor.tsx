"use client";

import { TwoFactorSetup } from "./TwoFactorSetup";

export function WelcomeTwoFactor() {
    return <TwoFactorSetup onDone={() => window.location.assign("/projects")} />;
}
