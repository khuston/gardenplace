import { ID, PendingImage } from "./types";
import { S3 } from "aws-sdk";
import { DBPool } from "./db";
import mysql from "mysql";

export interface ImageCreator{
    createForPlant(plantID: ID, fileExt: string, description: string): Promise<PendingImage>
}

export interface S3Params{
    Bucket: string
    KeyRootDir: string
}

export function makeImageCreator(dbPool: DBPool, s3: S3, s3Params: S3Params): ImageCreator {

    return ({
        createForPlant: (plantID: ID, fileExt: string, description: string) => {

            return new Promise<PendingImage>(async (resolve, reject) => {

                let fileID = "";

                try {
                    const db = await dbPool.getConnection();
                    fileID = await createImageForPlant(db, plantID, description)
                    db.release()
                }
                catch (error) {
                    reject(error)
                }

                const filename = fileID + "." + fileExt

                const params = {
                    Bucket: s3Params.Bucket,
                    Key: s3Params.KeyRootDir + "/Plants/" + filename
                }

                let url = ""

                try {
                    url = await s3.getSignedUrlPromise("putObject", params)
                }
                catch(error) {
                    reject(error)
                }

                return resolve({
                    uploadUrl: url
                })
            })
        }

    })
}

function createImageForPlant(db: mysql.Connection, plantID: ID, description: string): Promise<ID> {
    const preparedSql = `START TRANSACTION; CALL CreateImageForPlant(?, ?); COMMIT;`

    return new Promise<ID>((resolve, reject) => {
        db.query(preparedSql, [plantID, description], (err, results, fields) => {
            if (err)
                return reject(err)
            else
                return resolve(results[1][0].imageID);
        });
    })
}