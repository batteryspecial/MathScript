// Whitebox: every row a user owns, directly or through the cascade, is gone after deletion.
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import assert from "node:assert/strict";

import { createProject, prisma, saveDocument, saveTree } from "@mathscript/postgres";

import { cleanup, client, codeIn, lastEmail, signedInUser, totp } from "./test_harness.ts";

after(() => cleanup());

const META = { title: "t", titleOn: true, author: "", authorOn: true, date: "", dateOn: true, metaOn: true, colorLinksOn: false };

/** A project with nested folders, so the Node → Node self-cascade is exercised too. */
async function projectTree(userId: string) {
    const { id: projectId } = await createProject(userId, "doomed");
    const main = await prisma.node.findFirstOrThrow({ where: { projectId } });
    const [folder, inner, a, b] = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];

    await saveTree(userId, projectId, [
        { id: main.id, parentId: null, kind: "file", name: "main.ms", open: false },
        { id: folder, parentId: null, kind: "folder", name: "f", open: true },
        { id: a, parentId: folder, kind: "file", name: "a.ms", open: false },
        { id: inner, parentId: folder, kind: "folder", name: "g", open: true },
        { id: b, parentId: inner, kind: "file", name: "b.ms", open: false },
    ]);
    await saveDocument(userId, b, META, [
        { id: randomUUID(), type: "text", content: [{ type: "paragraph", children: [{ text: "x" }] }], equationContent: null, label: null },
        { id: randomUUID(), type: "equation", content: null, equationContent: "x^2", label: "eq" },
    ]);
    return projectId;
}

async function footprint(userId: string, projectId: string) {
    const nodes = await prisma.node.findMany({ where: { projectId }, select: { id: true } });
    const documents = await prisma.document.findMany({ where: { nodeId: { in: nodes.map((n) => n.id) } }, select: { id: true } });
    return {
        user: await prisma.user.count({ where: { id: userId } }),
        projects: await prisma.project.count({ where: { userId } }),
        nodes: nodes.length,
        documents: documents.length,
        cells: await prisma.cell.count({ where: { documentId: { in: documents.map((d) => d.id) } } }),
        sessions: await prisma.session.count({ where: { userId } }),
        accounts: await prisma.account.count({ where: { userId } }),
        twoFactor: await prisma.twoFactor.count({ where: { userId } }),
        verifications: await prisma.verification.count({ where: { value: userId } }),
    };
}

test("deleting an account removes everything it owns and nothing else", async () => {
    const c = client();
    const user = await signedInUser(c);

    // 2FA row, then a trusted device and a pending reset token: three kinds of rows outside the FK graph
    const { totpURI } = (await c.call("/two-factor/enable", { password: user.password })).json;
    await c.call("/two-factor/verify-totp", { code: totp(totpURI) });
    await c.call("/sign-out", {});
    await c.call("/sign-in/email", { email: user.email, password: user.password });
    await c.call("/two-factor/send-otp", {});
    await c.call("/two-factor/verify-otp", { code: codeIn(lastEmail(user.email)), trustDevice: true });
    await client().call("/request-password-reset", { email: user.email, redirectTo: "/reset-password" });

    const projectId = await projectTree(user.id);
    const bystander = await signedInUser(client());
    const bystanderProject = await projectTree(bystander.id);

    const before = await footprint(user.id, projectId);
    assert.deepEqual(
        Object.entries(before).filter(([, n]) => n === 0),
        [],
        `fixture should touch every table: ${JSON.stringify(before)}`,
    );
    assert.deepEqual([before.nodes, before.documents, before.cells], [5, 3, 2]);

    const bare = await c.call("/delete-user", {});
    assert.equal(bare.status, 400);
    assert.equal(bare.json.code, "PASSWORD_REQUIRED", "a fresh session alone must not be enough");
    assert.equal((await c.call("/delete-user", { password: "wrong-password!" })).json.code, "INVALID_PASSWORD");
    assert.deepEqual(await footprint(user.id, projectId), before);

    const deleted = await c.call("/delete-user", { password: user.password });
    assert.equal(deleted.status, 200);
    assert.equal(c.has("session_token"), false);

    const left = await footprint(user.id, projectId);
    assert.deepEqual(left, Object.fromEntries(Object.keys(left).map((k) => [k, 0])));

    assert.notEqual((await footprint(bystander.id, bystanderProject)).nodes, 0, "other users are untouched");
});
