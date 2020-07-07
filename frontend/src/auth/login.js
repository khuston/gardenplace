import React, { useState } from "react";
import { Link } from "react-router-dom";
import { default_login_payload, loginUser } from "./auth";
import { useHistory } from "react-router-dom";

function Login(props) {
    const history = useHistory();

    const [state, setState] = useState(
        default_login_payload()
    )

    const [loginStatus, setLoginStatus] = useState("");

    function handleLoginSuccess() {
        props.setLoggedIn(true);

        history.push("/");
    }

    function handleLoginError(event) {
        setLoginStatus("FAILED");
    }

    function handleChange(event) {
        event.persist();
        setState(prevState => {
            let newState = Object.assign({}, prevState);
            newState[event.target.name] = event.target.value;
            return newState;
        })
    }

    function handleSubmit(event) {
        event.preventDefault();

        setLoginStatus("IN PROGRESS");

        const { email, password } = state;

        loginUser(email, password, handleLoginSuccess, handleLoginError);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/">Home</Link>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="E-mail address" value={state.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={state.password} onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            <LoginStatus loginStatus={loginStatus} />
        </div>
    )
}

function LoginStatus(props) {
    let status_message = "";
    if (props.LoginStatus === "FAILED") {
        status_message = "Login failed. Why?"
    }
    else if (props.LoginStatus === "IN PROGRESS") {
        status_message ="Login in progress."
    }

    return (
        <div>{status_message}</div>
    )
}

export default Login;