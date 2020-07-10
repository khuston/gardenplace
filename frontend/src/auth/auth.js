//@flow
import axios from "axios";
//$FlowFixMe
import Config from 'Config';

const login_endpoint = Config.serverUrl + ":9001/login";
const logout_endpoint = Config.serverUrl + ":9001/logout";
const registration_endpoint = Config.serverUrl + ":9001/register";
const verification_endpoint = Config.serverUrl + ":9001/verify";
const api_endpoint = Config.serverUrl + ":9002/api"

export function registerUser(email: string, password: string, password_reentered: string, handleSuccess: () => mixed, handleError: (Object) => mixed) {
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

export function loginUser(email: string, password: string, handleSuccess: () => mixed,
    handleError: (Object) => mixed, handleRequireTwoFactor: () => mixed, handleRequireEmailVerification: () => mixed) {

    // 1. Get Nonce Cookie (e-mail required because nonce is per-user)
    var payload = make_getnonce_payload(email);
    axios
        .post(login_endpoint, payload, { withCredentials: true })
        .catch(error => handleError(error))
        .then(() => {
            // 2. Submit Login Credentials with Nonce Cookie
            payload = make_login_payload(email, password, "");
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

export function logoutUser(handleSuccess: () => mixed) {
    axios
        .post(logout_endpoint, {}, { withCredentials: true })
        .catch(error => {
            console.log(error)
        })
        .then(handleSuccess)
}

export function verifyEmail(code: string, handleSuccess: () => mixed, handleFailure: () => mixed) {
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

function make_registration_payload(email: string, password: string, password_reentered: string) {
    return {
        email: email,
        password: password,
        passwordReentered: password_reentered,
    }
}

function make_login_payload(email: string, password: string, one_time_password: string) {
    return {
        email: email,
        password: password,
        oneTimePassword: one_time_password
    }
}

function make_getnonce_payload(email: string) {
    return {
        email: email,
        getNonce: true
    }
}