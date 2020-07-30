import { Query, Mutation, User, Plant, Garden, Post, UserData, PlantData, GardenData } from "../data/types"
import { Connection } from "../data/connection"
import { DBPool } from "../db"

export type RootValue = Query & Mutation;

export interface Context extends ContextWithLoaders {
    dbPool: DBPool
}

export interface ContextWithLoaders {
    load: MasterLoader
}

export interface MasterLoader extends Query {
    userPlantConnection(user: UserData, args: any, context: any, info: any): Promise<Connection<User, Plant>>
    userGardenConnection(user: UserData, args: any, context: any, info: any): Promise<Connection<User, Garden>>
    ownerGardenConnection(owner: UserData, args: any, context: any, info: any): Promise<Connection<User, Garden>>
    followeeConnection(user: UserData, args: any, context: any, info: any): Promise<Connection<User, User>>
    followerConnection(user: UserData, args: any, context: any, info: any): Promise<Connection<User, User>>
    authorPostConnection(author: UserData, args: any, context: any, info: any): Promise<Connection<User, Post>>
    gardenPlantConnection(garden: GardenData, args: any, context: any, info: any): Promise<Connection<Garden, Plant>>
    gardenUserConnection(garden: GardenData, args: any, context: any, info: any): Promise<Connection<Garden, User>>
    gardenOwnerConnection(garden: GardenData, args: any, context: any, info: any): Promise<Connection<Garden, User>>
    plantOwnerConnection(plant: PlantData, args: any, context: any, info: any): Promise<Connection<Plant, User>>
}