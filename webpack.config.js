
module.exports = {

    entry: './src/app.tsx',

    output: {
        filename: './app.js'
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },

    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loaders: ['ts-loader'] },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },

    devtool: 'source-map'

}