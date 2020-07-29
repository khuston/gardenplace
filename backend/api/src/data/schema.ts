import { buildSchema, GraphQLSchema, GraphQLObjectType } from "graphql";

// Construct a schema, using GraphQL schema language
export const schema = buildSchema(`
    scalar DateTime

    type User {
        id: ID!
        name: String
        email: String!
        gardenConnection: GardenConnection!
        ownedGardenConnection: GardenConnection!
        plantConnection(next: Int, previous: Int, after: ID, before: ID): PlantConnection!
        followeeConnection: UserConnection!
        followerConnection: UserConnection!
        postConnection: PostConnection!
    }

    type Garden {
        name: String!
        plantConnection: PlantConnection!
        gardenerConnection: UserConnection!
        ownerConnection: UserConnection!
        imageConnection: ImageConnection!
    }

    type Plant {
        id: ID!
        name: String!
        garden: Garden
        imageConnection: ImageConnection!
    }

    type Post {
        author: User!
        firstPublished: DateTime!
        lastEdited: DateTime
        text: String!
        imageConnection: ImageConnection!
    }

    type Image {
        url: String!
        uploaded: DateTime!
        description: String!
    }

    type PendingImage {
        uploadUrl: String!
    }

    type UserConnection {
        totalCount: Int!
        edges: [UserEdge]!
        pageInfo: PageInfo!
    }

    type GardenConnection {
        totalCount: Int!
        edges: [GardenEdge]!
        pageInfo: PageInfo!
    }

    type PlantConnection {
        totalCount: Int!
        edges: [PlantEdge]!
        pageInfo: PageInfo!
    }

    type PostConnection {
        totalCount: Int!
        edges: [PostEdge]!
        pageInfo: PageInfo!
    }

    type ImageConnection {
        totalCount: Int!
        edges: [ImageEdge]!
        pageInfo: PageInfo!
    }

    type UserEdge {
        cursor: ID!
        node: User
    }

    type GardenEdge {
        cursor: ID!
        node: Garden
    }

    type PlantEdge {
        cursor: ID!
        node: Plant
    }

    type PostEdge {
        cursor: ID!
        node: Post
    }

    type ImageEdge {
        cursor: ID!
        node: Post
    }

    type PageInfo {
        hasPreviousPage: Boolean!
        hasNextPage: Boolean!
        startCursor: ID!
        endCursor: ID!
    }

    type QueryRoot {
        user(id: ID!): User
    }

    type MutationRoot {
        createImageForPlant(plantID: ID!, fileExt: String!, description: String!): PendingImage!
    }

    schema {
        query: QueryRoot
        mutation: MutationRoot
    }
`);