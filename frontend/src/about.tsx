import * as React from "react";
import { Link } from "react-router-dom";

function About(props: any) {
    return (
        <div>
            <h1>Gardenplace</h1>
            <Link to="/">Home</Link>
            <p>Created by Kyle Huston.</p>
            <p>Licenses.</p>
        </div>
    )
}

export default About;