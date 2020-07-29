import { ID } from "../data/primitives"
import { IDable, getID, User, UserData } from "../data/types"
import { DBPool } from "../db"
import { stubConnection } from "./stubs"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"


export function makeUserLoader(dbPool: DBPool) {

    const userDataLoader = new DataLoader<ID, UserData>(getUserData);

    async function loadUser(obj: IDable, args: any, context: ContextWithLoaders, info: any): Promise<User> {
        const id = getID(obj, args)

        const buildUser = (userData: UserData): User => {
            return ({
                gardenConnection: stubConnection,
                ownedGardenConnection: stubConnection,
                plantConnection: context.load.userPlantConnection,
                followeeConnection: stubConnection,
                followerConnection: stubConnection,
                postConnection: stubConnection,
                ...userData
            })
        }

        return userDataLoader.load(id).then(buildUser)
    }

    async function getUserData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM users WHERE id = ?";

        const promises: Promise<UserData>[] = []

        const db = await dbPool.getConnection()

        // TODO: Combine into a single SQL query and check result IDs against requested IDs
        //       to resolve/reject promises.

        IDs.forEach((id) => {
            promises.push(new Promise<UserData>((resolve, reject) => {

                const inserts = [BigInt(id)];

                db.query(preparedSql, inserts, (err, rows) => {
                    if (err)
                        return reject(err)
                    else if (rows.length !== 1)
                        return reject("Expected 1 row with id = " + id + " but found " + rows.length.toString())

                    return resolve({
                        id: rows[0].id,
                        name: rows[0].name,
                        email: rows[0].email
                    });
                });
            }))
        })

        return Promise.all(promises).finally(db.release)
    }

    return loadUser
}