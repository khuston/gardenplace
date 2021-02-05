import * as React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import Welcome from "./auth/login";
import { useLocation } from "react-router-dom";
import { VerificationWaitingPage } from "./auth/verify_email";
import { CommonHeader } from "./header"
import { PropsWithLoggedIn, PropsWithHandleLogin, PropsWithHandleLogout } from "./props"
import * as styles from "./css/gardenplace.css"
import PlantPreview from "./relay/renderers/plantPreview"
import { ID } from "./primitives"

function Home(props: PropsWithLoggedIn & PropsWithHandleLogin & PropsWithHandleLogout) {

    let verificationCode = (new URLSearchParams(useLocation().search)).get("verification_code")

    if (verificationCode) {
        return <VerificationWaitingPage verificationCode={verificationCode} {...props} />
    }
    else if (props.loggedIn) {
        return <LoggedInHome {...props} />
    }
    else {
        return <Welcome {...props} />
    }
}

function LoggedInHome(props: PropsWithLoggedIn & PropsWithHandleLogout) {
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

    return (
        <div>
            <CommonHeader handleLogout={props.handleLogout}/>
            <h2>My Plants</h2>
            <MyPlants {...props} />
            <h2>Recent Activity</h2>
            <RecentActivity />
        </div>
    )    
}

interface Plant {
    imageUrl: string
}

function MyPlants(props: PropsWithLoggedIn) {

    return(
        <div>
            <NewPlant />
            {PlantPreview}
        </div>
    )
}

function NewPlant(props: any) {
    return (
        <Link to="/new_plant">
            <img className={styles.myPlantsThumbnail} src={gardenplaceConfiguration.publicStaticDir + "/add-plant.png"} />
        </Link>
    )
}

function RecentActivity(props: any) {
    return(
        <div></div>
    )

}

export default Home;