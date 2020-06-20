import axios from "axios";

const loggedin_endpoint="https://localhost:9001/registrations";
const registration_endpoint="https://localhost:9001/registrations";

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
            if (response.data.status === "created") {
                handleSuccess(error);
            }
        })
        .catch(error => {
            handleError(error);
        })
}

export function default_registration_payload() {
    return make_registration_payload("", "", "")
}

function make_registration_payload(email, password, password_reentered) {
    return {
        email: email,
        password: password,
        password_reentered: password_reentered
    }
}