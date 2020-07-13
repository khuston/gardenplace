import DataLoader from "dataloader";
import mysql from "mysql";
import { User, Garden, Plant, Post, GardenRelations, PlantRelations, ID } from "./types"

export interface UserData {
    id: string
    name: string
    email: string
}

export function makeUserLoader(db: mysql.Connection): DataLoader<ID, User> {

    const getUsers = makeUserGetter(db)

    return new DataLoader((IDs: ID[]) => new Promise<User[]>((resolve, reject) => {
        try {
            resolve(getUsers(IDs))
        } catch (error) {
            reject(error)
        }
    }))
}


function makeUserGetter(db: mysql.Connection) {

    async function getUserData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM users WHERE id = ?";

        const promises: Promise<User>[] = []

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

        return Promise.all(promises)
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