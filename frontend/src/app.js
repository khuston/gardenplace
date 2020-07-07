import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./home";
import About from "./about";
import Login from "./auth/login";
import Register from "./auth/register";
import RegisterTwofactor from "./auth/register_twofactor";
import Config from 'Config';


function App(props) {

    const [loggedIn, setLoggedIn] = useState(checkLoggedIn());

    return (
        <div className="app">
            <BrowserRouter basename={Config.routerBasename}>
                <Switch>
                    <Route exact path={"/"} render={props => (
                        <Home {... props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
                    )}
                    />
                    <Route exact path={"/about"} render={props => (
                        <About {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/login"} render={props => (
                        <Login {... props} setLoggedIn={setLoggedIn} setAuthToken={setAuthToken} />
                    )}
                    />
                    <Route exact path={"/register"} render={props => (
                        <Register {... props} />
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