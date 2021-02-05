import { MasterLoader } from "./types"
import { ContextWithLoaders } from "./types"
import { DBPool } from "../db"
import { makeUserLoader } from "./userLoader"
import { makeConnectionLoader } from "./connectionLoader"
import { makePlantLoader } from "./plantLoader"
import { ID } from "../data/primitives"
import { IDable, User, Plant, Garden, Post } from "../data/types"
import { makeGardenLoader } from "./gardenLoader"
import { makePostLoader } from "./postLoader"

export function makeMasterLoader(dbPool: DBPool, userID: ID): MasterLoader {

    return ({
            currentUser: (_: IDable, args: any, context: ContextWithLoaders, info: any) => this.user(userID, args, context, info),
            user: makeUserLoader(dbPool),
            plant: makePlantLoader(dbPool),
            garden: makeGardenLoader(dbPool),
            post: makePostLoader(dbPool),
            userPlantConnection: makeConnectionLoader<User, Plant>(dbPool, "plant_owners", "owner_id", "plant_id", "plant"),
            userGardenConnection: makeConnectionLoader<User, Garden>(dbPool, "gardeners", "user_id", "garden_id", "garden"),
            ownerGardenConnection: makeConnectionLoader<User, Garden>(dbPool, "garden_owners", "owner_id", "garden_id", "garden"),
            followeeConnection: makeConnectionLoader<User, User>(dbPool, "followers", "follower_id", "user_id", "user"),
            followerConnection: makeConnectionLoader<User, User>(dbPool, "followers", "user_id", "follower_id", "user"),
            authorPostConnection: makeConnectionLoader<User, Post>(dbPool, "posts", "author_id", "id", "post"),
            gardenPlantConnection: makeConnectionLoader<Garden, Plant>(dbPool, "plants", "garden_id", "id", "plant"),
            gardenUserConnection: makeConnectionLoader<Garden, User>(dbPool, "gardeners", "garden_id", "user_id", "user"),
            gardenOwnerConnection: makeConnectionLoader<Garden, User>(dbPool, "garden_owners", "garden_id", "owner_id", "user"),
            plantOwnerConnection: makeConnectionLoader<Plant, User>(dbPool, "plant_owners", "plant_id", "owner_id", "user"),
    })
}