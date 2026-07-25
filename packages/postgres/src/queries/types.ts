import type { CellType, NodeKind } from "@prisma/client";

export type { CellType, NodeKind };

/** One explorer node as the client holds it (src/lib/workspace/types.ts). */
export interface TreeNodeInput {
    id: string;
    parentId: string | null;
    kind: NodeKind;
    name: string;
    open: boolean;
}

/** src/lib/latex/meta.ts DocumentMeta, verbatim. */
export interface DocumentMetaInput {
    title: string;
    titleOn: boolean;
    author: string;
    authorOn: boolean;
    date: string;
    dateOn: boolean;
    metaOn: boolean;
    colorLinksOn: boolean;
}

/** One cell, already serialized out of its Slate instance. */
export interface CellInput {
    id: string;
    type: CellType;
    content: unknown | null;
    equationContent: string | null;
    label: string | null;
}
