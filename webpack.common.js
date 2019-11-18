const path = require('path');

module.exports = {
    entry: {
        bundle: './src/byte-form.ts',
    },
    resolve: { extensions: ['.tsx', '.ts', '.js'], },
    output: {
        filename: 'byte-form.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs',
    },
    optimization: {
        minimize: false,
    },

    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'ts-loader'],
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
            },
        ],
    },
    externals: [
        {
            react: {
                commonjs: 'react',
            },
        },
        /antd/,
        / immer /,
    ],
};