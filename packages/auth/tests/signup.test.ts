import { after, test } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@mathscript/postgres";

import { cleanup, client, freshEmail, lastEmail, linkIn, outbox, strongPassword } from "./test_harness.ts";

after(() => cleanup());

test("sign-up needs a verified email, and verifying does not sign in", async () => {
    const c = client();
    const email = freshEmail();
    const password = strongPassword();

    const up = await c.call("/sign-up/email", { email, password, name: "Tester", callbackURL: "/sign-in?verified=1" });
    assert.equal(up.status, 200);
    assert.equal(up.json.token, null);
    assert.equal(c.has("session_token"), false);

    const early = await c.call("/sign-in/email", { email, password });
    assert.equal(early.status, 403);
    assert.equal(early.json.code, "EMAIL_NOT_VERIFIED");
    assert.equal(outbox.filter((e) => e.to === email).length, 2, "signing in unverified re-sends the link");

    const verify = await c.call(linkIn(lastEmail(email)));
    assert.equal(verify.status, 302);
    assert.equal(verify.headers.get("location"), "/sign-in?verified=1");
    assert.equal(c.has("session_token"), false);
    assert.equal((await prisma.user.findUnique({ where: { email } }))?.emailVerified, true);

    // Back/forward or a second click on an old link is harmless
    assert.equal((await c.call(linkIn(lastEmail(email)))).status, 302);

    assert.equal((await c.call("/sign-in/email", { email, password: password + "x" })).status, 401);
    assert.equal((await c.call("/sign-in/email", { email, password })).status, 200);
    assert.equal((await c.call("/get-session")).json?.user.email, email);

    assert.equal((await c.call("/sign-out", {})).status, 200);
    assert.equal((await c.call("/get-session")).json, null);
});

test("a duplicate sign-up looks like a new one and only warns the owner", async () => {
    const email = freshEmail();
    const original = strongPassword();
    const owner = client();
    await owner.call("/sign-up/email", { email, password: original, name: "Owner" });

    const intruder = strongPassword();
    const dupe = await client().call("/sign-up/email", { email, password: intruder, name: "Intruder" });
    assert.equal(dupe.status, 200);
    assert.equal(dupe.json.token, null);
    assert.equal(dupe.json.user.email, email);

    assert.equal(await prisma.user.count({ where: { email } }), 1);
    assert.match(lastEmail(email).subject, /already have/);

    await owner.call(outbox.find((e) => e.to === email && /Verify/.test(e.subject))!.body.match(/https?:\/\/\S+/)![0]);
    assert.equal((await client().call("/sign-in/email", { email, password: intruder })).status, 401);
    assert.equal((await client().call("/sign-in/email", { email, password: original })).status, 200);
});

test("concurrent duplicate sign-ups create exactly one user", async () => {
    const email = freshEmail();
    const results = await Promise.all(
        Array.from({ length: 3 }, () =>
            client().call("/sign-up/email", { email, password: strongPassword(), name: "Racer" }),
        ),
    );

    assert.equal(await prisma.user.count({ where: { email } }), 1);
    assert.ok(results.every((r) => r.status < 500), `statuses: ${results.map((r) => r.status)}`);
});

test("resend is generic for unknown emails and rate limited per IP", async () => {
    const c = client();
    const statuses: number[] = [];
    let retryAfter: string | null = null;

    for (let i = 0; i < 4; i++) {
        const res = await c.call("/send-verification-email", { email: freshEmail() });
        statuses.push(res.status);
        if (res.status === 429) retryAfter = res.headers.get("x-retry-after");
        else assert.deepEqual(res.json, { status: true });
    }

    assert.deepEqual(statuses, [200, 200, 200, 429]);
    assert.ok(Number(retryAfter) > 0, "429 carries X-Retry-After for the countdown");
});
