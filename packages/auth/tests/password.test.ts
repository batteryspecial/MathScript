// Blackbox: weak passwords are rejected before a user row is ever written.
import { after, test } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@mathscript/postgres";

import { call, freshEmail } from "./harness.ts";

after(() => prisma.$disconnect());

test("rejects a password under 12 characters", async () => {
    const email = freshEmail();
    const res = await call("/sign-up/email", { email, password: "Sh0rt!", name: "t" });

    assert.equal(res.status, 400);
    assert.equal(res.json?.code, "PASSWORD_TOO_SHORT");
    assert.equal(await prisma.user.count({ where: { email } }), 0);
});

test("rejects a long but breached password", async () => {
    const email = freshEmail();
    const res = await call("/sign-up/email", { email, password: "password1234", name: "t" });

    assert.equal(res.status, 400);
    assert.equal(res.json?.code, "PASSWORD_COMPROMISED");
    assert.equal(await prisma.user.count({ where: { email } }), 0);
});
