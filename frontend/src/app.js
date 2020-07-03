import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, useHistory } from "react-router-dom";
import Home from "./home";
import About from "./about";
import Register from "./auth/register";
import RegisterTwofactor from "./auth/register_twofactor";
import { checkLoggedIn } from "./auth/auth";
import Config from 'Config';


function App(props) {
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useState(false);
    const [userID, setUserID] = useState(-1);

    function handleRegistrationSuccess() {
        checkLoggedIn(setLoggedIn, setUserID);
        history.pushState("/register_twofactor");
    }

    return (
        <div className="app">
            <BrowserRouter basename={Config.routerBasename}>
                <Switch>
                    <Route exact path={"/"} render={props => (
                        <Home {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/about"} render={props => (
                        <About {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/login"} render={props => (
                        <Login {... props} />
                    )}
                    />
                    <Route exact path={"/register"} render={props => (
                        <Register {... props} handleRegistrationSuccess={handleRegistrationSuccess} />
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