import * as React from "react";
import { useState } from "react";
import { loginUser, registerUser, LoginPayload, RegistrationPayload } from "./auth";
import { useHistory } from "react-router-dom";
import { AxiosError } from "axios"
import { PropsWithLoggedInSetter } from "../props";
import * as styles from "../css/gardenplace.css"

function Welcome(props: PropsWithLoggedInSetter) {
    const [registerPopup, setRegisterPopup] = useState(false)

    const [fields, setFields] = useState<LoginPayload & RegistrationPayload>({
        email: "",
        password: "",
        passwordReentered: "",
        oneTimePassword: ""
    })

    const [disabled, setDisabled] = useState(false)

    function handleFieldChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFields({
            ...fields,
            [event.target.name]: event.target.value
        })
    }

    return (
        <div>
            <h1>Gardenplace</h1>
            <div className={styles.homeBox}>
                <div className={styles.homeImagePane}>
                    <img className={styles.splashImage} src={gardenplaceConfiguration.publicStaticDir + "/splash.jpg"}></img>
                </div>
                <div className={styles.homeUserPane}>
                    <LoginBox isPopped={!registerPopup} popup={() => setRegisterPopup(false)} fields={fields} onChange={handleFieldChange} 
                        disabled={disabled} setDisabled={setDisabled} setLoggedIn={props.setLoggedIn} />
                    <RegisterBox isPopped={registerPopup} popup={() => setRegisterPopup(true)} fields={fields} onChange={handleFieldChange}
                        disabled={disabled} setDisabled={setDisabled} />
                </div>
            </div>
        </div>
    )
}

interface PoppableProp {
    isPopped: boolean
    popup: VoidFunction
}

interface PropWithDisabled {
    disabled: boolean
}

interface PropWithDisabledSetter {
    setDisabled: React.Dispatch<React.SetStateAction<boolean>>
}

interface PropsWithAuthFields {
    fields: LoginPayload & RegistrationPayload
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}


function LoginBox(props: PropsWithLoggedInSetter & PoppableProp & PropWithDisabled & PropWithDisabledSetter & PropsWithAuthFields) {
    if (props.isPopped) {
        return <BigLoginBox {...props} />
    }
    else {
        return <LittleLoginBox {...props} />
    }
}

function RegisterBox(props: PoppableProp & PropWithDisabled & PropWithDisabledSetter & PropsWithAuthFields) {
    if (props.isPopped) {
        return <FullRegisterBox {...props} />
    }
    else {
        return <LittleRegisterBox {...props} />
    }
}

function LittleLoginBox(props: PoppableProp & PropWithDisabled) {
    return (
        <div className={styles.loginBox}>
            <button onClick={props.popup} disabled={props.disabled}>Log In</button>
        </div>
    )
}

function LittleRegisterBox(props: PoppableProp & PropWithDisabled) {
    return (
        <div className={styles.loginBox}>
            <button onClick={props.popup} disabled={props.disabled}>Sign Up</button>
        </div>
    )
}

function BigLoginBox(props: PropsWithLoggedInSetter & PoppableProp & PropWithDisabled & PropWithDisabledSetter & PropsWithAuthFields) {
    const history = useHistory();

    const [loginStatus, setLoginStatus] = useState("");

    function handleLoginSuccess() {
        props.setLoggedIn(true);

        history.push("/");
    }

    function handleLoginError(error: AxiosError) {
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

    function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();

        props.setDisabled(true)
        setLoginStatus("");

        const { email, password } = props.fields;

        loginUser(email, password, handleLoginSuccess, handleLoginError, () => {}, handleRequireEmailVerification);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div className={styles.loginBox}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <input className={styles.loginInput} type="email" name="email" placeholder="E-mail address"
                    value={props.fields.email} onChange={props.onChange} disabled={props.disabled} required />
                <input className={styles.loginInput} type="password" name="password" placeholder="Password"
                    value={props.fields.password} onChange={props.onChange} disabled={props.disabled} required />
                <button type="submit" disabled={props.disabled}>Log In</button>
            </form>
            <StatusMessage status={loginStatus} />
        </div>
    )
}

function FullRegisterBox(props: PoppableProp & PropWithDisabled & PropWithDisabledSetter & PropsWithAuthFields) {
    const history = useHistory();

    const [registrationStatus, setRegistrationStatus] = useState("");

    function handleRegistrationSuccess() {
        history.push("/verify_email");
    }

    function handleRegistrationError(error: AxiosError) {
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

    function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();

        props.setDisabled(true)
        setRegistrationStatus("");

        const { email, password, passwordReentered } = props.fields;

        registerUser(email, password, passwordReentered, handleRegistrationSuccess, handleRegistrationError);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div className={styles.loginBox}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <input className={styles.loginInput} type="email" name="email" placeholder="E-mail address"
                    value={props.fields.email} onChange={props.onChange} disabled={props.disabled} required />
                <input className={styles.loginInput} type="password" name="password" placeholder="Password"
                    value={props.fields.password} onChange={props.onChange} disabled={props.disabled} required />
                <input className={styles.loginInput} type="password" name="passwordReentered" placeholder="Re-enter Password" 
                    value={props.fields.passwordReentered} onChange={props.onChange} disabled={props.disabled} required />
                <button type="submit" disabled={props.disabled}>Sign Up</button>
            </form>
            <StatusMessage status={registrationStatus} />
        </div>
    )
}

interface PropsWithStatusMessage {
    status: string
}

function StatusMessage(props: PropsWithStatusMessage) {
    let status_message = props.status

    return (
        <div className={styles.loginStatus}>{status_message}</div>
    )
}

export default Welcome;