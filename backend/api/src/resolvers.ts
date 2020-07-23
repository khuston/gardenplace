import { makeUserLoader } from "./userLoader";
import { RootValue, ID, User, UserArgs, CreateImageArgs } from "./types";
import { DBPool } from "./db";

export function makeRootValue(dbPool: DBPool): RootValue {

    const userLoader = makeUserLoader(dbPool);)

    return ({
        user: async (args: UserArgs) => {
            const { id } = args;
            return userLoader.load(id);
        }
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