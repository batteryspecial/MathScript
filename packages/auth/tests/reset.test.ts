import { after, test } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@mathscript/postgres";

import { cleanup, client, freshEmail, lastEmail, linkIn, signedInUser, strongPassword } from "./test_harness.ts";

after(() => cleanup());

const tokenIn = (link: string) => link.match(/reset-password\/([^?]+)/)![1];

test("reset replaces the password, works once, and signs out everywhere", async () => {
    const browser = client();
    const { email, password } = await signedInUser(browser);

    const unknown = await client().call("/request-password-reset", { email: freshEmail(), redirectTo: "/reset-password" });
    const known = await client().call("/request-password-reset", { email, redirectTo: "/reset-password" });
    assert.deepEqual(unknown.json, known.json, "same answer whether or not the account exists");

    const link = linkIn(lastEmail(email));
    const landing = await client().call(link);
    assert.equal(landing.status, 302);
    assert.match(landing.headers.get("location")!, /\/reset-password\?token=/);

    const fresh = strongPassword();
    const token = tokenIn(link);
    assert.equal((await client().call("/reset-password", { newPassword: fresh, token })).status, 200);

    const replay = await client().call("/reset-password", { newPassword: strongPassword(), token });
    assert.equal(replay.status, 400);
    assert.equal(replay.json.code, "INVALID_TOKEN");

    assert.equal((await browser.call("/get-session")).json, null, "old sessions are revoked");
    assert.equal((await client().call("/sign-in/email", { email, password })).status, 401);
    assert.equal((await client().call("/sign-in/email", { email, password: fresh })).status, 200);
});

test("resetting reclaims an address someone else pre-registered", async () => {
    const email = freshEmail();
    const squatter = strongPassword();
    await client().call("/sign-up/email", { email, password: squatter, name: "Squatter" });

    await client().call("/request-password-reset", { email, redirectTo: "/reset-password" });
    const owner = strongPassword();
    await client().call("/reset-password", { newPassword: owner, token: tokenIn(linkIn(lastEmail(email))) });

    assert.equal((await prisma.user.findUnique({ where: { email } }))?.emailVerified, true);
    assert.equal((await client().call("/sign-in/email", { email, password: squatter })).status, 401);
    assert.equal((await client().call("/sign-in/email", { email, password: owner })).status, 200);
});
