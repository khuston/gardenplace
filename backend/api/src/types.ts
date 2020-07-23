export type ID = string;

export interface RootValue {
    user: (args: UserArgs) => Promise<User>;
    createImageForPlant: (args: CreateImageArgs) => Promise<PendingImage>;
    // gardensByOwner: (id: ID) => Promise<Garden[]>;
    // gardensByGardener: (id: ID) => Promise<Garden[]>;
    // plantsByOwner: (id: ID) => Promise<Plant[]]>;
    // followeesOfUser: (id: ID) => Promise<User[]>;
    // followersOfUser: (id: ID) => Promise<User[]>;
    // postsByAuthor: (id: ID) => Promise<User[]>;
}

export interface User {
    id: ID
    name: string
    email: string
    gardenRelations: (obj: User, args: any, context: any, info: any) => GardenRelations
    plantRelations: (obj: User, args: any, context: any, info: any) => PlantRelations
    followees: (obj: User, args: any, context: any, info: any) => Promise<User[]>
    followers: (obj: User, args: any, context: any, info: any) => Promise<User[]>
    posts: (obj: User, args: any, context: any, info: any) => Promise<Post[]>
}

export interface Garden {
    name: string
    plantRelations: (obj: Garden, args: any, context: any, info: any) => PlantRelations
    gardenerRelations: (obj: Garden, args: any, context: any, info: any) => GardenerRelations
    ownerRelations: (obj: Garden, args: any, context: any, info: any) => OwnerRelations
    images: (obj: Garden, args: any, context: any, info: any) => Promise<Image[]>
}

export interface Plant {
    id: ID
    name: string
    garden: Garden
    images: (obj: Plant, args: any, context: any, info: any) => Promise<Image[]>
    owners: (obj: Plant, args: any, context: any, info: any) => Promise<User[]>
}

export interface Image {
    url: string
    uploaded: Date
    description: string
}

export interface PendingImage {
    uploadUrl: string
}

export interface Post {
    author: User
    firstPublished: Date
    lastEdited: Date
    text: string
    images: (obj: Post, args: any, context: any, info: any) => Promise<Image[]>
}

export interface OwnerRelations {
    count: Promise<number>
    owners: (obj: Garden, args: any, context: any, info: any) => Promise<User[]>
}

export interface GardenRelations {
    ownedGardenCount: Promise<number>
    gardenCount: Promise<number>
    ownedGardens: (obj: GardenRelations, args: any, context: any, info: any) => Promise<Garden[]>
    gardens: (obj: GardenRelations, args: any, context: any, info: any) => Promise<Garden[]>
}

export interface PlantRelations {
    ownedPlantCount: Promise<number>
    ownedPlants: Promise<Plant[]>
}

export interface GardenerRelations {
    count: Promise<number>
    gardeners: (obj: GardenerRelations, args: any, context: any, info: any) => Promise<User[]>
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