import { after, test } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@mathscript/postgres";

import { cleanup, client, codeIn, lastEmail, signedInUser, totp } from "./test_harness.ts";

after(() => cleanup());

test("2FA: enabling needs the password and a code, then sign-in is challenged", async () => {
    const c = client();
    const { email, password, id } = await signedInUser(c);

    assert.equal((await c.call("/two-factor/enable", { password: "wrong-password!" })).status, 400);

    const enable = await c.call("/two-factor/enable", { password });
    assert.equal(enable.status, 200);
    const { totpURI, backupCodes } = enable.json;
    assert.equal(backupCodes.length, 10);
    assert.equal((await prisma.user.findUnique({ where: { id } }))?.twoFactorEnabled, false, "pending until a code is verified");

    assert.notEqual((await c.call("/two-factor/verify-totp", { code: "000000" })).status, 200);
    assert.equal((await c.call("/two-factor/verify-totp", { code: totp(totpURI) })).status, 200);
    assert.equal((await prisma.user.findUnique({ where: { id } }))?.twoFactorEnabled, true);

    // Email code
    await c.call("/sign-out", {});
    const challenged = await c.call("/sign-in/email", { email, password });
    assert.equal(challenged.json.twoFactorRedirect, true);
    assert.equal(c.has("session_token"), false);
    assert.equal((await c.call("/get-session")).json, null, "no session until the second factor");

    assert.equal((await c.call("/two-factor/send-otp", {})).status, 200);
    assert.equal((await c.call("/two-factor/verify-otp", { code: codeIn(lastEmail(email)) })).status, 200);
    assert.equal((await c.call("/get-session")).json?.user.email, email);

    // Backup code, single use
    await c.call("/sign-out", {});
    await c.call("/sign-in/email", { email, password });
    assert.equal((await c.call("/two-factor/verify-backup-code", { code: backupCodes[0] })).status, 200);

    await c.call("/sign-out", {});
    await c.call("/sign-in/email", { email, password });
    assert.notEqual((await c.call("/two-factor/verify-backup-code", { code: backupCodes[0] })).status, 200);
});

test("2FA challenge without the sign-in cookie is rejected", async () => {
    const res = await client().call("/two-factor/verify-otp", { code: "123456" });
    assert.equal(res.status, 401);
});
