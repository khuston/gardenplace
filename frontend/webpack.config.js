const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack")
const RelayCompilerLanguageTypescript = require('relay-compiler-language-typescript').default
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin')
const path = require('path')

// todo: code splitting
// https://gist.github.com/gaearon/ca6e803f5c604d37468b0091d9959269
// https://gist.github.com/gaearon/ca6e803f5c604d37468b0091d9959269
// todo: Error boundaries
// https://reactjs.org/docs/error-boundaries.html
module.exports = env => {

    const is_production_mode = env && env.production;

    return {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: [
                        'style-loader',
                        '@teamsupercell/typings-for-css-modules-loader',
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                localsConvention: "camelCaseOnly"
                            }
                        }
                    ],
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                            "plugins": ["relay"]
                        }
                    }
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "html-loader"
                        }
                    ]
                }
            ]
        },
        plugins: [
            new RelayCompilerWebpackPlugin({
                languagePlugin: RelayCompilerLanguageTypescript,
                schema: path.resolve(__dirname, "../shared/schema.graphql"),
                src: path.resolve(__dirname, "./src"),
            }),
            new HtmlWebPackPlugin({
                template:  "./src/index.html",
                filename: "./index.html"
            }),
            new webpack.DefinePlugin({
                gardenplaceConfiguration: JSON.stringify(is_production_mode ? {
                    serverUrl: "https://gardenplace.showandtell.page",
                    routerBasename: "/gardenplace",
                    publicStaticDir: "public-static"
                } : {
                    serverUrl: "http://127.0.0.1",
                    routerBasename: "/",
                    publicStaticDir: "static"
                })
            }),
        ],
        resolve: {
            extensions: ['d.ts', '.ts', '.tsx', '.js', '.jsx', '.css']
        },
        'devtool' : JSON.stringify(is_production_mode ? "" : "source-map"),
        entry: {
            main: './src/app.tsx',
            style: './src/css/gardenplace.css'
        }
    }
}