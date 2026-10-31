import { createHmac, randomInt, randomUUID } from "node:crypto";

import { prisma } from "@mathscript/postgres";

import { buildAuth, type AuthEmail } from "../src/index.ts";

const BASE = "http://localhost:3000";

export const outbox: AuthEmail[] = [];

export const auth = buildAuth({
    baseURL: BASE,
    secret: process.env.BETTER_AUTH_SECRET!,
    google: { clientId: "test", clientSecret: "test" },
    github: { clientId: "test", clientSecret: "test" },
    sendEmail: async (email) => {
        outbox.push(email);
    },
});

const created = new Set<string>();

export function freshEmail() {
    const email = `test-${randomUUID()}@mathscript.test`;
    created.add(email);
    return email;
}

// Random UUIDs are never in the breach corpus
export const strongPassword = () => randomUUID();

/** Deletes only this file's users; test files run in parallel against the same database. */
export async function cleanup(anonymousIds: string[] = []) {
    await prisma.user.deleteMany({
        where: { OR: [{ email: { in: [...created] } }, { id: { in: anonymousIds } }] },
    });
    await prisma.$disconnect();
}

/** The newest email sent to an address. */
export function lastEmail(to: string) {
    const email = outbox.findLast((e) => e.to === to);
    if (!email) throw new Error(`no email sent to ${to}`);
    return email;
}

export const linkIn = (email: AuthEmail) => email.body.match(/https?:\/\/\S+/)![0];
export const codeIn = (email: AuthEmail) => email.body.match(/\b\d{6}\b/)![0];

/**
 * A browser stand-in: its own cookie jar and client IP, so rate-limit buckets don't collide across tests.
 *
 * @param ip string
 */
export function client(ip = `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`) {
    const jar = new Map<string, string>();

    async function call(pathOrUrl: string, body?: object) {
        const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE}/api/auth${pathOrUrl}`;
        const res = await auth.handler(
            new Request(url, {
                method: body ? "POST" : "GET",
                headers: {
                    "content-type": "application/json",
                    origin: BASE,
                    "x-forwarded-for": ip,
                    cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
                },
                body: body ? JSON.stringify(body) : undefined,
                redirect: "manual",
            }),
        );

        for (const header of res.headers.getSetCookie()) {
            const [pair] = header.split(";");
            const eq = pair.indexOf("=");
            const [name, value] = [pair.slice(0, eq), pair.slice(eq + 1)];
            if (!value || /max-age=0/i.test(header)) jar.delete(name);
            else jar.set(name, value);
        }

        const json = await res.json().catch(() => null);
        return { status: res.status, json, headers: res.headers };
    }

    const has = (cookie: string) => [...jar.keys()].some((name) => name.endsWith(cookie));
    return { call, has, ip };
}

/**
 * RFC 6238 code for the secret inside an otpauth:// URI, as an authenticator app would compute it.
 *
 * @param totpURI string
 * @returns 6-digit code
 */
export function totp(totpURI: string) {
    const secret = new URL(totpURI).searchParams.get("secret")!;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const bits = [...secret.replace(/=+$/, "")]
        .map((c) => alphabet.indexOf(c).toString(2).padStart(5, "0"))
        .join("");
    const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));

    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
    const mac = createHmac("sha1", key).update(counter).digest();
    const offset = mac[mac.length - 1] & 0xf;
    return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

/**
 * Signs up, verifies and signs in through the real endpoints.
 *
 * @param c client
 * @returns the account's credentials
 */
export async function signedInUser(c: ReturnType<typeof client>) {
    const email = freshEmail();
    const password = strongPassword();

    await c.call("/sign-up/email", { email, password, name: "Tester", callbackURL: "/sign-in?verified=1" });
    await c.call(linkIn(lastEmail(email)));
    const res = await c.call("/sign-in/email", { email, password });
    if (res.status !== 200) throw new Error(`sign-in failed: ${res.status}`);
    return { email, password, id: res.json.user.id as string };
}
