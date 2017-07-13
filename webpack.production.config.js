const path = require('path');
const webpack = require('webpack');
const UglifyEsPlugin = require('uglify-es-webpack-plugin');

module.exports = {

    entry: './src/app.tsx',

    output: {
        filename: './dist/app.js'
    },

    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        alias: {
            'react$': path.resolve(__dirname, './node_modules/react/dist/react.min.js'),
            'react-dom$': path.resolve(__dirname, './node_modules/react-dom/dist/react-dom.min.js')
        }
    },

    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loaders: ['ts-loader'] },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },

    devtool: 'cheap-source-map',

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new UglifyEsPlugin()
    ]

}