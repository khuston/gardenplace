import React, { useState, useEffect } from "react";
import { verifyEmail } from "./auth";
import { useHistory } from "react-router-dom";
import styles from '../css/gardenplace.css'

export function VerifyEmail(props) {

    const [verificationCode, setVerificationCode] = useState(props.verificationCode)

    let alreadySubmitted = !(props.verificationCode === undefined)
    const [submitted, setSubmitted] = useState(alreadySubmitted)

    if (submitted) {
        return <VerificationWaitingPage verificationCode={verificationCode} />
    }
    else {
        return <VerificationCodeEntry setVerificationCode={setVerificationCode} submit={() => setSubmitted(true)} />
    }
}

function VerificationCodeEntry(props) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <form className="login-form" onSubmit={props.submit}>
                You must verify ownership of the e-mail address you provided. Check your inbox and enter the verification code.
                <input className="login-input" type="text" name="verificationCode" placeholder="Verification Code"
                    value={props.verificationCode} onChange={(event) => {props.setVerificationCode(event.target.value)}} required />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export function VerificationWaitingPage(props) {
    const history = useHistory();

    const [message, setMessage] = useState("Verifying e-mail address...")
    const [destination, setDestination] = useState("")

    useEffect(() => {
        function handleVerifySuccess() {
            setMessage("Your e-mail is now verified.")
            setDestination("Proceed to Login")
        }
        function handleVerifyFail() {
            setMessage("This e-mail is already verified, or the code is invalid.")
            setDestination("Return Home")
        }
        verifyEmail(props.verificationCode, handleVerifySuccess, handleVerifyFail)
    }, [props.verificationCode])
    return (
        <div>
            <p>{message}</p>
            <a href="#" onClick={() => history.push("/")}>{destination}</a>
        </div>
    )
}