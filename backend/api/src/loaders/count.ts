import { Connection, ConnectionArgs } from "../data/connection"
import { DBPool } from "../db"

export async function resolveTotalCount(obj: Connection<any, any>, args: ConnectionArgs, context: any, info: any): Promise<number> {

    const dbPool: DBPool = context.dbPool

    const db = await dbPool.getConnection()

    return new Promise<number>((resolve, reject) => {

        if (!obj.__totalCountSqlPreparedStmt) {
            reject(new Error("Prepared statement wasn't provided to totalCount resolver."))
        }

        db.query(obj.__totalCountSqlPreparedStmt, obj.__totalCountSqlArgs, (err, rows) => {
            if (err)
                return reject(err)
            else if (rows.length !== 1)
                return reject(new Error("Expected 1 row but found " + rows.length.toString()))

            return resolve(rows[0].count);
        });
    }).finally(db.release)
}