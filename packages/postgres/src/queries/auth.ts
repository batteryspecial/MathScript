import { prisma } from "../client";
import { QueryError } from "../errors";

/**
 * Determines whether a userId owns a project.
 * 
 * @param userId string
 * @param projectId string
 * @returns boolean
 */
export async function isProjectOwner(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId, userId },
        select: { id: true }
    });

    return project !== null;
}


/**
 * Gate for compound writes that edit child tables with no userId column.
 * 
 * @param userId string
 * @param projectId string
 */
export async function assertProjectOwner(userId: string, projectId: string) {
    if (!(await isProjectOwner(userId, projectId))) {
        throw new QueryError("NOT_FOUND");
    }
}
