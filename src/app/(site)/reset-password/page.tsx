import { AuthPage } from "@/components/auth/AuthPage";
import { InvalidResetLink, ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

// The API validates the emailed link first and lands here with ?token= or ?error=INVALID_TOKEN
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
    const { token, error } = await searchParams;

    return (
        <AuthPage title="Choose a new password">
            {token && !error ? <ResetPasswordForm token={token} /> : <InvalidResetLink />}
        </AuthPage>
    );
}
