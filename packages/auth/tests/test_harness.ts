import { randomUUID } from "node:crypto";

import { buildAuth } from "../src/index.ts";

const BASE = "http://localhost:3000";

export const auth = buildAuth({
    baseURL: BASE,
    secret: process.env.BETTER_AUTH_SECRET!,
    google: { clientId: "test", clientSecret: "test" },
    github: { clientId: "test", clientSecret: "test" },
    sendEmail: async () => {},
});

export const freshEmail = () => `test-${randomUUID()}@mathscript.test`;
// Random UUIDs are never in the breach corpus
export const strongPassword = () => randomUUID();

/** POSTs (or GETs, without a body) through the real handler, as a browser would. */
export async function call(path: string, body?: object, cookie?: string) {
    const res = await auth.handler(
        new Request(`${BASE}/api/auth${path}`, {
            method: body ? "POST" : "GET",
            headers: {
                "content-type": "application/json",
                origin: BASE,
                ...(cookie ? { cookie } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        }),
    );
    const json = await res.json().catch(() => null);
    return { status: res.status, json, cookie: sessionCookie(res) ?? cookie };
}

function sessionCookie(res: Response) {
    return res.headers
        .getSetCookie()
        .map((c) => c.split(";")[0])
        .find((c) => c.startsWith("better-auth.session_token=") && !c.endsWith("="));
}
