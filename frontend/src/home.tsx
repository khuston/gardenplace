import * as React from "react";
import { Link } from "react-router-dom";
import Welcome from "./auth/login";
import { useLocation } from "react-router-dom";
import { VerificationWaitingPage } from "./auth/verify_email";
import { CommonHeader } from "./header"
import { PropsWithLoggedIn, PropsWithLoggedInSetter } from "./props"
import * as styles from "./css/gardenplace.css"

function Home(props: PropsWithLoggedIn & PropsWithLoggedInSetter) {

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

function LoggedInHome(props: PropsWithLoggedIn & PropsWithLoggedInSetter) {
    return (
        <div>
            <CommonHeader setLoggedIn={props.setLoggedIn}/>
            <h2>My Plants</h2>
            <MyPlants myPlants={[{imageUrl: ""}, {imageUrl: ""}]}/>
            <h2>Recent Activity</h2>
            <RecentActivity />
        </div>
    )    
}

interface Plant {
    imageUrl: string
}

interface PropsWithMyPlants {
    myPlants: Array<Plant>
}

function MyPlants(props: PropsWithMyPlants) {

    const myPlants = props.myPlants.map((plant) =>
        <img className={styles.myPlantsThumbnail}
            key={plant.imageUrl} src={plant.imageUrl} />
        );

    return(
        <div>
            <NewPlant />
            {myPlants}
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