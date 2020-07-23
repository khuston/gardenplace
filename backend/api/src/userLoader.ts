import DataLoader from "dataloader";
import { DBPool } from "./db";
import { User, Garden, Plant, Post, GardenRelations, PlantRelations, ID } from "./types"
import { LRUMap } from "lru_map"

export interface UserData {
    id: string
    name: string
    email: string
}

export function makeUserLoader(dbPool: DBPool): DataLoader<ID, User> {

    const getUsers = makeUserGetter(dbPool)

    return new DataLoader((IDs: ID[]) => new Promise<User[]>((resolve, reject) => {
        try {
            resolve(getUsers(IDs))
        } catch (error) {
            reject(error)
        }
    }), {cacheMap: new LRUMap(100)})
}


function makeUserGetter(dbPool: DBPool) {

    async function getUserData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM users WHERE id = ?";

        const promises: Promise<User>[] = []

        const db = await dbPool.getConnection()

        IDs.forEach((id) => {
            promises.push(new Promise<User>((resolve, reject) => {

                const inserts = [BigInt(id)];

                db.query(preparedSql, inserts, (err, rows) => {
                    if (err)
                        reject(err)
                    else if (rows.length !== 1)
                        reject("Expected 1 row with id = " + id + " but found " + rows.length.toString())
                    else
                        resolve(makeUser({
                            id: rows[0].id,
                            name: rows[0].name,
                            email: rows[0].email
                        }));
                });
            }))
        })

        return Promise.all(promises).finally(db.release)
    }

    return getUserData
}

function makeUser(userData: UserData): User {
    const user: User = {

        id: userData.id,
        name: userData.name,
        email: userData.email,
        gardenRelations: (obj: User, args: any, context: any, info: any): GardenRelations => {
            return {
                ownedGardenCount: new Promise<number>((resolve, reject) => resolve(1)),
                gardenCount: new Promise<number>((resolve, reject) => resolve(1)),
                ownedGardens: () => new Promise<Garden[]>((resolve, reject) => resolve([])),// getGardensByOwner(userData.id),
                gardens: () => new Promise<Garden[]>((resolve, reject) => resolve([]))// getGardensByGardener(userData.id)
            }
        },
        plantRelations: (obj: User, args: any, context: any, info: any): PlantRelations => {
            return {
                ownedPlantCount: new Promise<number>((resolve, reject) => resolve(0)),
                ownedPlants: new Promise<Plant[]>((resolve, reject) => resolve([]))
            }
        },
        followees: (obj: User, args: any, context: any, info: any): Promise<User[]> => {
            return new Promise<User[]>((resolve, reject) => resolve([]));
        },
        followers: (obj: User, args: any, context: any, info: any): Promise<User[]> => {
            return new Promise<User[]>((resolve, reject) => resolve([]));
        },
        posts: (obj: User, args: any, context: any, info: any): Promise<Post[]> => {
            return new Promise<Post[]>((resolve, reject) => resolve([]));
        }
    }

    return user;
}