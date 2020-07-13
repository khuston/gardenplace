import { GraphQLType } from "graphql";
import { makeUserLoader } from "./userLoader";
import { RootValue, ID, User, UserArgs } from "./types";
import mysql from "mysql";

export function makeRootValue(db: mysql.Connection): RootValue {

    const userLoader = makeUserLoader(db);

    return ({
        user: async (args: UserArgs) => {
            const { id } = args;
            return userLoader.load(id);
        },
        /*gardensByOwner: async (args: UserArgs) => {
            const { id } = args;
            return getGardensByOwner(id);
        },
        gardensByGardener: (id: ID) => Promise<Garden[]>;
        plantsByOwner: (id: ID) => Promise<Plant[]>;
        followeesOfUser: (id: ID) => Promise<User[]>;
        followersOfUser: (id: ID) => Promise<User[]>;
        postsByAuthor: (id: ID) => Promise<User[]>;*/
    }
    )
}
/*
async function getGardensByOwner(id: ID): Promise<Garden[]> {
    let gardenIDs = gardenOwnerLoader.load(id)

    return gardenLoader.loadMany(gardenIDs)
}

async function getGardensByGardener(id: ID): Promise<Garden[]> {
    let gardenIDs = gardenOwnerLoader.load(id)

    return gardenLoader.loadMany(gardenIDs)
}
*/