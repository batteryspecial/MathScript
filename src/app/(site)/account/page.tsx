import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PasswordSection } from "@/components/account/PasswordSection";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SessionsSection } from "@/components/account/SessionsSection";
import { SignOutSection } from "@/components/account/SignOutSection";
import { TwoFactorSection } from "@/components/account/TwoFactorSection";
import { AuthPage } from "@/components/auth/AuthPage";
import { auth } from "@/lib/auth/server";
import { getAccountSession } from "@/lib/auth/session";
import { describeDevice } from "@/lib/auth/device";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const session = await getAccountSession();
    if (!session) redirect("/sign-in?next=/account");

    const requestHeaders = await headers();
    const [accounts, sessions] = await Promise.all([
        auth.api.listUserAccounts({ headers: requestHeaders }),
        auth.api.listSessions({ headers: requestHeaders }),
    ]);
    const hasPassword = accounts.some((a) => a.providerId === "credential");
    const providers = accounts.filter((a) => a.providerId !== "credential").map((a) => a.providerId);

    // Tokens stay on the server; the client only ever sees ids
    const devices = sessions
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .map((s) => ({
            id: s.id,
            device: describeDevice(s.userAgent),
            ipAddress: s.ipAddress ?? null,
            lastActive: new Date(s.updatedAt).toISOString(),
            current: s.id === session.session.id,
        }));

    const { user } = session;
    return (
        <AuthPage title="Account" wide>
            <ProfileSection name={user.name} email={user.email} emailVerified={user.emailVerified} />
            <PasswordSection hasPassword={hasPassword} providers={providers} email={user.email} />
            <TwoFactorSection enabled={!!user.twoFactorEnabled} hasPassword={hasPassword} />
            <SessionsSection sessions={devices} />
            <SignOutSection />
        </AuthPage>
    );
}
