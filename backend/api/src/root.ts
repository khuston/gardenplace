import { RootValue, MasterLoader } from "./loaders/types"
import { ImageCreator } from "./imageCreator";

export function makeRootValue(load: MasterLoader, imageCreator: ImageCreator): RootValue {

    // Resolvers on root are wired directly to the MasterLoader.
    // Other resolvers expect to find it as the `load` property on context.
    return ({
        currentUser: load.currentUser,
        user: load.user,
        plant: load.plant,
        garden: load.garden,
        post: load.post,
        createImageForPlant: imageCreator.createForPlant

    })
}