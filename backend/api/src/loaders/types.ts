import { Query, Mutation, User, Plant, Garden, Post, UserData } from "../data/types"
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
}