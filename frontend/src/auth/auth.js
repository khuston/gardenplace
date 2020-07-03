import axios from "axios";
import Config from 'Config';

const loggedin_endpoint = Config.serverUrl + ":9001/loggedin";
const registration_endpoint = Config.serverUrl + ":9001/register";

console.log(Config)

export function checkLoggedIn(setLoggedIn, setUserID) {
    axios
        .get(loggedin_endpoint,
            { withCredentials: true } // send cookies
            )
        .then(response => {
            if (response.data.logged_in) {
                setLoggedIn(true);
                setUserID(response.data.user_id);
            }
            else {
                setLoggedIn(false);
                setUserID("");
            }
        })
        .catch(error => {
            console.log("Error while checking login", error);
        })
}

export function registerUser(email, password, password_reentered, handleSuccess, handleError) {
    let payload = make_registration_payload(email, password, password_reentered);

    axios
        .post(registration_endpoint, payload)
        .then(response => {
            if (response.status === 201) {
                handleSuccess();
            }
            else {
                handleError(response.data)
            }
        })
        .catch(error => {
            handleError(error.response.data);
        })
}

export function loginUser(email, password, handleSuccess, handleError, handleRequireTwoFactor) {
    let payload = make_login_payload(email, password);

    axios
        .post(login_requires_twofactor_endpoint, payload)
        .then(response => {
            if (response.data.status === "created") { // TODO: What will the response status be?

                // if two factor required, ask user for it

                handleSuccess();
            }
        })
        .catch(error => {
            handleError(error.response.data);
        })
}

export function default_registration_payload() {
    return make_registration_payload("", "", "")
}

export function default_login_payload() {
    return make_login_payload("", "", "")
}

function make_registration_payload(email, password, password_reentered) {
    return {
        Email: email,
        Password: password,
        PasswordReentered: password_reentered,
        SessionID: 0
    }
}

function make_login_payload(email, password, one_time_password) {
    return {
        Email: email,
        Password: password,
        OneTimePassword: one_time_password
    }
}