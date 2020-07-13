import mysql from "mysql";
import * as fs from "fs";

interface Configuration {
    host: string
    user: string
    password: string
    allowedOrigins: string[]
}

function isValidConfiguration(config: any): boolean {
    if (config && config.host && config.user && config.password) {
        return true
    }
    return false
}

export function loadConfig() {

    const configPaths = ["/etc/gardenplace/backend/api/config.json", "backend/api/config.json"]

    let configPath = ""

    for (const path of configPaths) {

        if (fs.existsSync(path)) {
            configPath = path
            break
        }
    }

    if (configPath === "") {
        throw new Error("Could not find configuration file in locations " + configPaths)
    }

    const config: Configuration = readJsonSync(configPath)

    if (!isValidConfiguration(config))
        throw new Error("Invalid configuration at " + configPath)

    return config
}

export function initDB(config: Configuration): mysql.Connection {
    const conn = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: "gardenplace"
    });

    conn.connect()

    return conn
}

function readJsonSync(path: string): any {

    return JSON.parse(fs.readFileSync(path).toString())
}