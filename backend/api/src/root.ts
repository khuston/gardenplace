import { RootValue, MasterLoader } from "./loaders/types"
import { ImageCreator } from "./imageCreator";

export function makeRootValue(load: MasterLoader, imageCreator: ImageCreator): RootValue {

    // Resolvers on root are wired directly to the MasterLoader.
    // Other resolvers expect to find it as the `load` property on context.
    return ({
        user: load.user,
        plant: load.plant,
        createImageForPlant: imageCreator.createForPlant

    })
}