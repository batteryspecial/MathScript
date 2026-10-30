// Integration against DATABASE_URL. Every user created here is deleted in after().
import { after, test } from "node:test";
import assert from "node:assert/strict";

import { createProject, prisma } from "@mathscript/postgres";

import { call, freshEmail, strongPassword } from "./harness.ts";

const created: string[] = [];

after(async () => {
    await prisma.user.deleteMany({ where: { id: { in: created } } });
    await prisma.$disconnect();
});

test("sign up, sign out, wrong password, right password", async () => {
    const email = freshEmail();
    const password = strongPassword();

    const up = await call("/sign-up/email", { email, password, name: "Tester" });
    assert.equal(up.status, 200);
    assert.ok(up.cookie, "sign-up should start a session");
    created.push(up.json.user.id);

    const out = await call("/sign-out", {}, up.cookie);
    assert.equal(out.status, 200);
    const stale = await call("/get-session", undefined, up.cookie);
    assert.equal(stale.json, null, "old cookie must stop working after sign-out");

    const wrong = await call("/sign-in/email", { email, password: password + "x" });
    assert.equal(wrong.status, 401);
    assert.equal(wrong.cookie, undefined);

    const right = await call("/sign-in/email", { email, password });
    assert.equal(right.status, 200);
    const session = await call("/get-session", undefined, right.cookie);
    assert.equal(session.json?.user.email, email);
});

test("anonymous projects follow the user through sign-up", async () => {
    const anon = await call("/sign-in/anonymous", {});
    assert.equal(anon.status, 200);
    const anonId = anon.json.user.id;
    created.push(anonId);

    const { id: projectId } = await createProject(anonId, "anon work");

    const up = await call(
        "/sign-up/email",
        { email: freshEmail(), password: strongPassword(), name: "Converted" },
        anon.cookie,
    );
    assert.equal(up.status, 200);
    created.push(up.json.user.id);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    assert.equal(project?.userId, up.json.user.id);
    // Kept alive on purpose, the reaper collects it later
    assert.ok(await prisma.user.findUnique({ where: { id: anonId } }));
});
