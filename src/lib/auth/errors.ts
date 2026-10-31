const MESSAGES: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "Wrong email or password.",
    INVALID_EMAIL: "Enter a valid email address.",
    INVALID_PASSWORD: "That password is incorrect.",
    PASSWORD_TOO_SHORT: "Use at least 12 characters.",
    PASSWORD_TOO_LONG: "That password is too long.",
    PASSWORD_COMPROMISED: "That password has appeared in a data breach. Choose a different one.",
    INVALID_TOKEN: "This link has expired or was already used.",
    TOKEN_EXPIRED: "This link has expired.",
    INVALID_CODE: "That code is incorrect.",
    OTP_HAS_EXPIRED: "That code has expired. Send a new one.",
    INVALID_BACKUP_CODE: "That backup code is incorrect or already used.",
    TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many wrong codes. Sign in again.",
    ACCOUNT_TEMPORARILY_LOCKED: "Too many failed attempts. Try again in 15 minutes.",
    INVALID_TWO_FACTOR_COOKIE: "Your sign-in timed out. Sign in again.",
};

export interface AuthError {
    code?: string;
    status?: number;
    message?: string;
}

export function authErrorMessage(error: AuthError | null | undefined) {
    if (!error) return null;
    if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
    return (error.code && MESSAGES[error.code]) || "Something went wrong. Try again.";
}

/**
 * Runs an auth client call and also reports the server's cooldown when it answers 429.
 *
 * @param call receives fetchOptions to pass through to the client method
 * @returns the call's result plus `retryAfter` in seconds, if the server sent one
 */
export async function withRetryAfter<T>(
    call: (fetchOptions: { onError: (ctx: { response: Response }) => void }) => Promise<T>,
) {
    let retryAfter: number | undefined;
    const result = await call({
        onError: ({ response }) => {
            const seconds = Number(response.headers.get("X-Retry-After"));
            if (seconds > 0) retryAfter = seconds;
        },
    });
    return { ...result, retryAfter };
}
