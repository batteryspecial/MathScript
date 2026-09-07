export { prisma } from "./client";
export { QueryError, type QueryErrorCode } from "./errors";

export {
    listProjects,
    createProject,
    getProject,
    renameProject,
    deleteProject,
    saveTree,
} from "./queries/project";

export { getDocument, saveDocument } from "./queries/document";
export { isProjectOwner, assertProjectOwner } from "./queries/auth";

export type {
    CellInput,
    CellType,
    DocumentMetaInput,
    NodeKind,
    TreeNodeInput,
} from "./queries/types";

export type { Cell, Document, Node, Project } from "@prisma/client";
