const path = require("path");

module.exports = {
  entry: "./src/components/link-preview.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: { loader: "ts-loader", options: { transpileOnly: true } },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "lit-scss-loader",
            options: {
              minify: true, // defaults to false
            },
          },
          "extract-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 8080,
  },
  output: {
    path: path.resolve(__dirname),
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
