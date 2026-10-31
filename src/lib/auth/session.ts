import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "./server";

// cache() dedupes the lookup across one request's layout, page and actions.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/**
 * For server actions that only touch existing data.
 */
export async function requireUserId() {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    return session.user.id;
}

/**
 * Mints an anonymous user on first write so work is owned from creation.
 * Server actions only: server components can't set the session cookie.
 */
export async function ensureUserId() {
    const session = await getSession();
    if (session) return session.user.id;

    const { user } = await auth.api.signInAnonymous({ headers: await headers() });
    return user.id;
}

/** A signed-in user's session; anonymous sessions don't count. */
export async function getAccountSession() {
    const session = await getSession();
    return session && !session.user.isAnonymous ? session : null;
}
