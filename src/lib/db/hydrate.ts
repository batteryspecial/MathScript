import type { Descendant } from "slate";
import type { getProject } from "@mathscript/postgres";

import type { Cell } from "@/lib/cells/types";
import type { NodeId, TreeNode } from "@/lib/workspace/types";
import { defaultDocumentMeta, type DocumentMeta } from "@/lib/latex/meta";

export interface InitialDocument {
    meta: DocumentMeta;
    cells: Cell[];
}

export interface InitialWorkspace {
    projectId: string;
    nodes: TreeNode[];
    activeFileId: NodeId | null;
    documents: Record<NodeId, InitialDocument>;
}

type LoadedProject = NonNullable<Awaited<ReturnType<typeof getProject>>>;

// The one place DB rows become the shapes the hooks already expect.
export function toInitialWorkspace(project: LoadedProject): InitialWorkspace {
    const fallback = defaultDocumentMeta();
    const nodes: TreeNode[] = [];
    const documents: Record<NodeId, InitialDocument> = {};

    for (const node of project.nodes) {
        nodes.push(
            node.kind === "folder"
                ? { id: node.id, kind: "folder", name: node.name, parentId: node.parentId, open: node.open }
                : { id: node.id, kind: "file", name: node.name, parentId: node.parentId },
        );

        if (!node.document) continue;

        const doc = node.document;
        documents[node.id] = {
            meta: {
                title: doc.title,
                titleOn: doc.titleOn,
                author: doc.author,
                authorOn: doc.authorOn,
                // A document created server-side has no date yet — today, not blank.
                date: doc.date || fallback.date,
                dateOn: doc.dateOn,
                metaOn: doc.metaOn,
                colorLinksOn: doc.colorLinksOn,
            },
            cells: doc.cells.map((cell) => ({
                id: cell.id,
                type: cell.type,
                initialContent: (cell.content as Descendant[] | null) ?? null,
                equationContent: cell.equationContent ?? undefined,
                label: cell.label ?? undefined,
            })),
        };
    }

    return {
        projectId: project.id,
        nodes,
        activeFileId: nodes.find((n) => n.kind === "file")?.id ?? null,
        documents,
    };
}
