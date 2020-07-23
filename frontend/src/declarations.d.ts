interface Config {
    serverUrl: string
    routerBasename: string
    publicStaticDir: string
}

declare const gardenplaceConfiguration: Config;

declare module '*.css';