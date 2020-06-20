import React from "react";
import { Link } from "react-router-dom";

function Home(props) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/about">Connect</Link>
            <Link to="/about">About</Link>
            <Link to="/about">Settings</Link>
            <Link to="/about">Logout</Link>
            <Navbar></Navbar>
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
    return (
        <div></div>
    )
}

let FavoriteGardens = Navbar;
let FavoritePlants = Navbar;
let ConnectionsActivity = Navbar;

export default Home;