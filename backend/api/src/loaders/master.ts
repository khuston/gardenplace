import { MasterLoader } from "./types"
import { DBPool } from "../db"
import { makeUserLoader } from "./userLoader"
import { makeUserPlantConnectionLoader } from "./userPlantConnectionLoader"
import { makePlantLoader } from "./plantLoader"

export function makeMasterLoader(dbPool: DBPool): MasterLoader {

    return ({
            user: makeUserLoader(dbPool),
            userPlantConnection: makeUserPlantConnectionLoader(dbPool),
            plant: makePlantLoader(dbPool)
    })
}