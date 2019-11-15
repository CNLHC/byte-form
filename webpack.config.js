const path = require("path");

module.exports = {
  entry: {
    bundle: "./src/index.ts"
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "byte-form.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs"
  },
  optimization: {
    minimize: false
  },

  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  },
  externals: [
    {
      react: {
        commonjs: "react"
      }
    },
    /antd/,

    // /react-dom.*/,
    // /react-redux.*/,
    // /redux.*/,
    / immer /
  ]
};
