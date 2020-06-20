import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, useHistory } from "react-router-dom";
import Home from "./home";
import About from "./about";
import Register from "./register";
import RegisterTwofactor from "./register_twofactor";
import { checkLoggedIn } from "./auth";


function App(props) {
    const history = useHistory();
    const [registrationFailed, setRegistrationFailed] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userID, setUserID] = useState(-1);

    function handleRegistrationSuccess(response_data) {
        checkLoggedIn(setLoggedIn, setUserID);
        history.pushState("/register_twofactor");
    }

    function handleRegistrationError(response_data) {
        setRegistrationFailed(true);
    }

    return (
        <div className="app">
            <BrowserRouter>
                <Switch>
                    <Route exact path={"/"} render={props => (
                        <Home {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/about"} render={props => (
                        <About {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/register"} render={props => (
                        <Register {... props} handleRegistrationSuccess={handleRegistrationSuccess} handleRegistrationError={handleRegistrationError} registrationFailed={registrationFailed} />
                    )}
                    />
                    <Route exact path={"/register_twofactor"} render={props => (
                        <RegisterTwofactor {... props} />
                    )}
                    />
                </Switch>
            </BrowserRouter>
        </div>
    )
}

export default App;

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;