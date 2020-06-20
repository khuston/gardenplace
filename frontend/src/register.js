import React, { useState } from "react";
import { Link } from "react-router-dom";
import { default_registration_payload, registerUser } from "./auth";

function Register(props) {
    const [state, setState] = useState(
        default_registration_payload()
    )

    let error_message = "";
    if (props.registrationFailed) {
        error_message = "Registration failed. Try again later. :("
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

        const { email, password, password_reentered } = state;

        registerUser(email, password, password_reentered, props.handleRegistrationSuccess, props.handleRegistrationError);

        return false; // Prevent default submit behavior since we override it
    }

    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/">Home</Link>
            <p>{error_message}</p>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="E-mail address" value={state.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={state.password} onChange={handleChange} required />
                <input type="password" name="password_reentered" placeholder="Re-enter Password" value={state.password_reentered} onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register;