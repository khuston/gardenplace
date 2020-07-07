import axios from "axios";
import Config from 'Config';

const login_endpoint = Config.serverUrl + ":9001/login";
const logout_endpoint = Config.serverUrl + ":9001/logout";
const registration_endpoint = Config.serverUrl + ":9001/register";
const api_endpoint = Config.serverUrl + ":9001/api"

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
        .post(login_endpoint, payload, { withCredentials: true })
        .catch(error => {
            console.log(error)
            handleError(error.response.data);
        })
        .then(response => {
            if (response.status === 200) {
                if (response.data.LoggedIn === true) {
                    handleSuccess();
                }
                else if (response.data.RequireTwoFactor === true) {
                    handleRequireTwoFactor()
                }
                else {
                    handleError(response.data)
                }
            }
        })
}

export function logoutUser(handleSuccess) {
    axios
        .post(logout_endpoint, {}, { withCredentials: true })
        .catch(error => {
            console.log(error)
        })
        .then(response => {
            handleSuccess()
        })
}

export function checkLoggedIn() {
    axios
        .post(api_endpoint, {}, { withCredentials: true })
        .catch(error => {
            return false
        })
        
    return true
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
    }
}

function make_login_payload(email, password, one_time_password) {
    return {
        Email: email,
        Password: password,
        OneTimePassword: one_time_password
    }
}