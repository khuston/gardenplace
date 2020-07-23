import * as React from "react"
import { useState, useEffect } from "react";
import { verifyEmail } from "./auth";
import { useHistory } from "react-router-dom";
import { PropsWithLoggedIn } from "../props";
import * as styles from "../css/gardenplace.css"

export function VerifyEmail(props: PropsWithLoggedIn & PropsWithVerificationCode) {

    let alreadySubmitted = !(props.verificationCode === undefined)

    const [verificationCode, setVerificationCode] = useState<string>(alreadySubmitted ? props.verificationCode : "")

    const [submitted, setSubmitted] = useState<boolean>(alreadySubmitted)

    if (submitted) {
        return <VerificationWaitingPage verificationCode={verificationCode} />
    }
    else {
        return <VerificationCodeEntry verificationCode={verificationCode} setVerificationCode={setVerificationCode} submit={() => setSubmitted(true)} />
    }
}

function VerificationCodeEntry(props: PropsWithVerificationCode & PropsWithVerificationCodeSetter & PropsWithSubmit) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <form className={styles.loginForm} onSubmit={props.submit}>
                You must verify ownership of the e-mail address you provided. Check your inbox and enter the verification code.
                <input className={styles.loginInput} type="text" name="verificationCode" placeholder="Verification Code"
                    value={props.verificationCode} onChange={(event) => {props.setVerificationCode(event.target.value)}} required />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export function VerificationWaitingPage(props: PropsWithVerificationCode) {
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

interface PropsWithSubmit {
    submit: VoidFunction
}

interface PropsWithVerificationCodeSetter {
    setVerificationCode: React.Dispatch<React.SetStateAction<string>>
}

interface PropsWithVerificationCode {
    verificationCode: string
}