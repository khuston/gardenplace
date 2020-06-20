import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./home";
import About from "./about";

function App(props) {
    var loggedInState = false;

    return (
        <div className="app">
            <BrowserRouter>
                <Switch>
                    <Route exact path={"/"} render={props => (
                        <Home {... props} loggedIn={loggedInState} />
                    )}
                    />
                    <Route exact path={"/about"} render={props => (
                        <About {... props} loggedIn={loggedInState} />
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