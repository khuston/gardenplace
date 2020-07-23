const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack")

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
                    use: 'ts-loader',
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