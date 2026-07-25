export { prisma } from "./client";

export {
    listProjects,
    createProject,
    getProject,
    renameProject,
    deleteProject,
    saveTree,
} from "./queries/project";

export { getDocument, saveDocument } from "./queries/document";

export type {
    CellInput,
    CellType,
    DocumentMetaInput,
    NodeKind,
    TreeNodeInput,
} from "./queries/types";

export type { Cell, Document, Node, Project } from "@prisma/client";
