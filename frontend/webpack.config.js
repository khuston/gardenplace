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
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "html-loader"
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
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
                routerBasename: "/gardenplace",
                publicStaticDir: "public-static"
            } : {
                serverUrl: "http://127.0.0.1",
                routerBasename: "/",
                publicStaticDir: "static"
            })
        },
        'devtool' : JSON.stringify(is_production_mode() ? "" : "source-map"),
        entry: './src/app.js'
    }
}