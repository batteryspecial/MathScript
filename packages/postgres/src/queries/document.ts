import { Prisma } from "../generated/prisma/client";

import { prisma } from "../client";
import type { CellInput, DocumentMetaInput } from "./types";

export async function getDocument(userId: string, nodeId: string) {
    return prisma.document.findFirst({
        where: { nodeId, node: { project: { userId } } },
        include: { cells: { orderBy: { position: "asc" } } },
    });
}

/**
 * Full replace of one notebook's meta and cell list in order.
 * 
 * @returns true if the save was successful
 */
export async function saveDocument(
    userId: string,
    nodeId: string,
    meta: DocumentMetaInput,
    cells: CellInput[],
): Promise<boolean> {
    // A file created seconds ago may not have been written by saveTree yet, and
    // Document.nodeId is a real FK. Report it instead of throwing so the caller
    // can try again. Someone else's node reads as missing too.
    const node = await prisma.node.findFirst({
        where: { id: nodeId, project: { userId } },
        select: { id: true },
    });
    if (!node) return false;

    const keep = cells.map((c) => c.id);

    const doc = await prisma.document.upsert({
        where: { nodeId },
        create: { nodeId, ...meta },
        update: meta,
        select: { id: true },
    });

    await prisma.$transaction([
        prisma.cell.deleteMany({
            where: { documentId: doc.id, id: { notIn: keep.length ? keep : [" "] } },
        }),
        ...cells.map((c, position) => {
            const content =
                c.content === null || c.content === undefined
                    ? Prisma.DbNull
                    : (c.content as Prisma.InputJsonValue);

            // documentId pins the upsert: a foreign cell id fails on create, never overwrites
            return prisma.cell.upsert({
                where: { id: c.id, documentId: doc.id },
                create: {
                    id: c.id,
                    documentId: doc.id,
                    position,
                    type: c.type,
                    content,
                    equationContent: c.equationContent,
                    label: c.label,
                },
                update: {
                    position,
                    type: c.type,
                    content,
                    equationContent: c.equationContent,
                    label: c.label,
                },
            });
        }),
    ]);

    return true;
}
