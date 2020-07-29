import { ID } from "./primitives"

// For GraphQL pagination best practices using the Connection fragment, see
// https://graphql.org/learn/pagination/ and https://relay.dev/graphql/connections.htm

// July 24 2020 Strategy:
// SQL query using ORDER BY and LIMIT can retrieve all rows in page
//
// Future Strategy:
// - How can I leverage knowing that a GraphQL query only requests `count` or `pageInfo`?
//   Should strive in future to use minimal SQL query:
//   - (faster) SQL query with only COUNT for `count`
//   - (slower) SQL query with ORDER BY returning first and last row in page for `pageInfo`
//   - (slowest) SQL query with ORDER BY returning all rows in page for Edge cursors
// - What is the potential for speedup here? Is it even worth it?

type Cursor = string;

export interface Connection<Parent, Child> {
    __totalCountSqlPreparedStmt: string
    __totalCountSqlArgs: (number | string | null)[]
    totalCount: (obj: Connection<Parent, Child>, args: any, context: any, info: any) => Promise<number>
    edges: Edges<Parent, Child>
    pageInfo: PageInfo
}

export type Edges<Parent, Child> = Edge<Parent, Child>[]
export type EdgesData = EdgeData[]

export interface EdgeData {
    __id: ID,
    cursor: Cursor
}

export interface Edge<Parent, Child> extends EdgeData {
    node: (obj: Edge<Parent, Child>, args: any, context: any, info: any) => Promise<Child>
}

export interface PageInfo {
    hasPreviousPage: boolean
    hasNextPage: boolean
    startCursor: Cursor
    endCursor: Cursor
}

export interface ConnectionArgs {
    next: number
    previous: number
    before: Cursor
    after: Cursor
}

// ConnectionData holds the results of the database query before adding resolvers to complete Connection interface.
export interface ConnectionData {
    edgesData: EdgesData
    pageInfo: PageInfo
}

export function encryptCursor(id: ID): Cursor {
    return Buffer.from(id, 'utf8').toString()
}

export function decryptCursor(cursor: Cursor): ID {
    return Buffer.from(cursor, 'base64').toString()
}