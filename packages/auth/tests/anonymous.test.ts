import { after, test } from "node:test";
import assert from "node:assert/strict";

import { createProject, prisma } from "@mathscript/postgres";

import { cleanup, client, codeIn, freshEmail, lastEmail, linkIn, signedInUser, strongPassword, totp } from "./test_harness.ts";

const anonymous: string[] = [];
after(() => cleanup(anonymous));

async function anonymousWithProject(c: ReturnType<typeof client>) {
    const anon = await c.call("/sign-in/anonymous", {});
    anonymous.push(anon.json.user.id);
    const { id } = await createProject(anon.json.user.id, "anon work");
    return { anonId: anon.json.user.id as string, projectId: id };
}

const ownerOf = async (projectId: string) =>
    (await prisma.project.findUnique({ where: { id: projectId } }))?.userId;

test("anonymous work follows sign-up through verification and the first sign-in", async () => {
    const c = client();
    const { anonId, projectId } = await anonymousWithProject(c);

    const email = freshEmail();
    const password = strongPassword();
    await c.call("/sign-up/email", { email, password, name: "Converted" });
    await c.call(linkIn(lastEmail(email)));
    assert.equal(await ownerOf(projectId), anonId, "nothing moves before the user proves the password");

    const signIn = await c.call("/sign-in/email", { email, password });
    assert.equal(await ownerOf(projectId), signIn.json.user.id);
    assert.ok(await prisma.user.findUnique({ where: { id: anonId } }), "kept for the reaper");
});

test("anonymous work follows a 2FA sign-in", async () => {
    const owner = client();
    const account = await signedInUser(owner);
    const { totpURI } = (await owner.call("/two-factor/enable", { password: account.password })).json;
    await owner.call("/two-factor/verify-totp", { code: totp(totpURI) });

    const c = client();
    const { anonId, projectId } = await anonymousWithProject(c);

    const challenged = await c.call("/sign-in/email", { email: account.email, password: account.password });
    assert.equal(challenged.json.twoFactorRedirect, true);
    assert.equal(await ownerOf(projectId), anonId, "password alone must not move work into the account");

    await c.call("/two-factor/send-otp", {});
    assert.equal((await c.call("/two-factor/verify-otp", { code: codeIn(lastEmail(account.email)) })).status, 200);
    assert.equal(await ownerOf(projectId), account.id);
    assert.equal(c.has("anon_link"), false);
});
