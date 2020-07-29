import { ID } from "../data/primitives"
import { ConnectionArgs, ConnectionData, decryptCursor, encryptCursor, EdgesData } from "../data/connection"
import mysql from "mysql"

export interface PageKey extends ConnectionArgs {
    id: ID
}

export function getPageCacheKey(key: PageKey) {
    return key.id + "|" + (key.next ? key.next.toString() + (key.after ? "|" + key.after.toString() : "") :
                                      key.previous.toString() + (key.before ? "|" + key.before.toString() : ""))
}

/**
 * getConnectionDataPromise handles first/after and before/last configuration of a SQL query.
 *
 * `preparedSql` is passed as a template
 *      SELECT plant_id FROM plant_owners WHERE user_id = ? {condition} ORDER BY plant_id ? LIMIT ?
 *
 * `key` contains next, previous, before, after which together with `idName` are used to replace {condition}
 *      next: 2
 *          SELECT plant_id FROM plant_owners WHERE user_id = 1 ORDER BY plant_id ASC LIMIT 2
 *
 *      next: 5  after: Mw==
 *          SELECT plant_id FROM plant_owners WHERE user_id = 1 AND plant_id > 3 ORDER BY plant_id ASC LIMIT 5
 */
export function getConnectionDataPromise(key: PageKey, db: mysql.PoolConnection, preparedSql: string, idName: string) {
    return new Promise<ConnectionData>((resolve, reject) => {

        const isForward = !!key.next;
        const length = isForward? key.next : key.previous;

        // We add 1 to next or previous to peek ahead, so we know if there is a
        // next or previous page, respectively.
        let condition = key.before ? " AND " + idName + " < " + decryptCursor(key.before) : ""
        let direction = "DESC"
        let inserts = [key.id, length + 1]

        if (isForward) {
            condition = key.after ? " AND " + idName + " > " + decryptCursor(key.after) : ""
            direction = "ASC"
            inserts = [key.id, length + 1]
        }

        preparedSql = preparedSql.replace("{condition}", condition).replace("{direction}", direction)

        db.query(preparedSql, inserts, handleResponse)

        function handleResponse(err: Error | null, rows: any) {
            if (err)
                return reject(err)

            let edgesData: EdgesData = rows.map((row: any) => ({
                __id: row[idName].toString(),
                cursor: encryptCursor(row[idName].toString())
            }))

            if (!isForward) {
                edgesData = edgesData.reverse()
            }

            if (edgesData.length > length) {
                edgesData = edgesData.slice(0, length)
            }

            return resolve({
                edgesData,
                pageInfo: {
                    hasPreviousPage: key.next ? key.after !== "" : rows.length > length,
                    hasNextPage: key.previous ? key.before !== "" : rows.length > length,
                    startCursor: edgesData[0].cursor,
                    endCursor: edgesData[edgesData.length - 1].cursor
                }
            });
        }
    })
}