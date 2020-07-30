import { Connection } from "../data/connection"

/**
 * stubConnection is an empty connection for unimplemented parts of the API
 */
export function stubConnection<Parent, Child>(obj: Parent, args: any, context: any, info: any): Promise<Connection<Parent, Child>> {
    return new Promise((resolve, reject) => {
        resolve({
            __totalCountSqlPreparedStmt: "",
            __totalCountSqlArgs: [],
            totalCount: stubResolver,
            pageInfo: {
                hasPreviousPage: false,
                hasNextPage: false,
                startCursor: "",
                endCursor: ""
            },
            edges: []
        })
    })
}

function stubResolver<Parent, Child>(obj: Parent, args: any, context: any, info: any): Promise<Child> {
    return new Promise<Child>((resolve, reject) => {
        resolve();
    })
}