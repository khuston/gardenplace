//@flow
import React, { useState } from "react";
import { loginUser, registerUser } from "./auth";
import { useHistory } from "react-router-dom";
//$FlowFixMe
import Config from 'Config';
import styles from '../css/gardenplace.css'

function Welcome(props: Object) {
    const [registerPopup, setRegisterPopup] = useState(false)

    const [fields, setFields] = useState({
        email: "",
        password: "",
        passwordReentered: "",
        oneTimePassword: ""
    })

    const [disabled, setDisabled] = useState(false)

    function handleFieldChange(event) {
        setFields({
            ...fields,
            [event.target.name]: event.target.value
        })
    }

    return (
        <div>
            <h1>Gardenplace</h1>
            <div className="home-box">
                <div className="home-image-pane">
                    <img className="splash-image" src={Config.publicStaticDir + "/splash.jpg"}></img>
                </div>
                <div className="home-user-pane">
                    <LoginBox isPopped={!registerPopup} popup={() => setRegisterPopup(false)} fields={fields} onChange={handleFieldChange} 
                        disabled={disabled} setDisabled={setDisabled} setLoggedIn={props.setLoggedIn} />
                    <RegisterBox isPopped={registerPopup} popup={() => setRegisterPopup(true)} fields={fields} onChange={handleFieldChange}
                        disabled={disabled} setDisabled={setDisabled} />
                </div>
            </div>
        </div>
    )
}


function LoginBox(props) {
    if (props.isPopped) {
        return <BigLoginBox {...props} />
    }
    else {
        return <LittleLoginBox {...props} />
    }
}

function RegisterBox(props) {
    if (props.isPopped) {
        return <FullRegisterBox {...props} />
    }
    else {
        return <LittleRegisterBox {...props} />
    }
}

function LittleLoginBox(props) {
    return (
        <div className="login-box">
            <button onClick={props.popup} disabled={props.disabled}>Log In</button>
        </div>
    )
}

function LittleRegisterBox(props) {
    return (
        <div className="login-box">
            <button onClick={props.popup} disabled={props.disabled}>Sign Up</button>
        </div>
    )
}

function BigLoginBox(props) {
    const history = useHistory();

    const [loginStatus, setLoginStatus] = useState("");

    function handleLoginSuccess() {
        props.setLoggedIn(true);

        history.push("/");
    }

    function handleLoginError(error) {
        if (error.response) {
            setLoginStatus(error.response.data);
        }
        else if (error.request) {
            setLoginStatus("Server Unresponsive. Try again later.")
        }
        else {
            console.log(error)
        }

        props.setDisabled(false)
    }

    function handleRequireEmailVerification() {
        history.push("/verify_email")
    }

    function handleSubmit(event) {
        event.preventDefault();

        props.setDisabled(true)
        setLoginStatus("");

        const { email, password } = props.fields;

        loginUser(email, password, handleLoginSuccess, handleLoginError, () => {}, handleRequireEmailVerification);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div className="login-box">
            <form className="login-form" onSubmit={handleSubmit}>
                <input className="login-input" type="email" name="email" placeholder="E-mail address"
                    value={props.fields.email} onChange={props.onChange} disabled={props.disabled} required />
                <input className="login-input" type="password" name="password" placeholder="Password"
                    value={props.fields.password} onChange={props.onChange} disabled={props.disabled} required />
                <button type="submit" disabled={props.disabled}>Log In</button>
            </form>
            <LoginStatus loginStatus={loginStatus} />
        </div>
    )
}

function FullRegisterBox(props) {
    const history = useHistory();

    const [registrationStatus, setRegistrationStatus] = useState("");

    function handleRegistrationSuccess() {
        history.push("/verify_email");
    }

    function handleRegistrationError(error) {
        if (error.response) {
            setRegistrationStatus(error.response.data);
        }
        else if (error.request) {
            setRegistrationStatus("There was no response from the server. Try again later.")
        }
        else {
            console.log(error)
        }

        props.setDisabled(false)
    }

    function handleSubmit(event) {
        event.preventDefault();

        props.setDisabled(true)
        setRegistrationStatus("");

        const { email, password, passwordReentered } = props.fields;

        registerUser(email, password, passwordReentered, handleRegistrationSuccess, handleRegistrationError);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div className="login-box">
            <form className="login-form" onSubmit={handleSubmit}>
                <input className="login-input" type="email" name="email" placeholder="E-mail address"
                    value={props.fields.email} onChange={props.onChange} disabled={props.disabled} required />
                <input className="login-input" type="password" name="password" placeholder="Password"
                    value={props.fields.password} onChange={props.onChange} disabled={props.disabled} required />
                <input className="login-input" type="password" name="passwordReentered" placeholder="Re-enter Password" 
                    value={props.fields.passwordReentered} onChange={props.onChange} disabled={props.disabled} required />
                <button type="submit" disabled={props.disabled}>Sign Up</button>
            </form>
            <RegistrationStatus registrationStatus={registrationStatus} />
        </div>
    )
}

function LoginStatus(props) {
    let status_message = props.loginStatus

    return (
        <div className="login-status">{status_message}</div>
    )
}

function RegistrationStatus(props) {
    let status_message = props.registrationStatus

    return (
        <div className="login-status">{status_message}</div>
    )
}

export default Welcome;