import * as React from "react";
import { Link } from "react-router-dom";
import { logoutUser } from "./auth/auth";
import { useHistory } from "react-router-dom";
import { PropsWithLoggedInSetter } from "./props";
import * as styles from "./css/gardenplace.css"

export function CommonHeader(props: PropsWithLoggedInSetter) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Navbar setLoggedIn={props.setLoggedIn}></Navbar>
        </div>
    )
}

function Navbar(props: PropsWithLoggedInSetter) {
    const history = useHistory()

    function onClickLogout(event: React.SyntheticEvent) {
        logoutUser(() => { props.setLoggedIn(false) })
        history.push("/")
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