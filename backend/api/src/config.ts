import * as fs from "fs";
import { Config } from "aws-sdk";

export interface Configuration {
    host: string
    user: string
    password: string
    allowedOrigins: string[]
    useTLS: boolean
    port: number
    s3Endpoint: string
    s3Bucket: string
    s3KeyRootDir: string
    s3AccessKeyId: string
    s3SecretAccessKey: string
    region: string
}

function isValidConfiguration(config: any): boolean {
    if (config && config.host && config.user && config.password) {
        return true
    }
    return false
}

export function loadConfig(): Configuration {

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

function readJsonSync(path: string): any {

    return JSON.parse(fs.readFileSync(path).toString())
}