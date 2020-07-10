//@flow
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./home";
import About from "./about";
import RegisterTwofactor from "./auth/register_twofactor";
import { VerifyEmail } from "./auth/verify_email"
import { NewPlant } from "./new_plant"
import { checkLoggedIn } from "./auth/auth"
//$FlowFixMe
import Config from 'Config';


function App(props: Object) {

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
                    <Route exact path={"/verify_email"} render={props => (
                        <VerifyEmail {... props} loggedIn={loggedIn} />
                    )}
                    />
                    <Route exact path={"/new_plant"} render={props => (
                        <NewPlant {... props} setLoggedIn={setLoggedIn} />
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