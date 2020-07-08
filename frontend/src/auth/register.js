import React, { useState } from "react";
import { Link } from "react-router-dom";
import { default_registration_payload, registerUser } from "./auth";
import { useHistory } from "react-router-dom";

function Register(props) {
    const history = useHistory();

    const [state, setState] = useState(
        default_registration_payload()
    )

    const [registrationStatus, setRegistrationStatus] = useState("");

    function handleRegistrationSuccess() {
        history.push("/verify_email");
    }

    function handleRegistrationError(response_data) {
        setRegistrationStatus(response_data);
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

        setRegistrationStatus("IN PROGRESS");

        const { email, password, password_reentered } = state;

        registerUser(email, password, password_reentered, handleRegistrationSuccess, handleRegistrationError);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/">Home</Link>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="E-mail address" value={state.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={state.password} onChange={handleChange} required />
                <input type="password" name="password_reentered" placeholder="Re-enter Password" value={state.password_reentered} onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
            <RegistrationStatus registrationStatus={registrationStatus} />
        </div>
    )
}

function RegistrationStatus(props) {
    let status_message = "";
    if (props.registrationStatus === "IN PROGRESS") {
        status_message ="Registration in progress."
    }
    else {
        status_message = props.registrationStatus
    }

    return (
        <div>{status_message}</div>
    )
}

export default Register;