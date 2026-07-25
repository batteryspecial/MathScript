import { Prisma } from "@prisma/client";

import { prisma } from "../client";
import type { CellInput, DocumentMetaInput } from "./types";

export async function getDocument(nodeId: string) {
    return prisma.document.findUnique({
        where: { nodeId },
        include: { cells: { orderBy: { position: "asc" } } },
    });
}

/**
 * Full replace of one notebook: meta + the cell list in order.
 *
 * ponytail: writes every cell on every save rather than diffing. A notebook is
 * tens of cells, so the extra round-trips are cheaper than tracking dirty ids.
 * Diff per-cell if documents ever get long enough to feel it.
 */
export async function saveDocument(
    nodeId: string,
    meta: DocumentMetaInput,
    cells: CellInput[],
): Promise<boolean> {
    // A file created seconds ago may not have been written by saveTree yet, and
    // Document.nodeId is a real FK. Report it instead of throwing so the caller
    // can stay dirty and try again.
    const node = await prisma.node.findUnique({ where: { id: nodeId }, select: { id: true } });
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

            return prisma.cell.upsert({
                where: { id: c.id },
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
