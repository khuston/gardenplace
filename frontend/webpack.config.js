const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = env => {

    function is_production_mode() {
        return env && env.production;
    }

    return {
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.html$/,
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
            })
        ],
        externals: {
            'Config': JSON.stringify(is_production_mode() ? {
                serverUrl: "https://gardenplace.showandtell.page",
                routerBasename: "/gardenplace"
            } : {
                serverUrl: "http://localhost",
                routerBasename: "/"
            })
        },
        entry: './src/app.js'
    }
}