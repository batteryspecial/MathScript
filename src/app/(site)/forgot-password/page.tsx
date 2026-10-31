import { AuthPage } from "@/components/auth/AuthPage";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; sent?: string }> }) {
    const { email, sent } = await searchParams;

    return (
        <AuthPage title="Reset your password" lead={sent ? undefined : "We'll email you a link to choose a new one."}>
            <ForgotPasswordForm email={email} sent={sent === "1"} />
        </AuthPage>
    );
}
