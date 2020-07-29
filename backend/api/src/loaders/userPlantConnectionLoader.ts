import { DBPool } from "../db"
import { UserData, User, Plant } from "../data/types"
import { Connection, Edges, ConnectionArgs, EdgeData, ConnectionData } from "../data/connection"
import { PageKey, getPageCacheKey, getConnectionDataPromise } from "./connectionSql"
import { resolveTotalCount } from "./count"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"

export function makeUserPlantConnectionLoader(dbPool: DBPool) {
    const userPlantConnectionDataLoader = new DataLoader<PageKey, ConnectionData, string>(getUserPlantConnectionData, {
        cacheKeyFn: getPageCacheKey
    })

    return loadUserPlantConnection

    // 1. SQL query for ConnectionData, called by DataLoader
    async function getUserPlantConnectionData(keys: PageKey[]): Promise<ConnectionData[]> {

        const preparedSql = "SELECT plant_id FROM plant_owners WHERE owner_id = ? {condition} ORDER BY plant_id {direction} LIMIT ?;";

        const db = await dbPool.getConnection()

        const promises = keys.map((key) => getConnectionDataPromise(key, db, preparedSql, 'plant_id'))

        return Promise.all(promises).finally(db.release)
    }

    async function loadUserPlantConnection(user: UserData, args: ConnectionArgs, context: ContextWithLoaders, info: any) {

        return userPlantConnectionDataLoader.load({id: user.id, ...args}).then(buildUserPlantConnection);

        function buildUserPlantConnection(userPlantConnectionData: ConnectionData): Connection<User, Plant> {

            // 2. Add node resolver to complete the Edges
            const edges: Edges<User, Plant> = userPlantConnectionData.edgesData.map((edgeData: EdgeData) => {
                return {
                    node: context.load.plant,
                    ...edgeData
                };
            })

            // 3. Add totalCount resolver to complete the Connection
            return ({
                __totalCountSqlPreparedStmt: "SELECT COUNT(id) as count FROM plant_owners WHERE owner_id = ?",
                __totalCountSqlArgs: [user.id],
                totalCount: resolveTotalCount,
                edges,
                pageInfo: userPlantConnectionData.pageInfo
            })
        }
    }
}