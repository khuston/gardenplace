import axios from "axios";
import Config from 'Config';

const login_endpoint = Config.serverUrl + ":9001/login";
const logout_endpoint = Config.serverUrl + ":9001/logout";
const registration_endpoint = Config.serverUrl + ":9001/register";
const verification_endpoint = Config.serverUrl + ":9001/verify";
const api_endpoint = Config.serverUrl + ":9002/api"

export function registerUser(email, password, password_reentered, handleSuccess, handleError) {
    let payload = make_registration_payload(email, password, password_reentered);

    axios
        .post(registration_endpoint, payload)
        .then(response => {
            if (response.status === 201) {
                handleSuccess();
            }
            else {
                handleError({response: response})
            }
        })
        .catch(error => handleError(error))
}

export function loginUser(email, password, handleSuccess, handleError, handleRequireTwoFactor, handleRequireEmailVerification) {

    // 1. Get Nonce Cookie (e-mail required because nonce is per-user)
    var payload = make_getnonce_payload(email);
    axios
        .post(login_endpoint, payload, { withCredentials: true })
        .catch(error => handleError(error))
        .then(() => {
            // 2. Submit Login Credentials with Nonce Cookie
            payload = make_login_payload(email, password);
            axios
                .post(login_endpoint, payload, { withCredentials: true })
                .catch(error => handleError(error))
                .then(response => {
                    if (response && response.status === 200) {
                        if (response.data.LoggedIn === true) {
                            handleSuccess();
                        }
                        else if (response.data.RequireTwoFactor === true) {
                            handleRequireTwoFactor()
                        }
                        else if (response.data.RequireEmailVerification === true) {
                            handleRequireEmailVerification()
                        }
                        else {
                            handleError({response: response})
                        }
                    }
                })
        })
}

export function logoutUser(handleSuccess) {
    axios
        .post(logout_endpoint, {}, { withCredentials: true })
        .catch(error => {
            console.log(error)
        })
        .then(handleSuccess)
}

export function verifyEmail(code, handleSuccess, handleFailure) {
    axios
        .post(verification_endpoint, {verificationCode: code})
        .catch(handleFailure)
        .then(response => {
            if (response && response.status === 200) {
                handleSuccess()
            }
            else {
                handleFailure()
            }
        })
}

export function checkLoggedIn() {
    axios
        .post(api_endpoint, {}, { withCredentials: true })
        .catch(error => {
            return false
        })
        .then(response => {
            if (response.status === 200) {
                return true
            }
            else {
                return false
            }
        })
}

function make_registration_payload(email, password, password_reentered) {
    return {
        email: email,
        password: password,
        passwordReentered: password_reentered,
    }
}

function make_login_payload(email, password, one_time_password) {
    return {
        email: email,
        password: password,
        oneTimePassword: one_time_password
    }
}

function make_getnonce_payload(email) {
    return {
        email: email,
        getNonce: true
    }
}