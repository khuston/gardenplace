import * as React from "react";

export interface PropsWithLoggedIn {
    loggedIn: boolean
}

export interface PropsWithLoggedInSetter {
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}