import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./home";
import About from "./about";
import RegisterTwofactor from "./auth/register_twofactor";
import { VerifyEmail } from "./auth/verify_email";
import { NewPlant } from "./newPlant";
import { checkLoggedIn } from "./auth/auth";

function App(props: any) {
    // TODO: Rather than assuming we are not logged in, better to use some local storage,
    // bearing in mind that the cookies are http-only.
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    checkLoggedIn(setLoggedIn)

    return (
        <div>
            <BrowserRouter basename={gardenplaceConfiguration.routerBasename}>
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
                        <VerifyEmail {... props} loggedIn={loggedIn} verificationCode={undefined} />
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