"use server"; // nothing else imports the package, the client bundle NEVER pulls in the driver

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
    createProject,
    deleteProject,
    saveDocument,
    saveTree,
    type CellInput,
    type DocumentMetaInput,
    type TreeNodeInput,
} from "@mathscript/postgres";

import { ensureUserId, requireUserId } from "@/lib/auth/session";

export async function newProjectAction() {
    const { id } = await createProject(await ensureUserId());
    redirect(`/projects/${id}`);
}

/** Shaped for <ActionButton>, which toasts `message` whenever `error` is true. */
export async function deleteProjectAction(
    id: string,
): Promise<{ error: boolean; message?: string }> {
    if (!id) return { error: true, message: "No project selected." };

    try {
        await deleteProject(await requireUserId(), id);
    } catch (err) {
        console.error("deleteProject failed", err);
        return { error: true, message: "Could not delete this project. Try again." };
    }

    revalidatePath("/projects");
    return { error: false };
}

export async function saveTreeAction(projectId: string, nodes: TreeNodeInput[]) {
    await saveTree(await requireUserId(), projectId, nodes);
}

/** Returns false when the file's Node row hasn't been persisted yet. */
export async function saveDocumentAction(
    nodeId: string,
    meta: DocumentMetaInput,
    cells: CellInput[],
): Promise<boolean> {
    return saveDocument(await requireUserId(), nodeId, meta, cells);
}
