import mysql from "mysql";
import { Configuration } from "./config";

export interface DBPool {
    getConnection(): Promise<mysql.PoolConnection>
}

export function initDBPool(config: Configuration): DBPool {

    const pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: "gardenplace",
        multipleStatements: true
    });

    return {
        getConnection: () => {
            return new Promise<mysql.PoolConnection>((resolve, reject) => {
                pool.getConnection((err, connection) => {
                    if (err)
                        return reject(err);

                    return resolve(connection);
                })
            })
        }
    }
}