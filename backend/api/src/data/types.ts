import { ID } from "./primitives"
import { Connection, EdgeData } from "./connection"

// The GraphQL schema types are defined as interfaces.
// The fields may be separated into a subinterface `[Type]Data`.

// There are three modes by which a query by ID occurs.
// 1. Direct query by the Root -> Query type.
// 2.
export type IDable = Query | ID | EdgeData;

export function getID(obj: IDable, args: any) {
    let id: ID = ""

    if ('id' in args) {
        id = args.id
    }
    else if ('__id' in (obj as any)){
        id = (obj as EdgeData).__id
    } else {
        id = obj as ID
    }

    return id
}

export interface Query {
    user: (obj: IDable, args: any, context: any, info: any) => Promise<User>
    plant: (obj: IDable, args: any, context: any, info: any) => Promise<Plant>
}

export interface Mutation {
    createImageForPlant: (obj: Mutation, args: CreateImageArgs, context: any, info: any) => Promise<PendingImage>;
}

export interface UserData {
    id: ID
    name: string
    email: string
}

export interface User extends UserData {
    gardenConnection: (obj: UserData, args: any, context: any, info: any) => Connection<User, Garden>
    ownedGardenConnection: (obj: UserData, args: any, context: any, info: any) => Connection<User, Garden>
    plantConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, Plant>>
    followeeConnection: (obj: UserData, args: any, context: any, info: any) => Connection<User, UserData>
    followerConnection: (obj: UserData, args: any, context: any, info: any) => Connection<User, UserData>
    postConnection: (obj: UserData, args: any, context: any, info: any) => Connection<User, Post>
}

export interface GardenData {
    name: string
}

export interface Garden extends GardenData {
    plantConnection: (obj: Garden, args: any, context: any, info: any) => Connection<Garden, Plant>
    gardenerConnection: (obj: Garden, args: any, context: any, info: any) => Connection<Garden, UserData>
    ownerConnection: (obj: Garden, args: any, context: any, info: any) => Connection<Garden, UserData>
    imageConnection: (obj: Garden, args: any, context: any, info: any) => Connection<Garden, Image>
}

export interface PlantData {
    id: ID
    name: string
    __gardenID: ID
}

export interface Plant extends PlantData {
    garden: (obj: Plant, args: any, context: any, info: any) => Promise<Garden>
    imageConnection: (obj: Plant, args: any, context: any, info: any) => Connection<Plant, Image>
    ownerConnection: (obj: Plant, args: any, context: any, info: any) => Connection<Plant, UserData>
}

export interface PostData {
    author: UserData
    firstPublished: Date
    lastEdited: Date
    text: string
}

export interface Post extends PostData {
    imageConnection: (obj: Post, args: any, context: any, info: any) => Connection<Post, Image>
}

export interface Image {
    url: string
    uploaded: Date
    description: string
}

export interface PendingImage {
    uploadUrl: string
}

export interface DBUser {
    id: ID
    name: string
    email: string
}

export interface UserArgs {
    id: ID
}

export interface CreateImageArgs {
    plantID: ID
    fileExt: string
    description: string
}