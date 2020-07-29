import { Connection } from "../data/connection"

// Empty connection for unimplemented parts of the API

export function stubResolver<Parent, Child>(obj: Parent, args: any, context: any, info: any): Promise<Child> {
    return new Promise<Child>((resolve, reject) => {
        resolve();
    })
}

export function stubConnection<Parent, Child>(obj: Parent, args: any, context: any, info: any): Connection<Parent, Child> {
    return {
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
    }
}