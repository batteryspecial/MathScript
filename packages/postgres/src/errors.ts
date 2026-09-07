// packages/postgres/src/errors.ts

/** 
 * Thrown by every project/document query when 
 * 1. A row doesn't exist
 * 2. Project isn't owned by the caller. 
 * 
 * The two cases are indistinguishable on purpose. 
 */
export type QueryErrorCode = "NOT_FOUND";
export class QueryError extends Error {
    constructor(public readonly code: QueryErrorCode) {
        super(code);
        this.name = "QueryError";
    }
}
