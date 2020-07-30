import { ID } from "../data/primitives"
import { IDable, getID, Garden, GardenData } from "../data/types"
import { DBPool } from "../db"
import { stubConnection } from "./stubs"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"


export function makeGardenLoader(dbPool: DBPool) {

    const gardenDataLoader = new DataLoader<ID, GardenData>(getGardenData);

    async function loadGarden(obj: IDable, args: any, context: ContextWithLoaders, info: any): Promise<Garden> {
        const id = getID(obj, args)

        const gardenData = await gardenDataLoader.load(id)

        return ({
            plantConnection: context.load.gardenPlantConnection,
            gardenerConnection: context.load.gardenUserConnection,
            ownerConnection: context.load.gardenOwnerConnection,
            imageConnection: stubConnection,
            ...gardenData
        })
    }

    async function getGardenData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM gardens WHERE id = ?";

        // TODO: Combine into a single SQL query and check result IDs against requested IDs
        //       to resolve/reject promises.

        return dbPool.withDB((db) => {
            const promises: Promise<GardenData>[] = IDs.map((id) =>
                new Promise<GardenData>((resolve, reject) => {
                    const inserts = [BigInt(id)];

                    db.query(preparedSql, inserts, (err, rows) => {
                        if (err)
                            return reject(err)
                        else if (rows.length !== 1)
                            return reject("Expected 1 row with id = " + id + " but found " + rows.length.toString())

                        return resolve({
                            id,
                            name: rows[0].name,
                        });
                    });
                })
            )
            return Promise.all(promises)
        })
    }

    return loadGarden
}