import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

const COOKIE = "anon_link";
const TWO_FACTOR_VERIFY = ["/two-factor/verify-totp", "/two-factor/verify-otp", "/two-factor/verify-backup-code"];

/**
 * Carries an anonymous user's work through a 2FA sign-in, which the anonymous plugin never sees.
 *
 * @param link moves the anonymous user's data to the user who finished signing in
 * @returns BetterAuthPlugin
 */
export function linkAnonymousThroughTwoFactor(
    link: (anonymousId: string, userId: string) => Promise<void>,
): BetterAuthPlugin {
    return {
        id: "link-anonymous-through-two-factor",
        hooks: {
            after: [
                {
                    // The 2FA hook has already deleted the anonymous session cookie by now, but the request
                    // still carries it. Stash the id in a signed cookie that outlives the 10 minute challenge.
                    matcher: (ctx) => ctx.path === "/sign-in/email",
                    handler: createAuthMiddleware(async (ctx) => {
                        const session = await getSessionFromCtx(ctx, { disableRefresh: true });
                        if (!(session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous) return;

                        const cookie = ctx.context.createAuthCookie(COOKIE, { maxAge: 600 });
                        await ctx.setSignedCookie(cookie.name, session!.user.id, ctx.context.secret, cookie.attributes);
                    }),
                },
                {
                    matcher: (ctx) => TWO_FACTOR_VERIFY.includes(ctx.path ?? ""),
                    handler: createAuthMiddleware(async (ctx) => {
                        const cookie = ctx.context.createAuthCookie(COOKIE);
                        const anonymousId = await ctx.getSignedCookie(cookie.name, ctx.context.secret);
                        const signedIn = ctx.context.newSession;
                        if (!anonymousId || !signedIn) return;

                        await link(anonymousId, signedIn.user.id);
                        ctx.setCookie(cookie.name, "", { ...cookie.attributes, maxAge: 0 });
                    }),
                },
            ],
        },
    };
}
