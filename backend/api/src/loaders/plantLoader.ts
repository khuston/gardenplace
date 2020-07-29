import { ID } from "../data/primitives"
import { IDable, getID, Plant, PlantData } from "../data/types"
import { DBPool } from "../db"
import { stubConnection, stubResolver } from "./stubs"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"


export function makePlantLoader(dbPool: DBPool) {

    const plantDataLoader = new DataLoader<ID, PlantData>(getPlantData);

    async function loadPlant(obj: IDable, args: any, context: ContextWithLoaders, info: any): Promise<Plant> {
        const id = getID(obj, args)

        const buildPlant = (plantData: PlantData): Plant => {
            return ({
                imageConnection: stubConnection,
                ownerConnection: stubConnection,
                garden: stubResolver,
                ...plantData
            })
        }

        return plantDataLoader.load(id).then(buildPlant)
    }

    async function getPlantData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM plants WHERE id = ?";

        const promises: Promise<PlantData>[] = []

        const db = await dbPool.getConnection()

        // TODO: Combine into a single SQL query and check result IDs against requested IDs
        //       to resolve/reject promises.

        IDs.forEach((id) => {
            promises.push(new Promise<PlantData>((resolve, reject) => {

                const inserts = [BigInt(id)];

                db.query(preparedSql, inserts, (err, rows) => {
                    if (err)
                        return reject(err)
                    else if (rows.length !== 1)
                        return reject("Expected 1 row with id = " + id + " but found " + rows.length.toString())

                    return resolve({
                        id,
                        name: rows[0].name,
                        __gardenID: rows[0].garden_id
                    });
                });
            }))
        })

        return Promise.all(promises).finally(db.release)
    }

    return loadPlant
}