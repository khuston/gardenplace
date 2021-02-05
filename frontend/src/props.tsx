export interface PropsWithLoggedIn {
    loggedIn: boolean
}

export interface PropsWithHandleLogin {
    handleLogin: VoidFunction
}

export interface PropsWithHandleLogout {
    handleLogout: () => void
}