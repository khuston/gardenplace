import mysql from "mysql";
import { Configuration } from "./config";

export interface DBPool {
    withDB<T>(callback: (db: mysql.Connection) => Promise<T>): Promise<T>
}

export function initDBPool(config: Configuration): DBPool {

    const pool = mysql.createPool({
        connectionLimit : 10,
        host: config.host,
        user: config.user,
        password: config.password,
        database: "gardenplace",
        multipleStatements: true
    });

    return {
        withDB<T>(callback: (db: mysql.Connection) => Promise<T>): Promise<T> {
            return new Promise<T> ((resolve, reject) => {
                pool.getConnection(async (err, connection) => {
                    if (err)
                        return reject(err);

                    try {
                        try {
                            const result = await callback(connection)

                            return resolve(result);
                        }
                        catch (error) {
                            return reject(error)
                        }
                    }
                    finally {
                        connection.release()
                    }
                })
            })
        }
    }
}