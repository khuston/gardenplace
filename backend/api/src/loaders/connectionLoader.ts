import { DBPool } from "../db"
import { UserData, User, Plant } from "../data/types"
import { Connection, Edges, ConnectionArgs, EdgeData, ConnectionData, Node } from "../data/connection"
import { PageKey, getPageCacheKey, getConnectionDataPromise } from "./connectionSql"
import { resolveTotalCount } from "./count"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"
import { IDable, getID } from "../data/types"
import { Query } from "../data/types"


/**
 * makeConnectionLoader implements the Connection pattern for a one-to-many (parent-to-children) GraphQL
 * relationship defined in a SQL table `tableName` having columns `parentIDName` and `childIDName`.
 *
 * As with all loaders, it is assumed `context` has a `load` property implementing the MasterLoader interface.
 * `loaderKey` is a method on the interface which can resolve each Child from its cursor found by the lookup.
 */
export function makeConnectionLoader<Parent, Child>(dbPool: DBPool, tableName: string, parentIDName: string, childIDName: string, loaderKey: keyof Query) {
    const parentChildConnectionDataLoader = new DataLoader<PageKey, ConnectionData, string>(getParentChildConnectionData, {
        cacheKeyFn: getPageCacheKey
    })

    return loadConnection

    // 1. SQL query for ConnectionData, called by DataLoader
    async function getParentChildConnectionData(keys: PageKey[]): Promise<ConnectionData[]> {

        const preparedSql = "SELECT " + childIDName + " FROM " + tableName + " WHERE " + parentIDName + " = ? {condition} ORDER BY " + childIDName + " {direction} LIMIT ?;";

        return dbPool.withDB((db) => {
            const promises = keys.map((key) => getConnectionDataPromise(key, db, preparedSql, childIDName))

            return Promise.all(promises)
        })
    }

    async function loadConnection(parent: IDable, args: ConnectionArgs, context: ContextWithLoaders, info: any) {

        const id = getID(parent, args)

        return parentChildConnectionDataLoader.load({id, ...args}).then(buildParentChildConnection);

        function buildParentChildConnection(userPlantConnectionData: ConnectionData): Connection<Parent, Child> {

            // 2. Add node resolver to complete the Edges
            const edges: Edges<Parent, Child> = userPlantConnectionData.edgesData.map((edgeData: EdgeData) => {
                return {
                    // We can be sure the loader exists due to the keyof constraint on `loaderKey`.
                    // The only risk is that the wrong loader is passed.
                    node: (context.load[loaderKey] as unknown) as Node<Parent, Child>,
                    ...edgeData
                };
            })

            // 3. Add totalCount resolver to complete the Connection
            return ({
                __totalCountSqlPreparedStmt: "SELECT COUNT(id) as count FROM " + tableName + " WHERE " + parentIDName + " = ?",
                __totalCountSqlArgs: [id],
                totalCount: resolveTotalCount,
                edges,
                pageInfo: userPlantConnectionData.pageInfo
            })
        }
    }
}