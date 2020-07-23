import { makeUserLoader } from "./userLoader";
import { RootValue, ID, User, UserArgs, CreateImageArgs } from "./types";
import { DBPool } from "./db";
import AWS from "aws-sdk";
import { makeImageCreator, S3Params } from "./imageCreator";

export function makeRootValue(dbPool: DBPool, s3: AWS.S3, s3Params: S3Params): RootValue {

    const userLoader = makeUserLoader(dbPool);

    const imageCreator = makeImageCreator(dbPool, s3, s3Params)

    return ({
        user: async (args: UserArgs) => {
            const { id } = args;
            return userLoader.load(id);
        },
        createImageForPlant: async (args: CreateImageArgs) => {
            const { plantID, fileExt, description } = args;

            return imageCreator.createForPlant(plantID, fileExt, description);
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