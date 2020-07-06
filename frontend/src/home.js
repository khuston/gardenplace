import React from "react";
import { Link } from "react-router-dom";

function Home(props) {
    if (props.loggedIn) {
        return LoggedInHome(props);
    }
    else {
        return LoggedOutHome(props);
    }
}

function LoggedInHome(props) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Navbar loggedIn={props.loggedIn}></Navbar>
            Favorite Gardens
            <FavoriteGardens></FavoriteGardens>
            Favorite Plants
            <FavoritePlants></FavoritePlants>
            Connections Activity
            <ConnectionsActivity></ConnectionsActivity>
        </div>
    )    
}

function LoggedOutHome(props) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/login">Login</Link>            
            <Link to="/register">Register</Link>
        </div>
    )
}

function Navbar(props) {
    return (
        <div>
            <Link to="/about">Connect</Link>
            <Link to="/about">About</Link>
            <Link to="/about">Settings</Link>
            <Link to="/about">Logout</Link>
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