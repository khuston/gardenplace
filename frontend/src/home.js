import React from "react";
import { Link } from "react-router-dom";
import { logoutUser } from "./auth/auth";
import Welcome from "./auth/login";

function Home(props) {
    if (props.loggedIn) {
        return <LoggedInHome {...props} />
    }
    else {
        return <Welcome {...props} />
    }
}

function LoggedInHome(props) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Navbar setLoggedIn={props.setLoggedIn}></Navbar>
            Favorite Gardens
            <FavoriteGardens></FavoriteGardens>
            Favorite Plants
            <FavoritePlants></FavoritePlants>
            Connections Activity
            <ConnectionsActivity></ConnectionsActivity>
        </div>
    )    
}

function Navbar(props) {

    function onClickLogout(event) {
        logoutUser(() => { props.setLoggedIn(false) })
    }

    return (
        <div>
            <Link to="/connect">Connect</Link>
            <Link to="/about">About</Link>
            <Link to="/account">Account</Link>
            <a href="#" onClick={onClickLogout}>Logout</a>
        </div>
    )
}

function BlankElement(props) {
    return (
        <div></div>
    )
}

let FavoriteGardens = BlankElement;
let FavoritePlants = BlankElement;
let ConnectionsActivity = BlankElement;

export default Home;