import { ID } from "./primitives"
import { Connection, EdgeData } from "./connection"

// The GraphQL schema types are defined as interfaces.
// The fields may be separated into a subinterface `[Type]Data`.
export type IDable = Query | EdgeData | UserData | PlantData | GardenData | PostData | Image;

/**
 * getID infers the ID for a resolver. If owner is root, ID should be in args.
 * If owner
 * @param obj First argument to GraphQL field resolver representing the owner, or overridden by calling code to be the ID.
 * @param args Second argument to GraphQL field resolver
 */
export function getID(obj: IDable | null, args: any) {
    const id: ID = ""

    // This condition is for two cases:
    // 1. The ID is passed as an argument directly from a client GraphQL query.
    // 2. The ID is passed by a small resolver function from an ID-type field on the owner object.
    if ('id' in args)
        return args.id

    // This condition is only for resolving the node field of an edge.
    if ('__id' in (obj as any)) {
        return (obj as EdgeData).__id
    }

    // This condition is only for resolving parentChildConnections where the parent id
    // is used to locate the children.
    if ('id' in (obj as any)) {
        return (obj as any).id
    }

    throw new Error("Undetermined ID")
}

export interface Query {
    user: (obj: IDable, args: any, context: any, info: any) => Promise<User>
    plant: (obj: IDable, args: any, context: any, info: any) => Promise<Plant>
    garden: (obj: IDable, args: any, context: any, info: any) => Promise<Garden>
    post: (obj: IDable, args: any, context: any, info: any) => Promise<Post>
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
    gardenConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, Garden>>
    ownedGardenConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, Garden>>
    plantConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, Plant>>
    followeeConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, User>>
    followerConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, User>>
    postConnection: (obj: UserData, args: any, context: any, info: any) => Promise<Connection<User, Post>>
}

export interface GardenData {
    id: ID
    name: string
}

export interface Garden extends GardenData {
    plantConnection: (obj: Garden, args: any, context: any, info: any) => Promise<Connection<Garden, Plant>>
    gardenerConnection: (obj: Garden, args: any, context: any, info: any) => Promise<Connection<Garden, UserData>>
    ownerConnection: (obj: Garden, args: any, context: any, info: any) => Promise<Connection<Garden, UserData>>
    imageConnection: (obj: Garden, args: any, context: any, info: any) => Promise<Connection<Garden, Image>>
}

export interface PlantData {
    id: ID
    name: string
    __gardenID: ID
}

export interface Plant extends PlantData {
    garden: (obj: Plant, args: any, context: any, info: any) => Promise<Garden>
    imageConnection: (obj: Plant, args: any, context: any, info: any) => Promise<Connection<Plant, Image>>
    ownerConnection: (obj: Plant, args: any, context: any, info: any) => Promise<Connection<Plant, UserData>>
}

export interface PostData {
    id: ID
    __authorID: ID
    firstPublished: Date
    lastEdited: Date
    text: string
}

export interface Post extends PostData {
    author: (obj: Post, args: any, context: any, info: any) => Promise<UserData>
    imageConnection: (obj: Post, args: any, context: any, info: any) => Promise<Connection<Post, Image>>
}

export interface Image {
    id: ID
    url: string
    uploaded: Date
    description: string
}

export interface PendingImage {
    uploadUrl: string
}

export interface CreateImageArgs {
    plantID: ID
    fileExt: string
    description: string
}