import Axios, { AxiosResponse } from "axios";

const login_endpoint = gardenplaceConfiguration.serverUrl + ":9001/login";
const logout_endpoint = gardenplaceConfiguration.serverUrl + ":9001/logout";
const registration_endpoint = gardenplaceConfiguration.serverUrl + ":9001/register";
const verification_endpoint = gardenplaceConfiguration.serverUrl + ":9001/verify";
const api_endpoint = gardenplaceConfiguration.serverUrl + ":9002/graphql";

export function registerUser(email: string, password: string, password_reentered: string, handleSuccess: VoidFunction, handleError: (reason: any) => void) {
    let payload = make_registration_payload(email, password, password_reentered);

    Axios
        .post(registration_endpoint, payload)
        .then((response: AxiosResponse) => {
            if (response.status === 201) {
                handleSuccess();
            }
            else {
                handleError({response: response})
            }
        })
        .catch(handleError)
}

export function loginUser(email: string, password: string, handleSuccess: VoidFunction,
    handleError: (reason: any) => void, handleRequireTwoFactor: VoidFunction, handleRequireEmailVerification: VoidFunction) {

    // 1. Get Nonce Cookie (e-mail required because nonce is per-user)
    let payload = make_getnonce_payload(email);
    Axios
        .post(login_endpoint, payload, { withCredentials: true })
        .catch(handleError)
        .then(() => {
            // 2. Submit Login Credentials with Nonce Cookie
            payload = make_login_payload(email, password, "");
            Axios
                .post(login_endpoint, payload, { withCredentials: true })
                .catch(handleError)
                .then((response: AxiosResponse) => {
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

export function logoutUser(handleSuccess: VoidFunction) {
    Axios
        .post(logout_endpoint, {}, { withCredentials: true })
        .catch((error: Error) => {
            console.log(error)
        })
        .then(handleSuccess)
}

export function verifyEmail(code: string, handleSuccess: VoidFunction, handleFailure: VoidFunction) {
    Axios
        .post(verification_endpoint, {verificationCode: code})
        .catch(handleFailure)
        .then((response: AxiosResponse) => {
            if (response && response.status === 200) {
                handleSuccess()
            }
            else {
                handleFailure()
            }
        })
}

const pingQuery = {
    query: `query {
        currentUser {
            name
        }
    }`
}

export function checkLoggedIn(setLoggedIn: (b: boolean) => void): void {

    Axios.post(api_endpoint, pingQuery, { withCredentials: true })
        .then((response: AxiosResponse) => {
            if (response && response.status === 200) {
                setLoggedIn(true)
            }
            else {
                setLoggedIn(false)
            }
        })
}

function make_registration_payload(email: string, password: string, password_reentered: string): RegistrationPayload {
    return {
        email: email,
        password: password,
        passwordReentered: password_reentered,
    }
}

function make_login_payload(email: string, password: string, one_time_password: string): LoginPayload {
    return {
        email: email,
        password: password,
        oneTimePassword: one_time_password
    }
}

function make_getnonce_payload(email: string): LoginPayload {
    return {
        email: email,
        getNonce: true
    }
}

export interface RegistrationPayload {
    email: string
    password: string
    passwordReentered: string
}

export interface LoginPayload {
    email: string
    password?: string
    oneTimePassword?: string
    getNonce?: boolean
}