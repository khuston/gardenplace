import { buildSchema } from "graphql";

// Construct a schema, using GraphQL schema language
export const schema = buildSchema(`
    scalar DateTime

    type User {
        id: ID!
        name: String
        email: String!
        gardenRelations: GardenRelations
        plantRelations: PlantRelations
        followees: [User]
        followers: [User]
        posts: [Post]
    }

    type Garden {
        name: String!
        plantRelations: PlantRelations
        gardenerRelations: GardenerRelations
        ownerRelations: OwnerRelations
        images: [Image]!
    }

    type Plant {
        id: ID!
        name: String!
        garden: Garden
        images: [Image]!
    }

    type Image {
        url: String!
        uploaded: DateTime!
        description: String!
    }

    type Post {
        author: User!
        firstPublished: DateTime!
        lastEdited: DateTime
        text: String!
        images: [Image]
    }

    type OwnerRelations {
        count: Int!
        owners: [User]!
    }

    type GardenRelations {
        ownedGardenCount: Int!
        gardenCount: Int!
        ownedGardens: [Garden]!
        gardens: [Garden]!
    }

    type PlantRelations {
        ownedPlantCount: Int!
        ownedPlants: [Plant]!
    }

    type GardenerRelations {
        count: Int!
        gardeners: [User]!
    }

    type QueryRoot {
        user(id: ID!): User
    }

    schema {
        query: QueryRoot
        # query: Query
    }
`);

/*        getGardensByOwner(id: ID!): [Garden]
getGardensByGardener: (id: ID!): [Garden]
getPlantsByOwner: (id: ID!): [Plant]
getFolloweesOfUser: (id: ID!): [User]
getFollowersOfUser: (id: ID!): [User]
getPostsByAuthor: (id: ID!): [User]*/