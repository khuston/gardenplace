//@flow
import React from "react";
import { Link } from "react-router-dom";
import Welcome from "./auth/login";
import { useLocation } from "react-router-dom";
import { VerificationWaitingPage } from "./auth/verify_email";
import { CommonHeader } from "./header.js"
//$FlowFixMe
import Config from 'Config';
import styles from "./css/gardenplace.css"

function Home(props: Object) {

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

function LoggedInHome(props: Object) {
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

function MyPlants(props) {

    const myPlants = props.myPlants.map((plant) =>
        <img className="my-plants-thumbnail"
            key={plant.imageUrl} src={plant.imageUrl} />
        );

    return(
        <div className="my-plants">
            <NewPlant />
            {myPlants}
        </div>
    )
}

function NewPlant(props) {
    return (
        <Link to="/new_plant">
            <img className="my-plants-thumbnail" src={Config.publicStaticDir + "/add-plant.png"} />
        </Link>
    )
}

function RecentActivity(props) {
    return(
        <div></div>
    )

}

export default Home;