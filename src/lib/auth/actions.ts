"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "./server";
import { getAccountSession } from "./session";

/**
 * Signs out one of the caller's other devices by session id.
 *
 * @param id string
 */
export async function revokeSessionAction(id: string) {
    if (!(await getAccountSession())) return;

    const requestHeaders = await headers();
    // listSessions only returns the caller's own sessions, so an id from someone else matches nothing
    const target = (await auth.api.listSessions({ headers: requestHeaders })).find((s) => s.id === id);
    if (target) await auth.api.revokeSession({ headers: requestHeaders, body: { token: target.token } });

    revalidatePath("/account");
}
