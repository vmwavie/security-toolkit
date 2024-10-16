const path = require("path");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    index: path.resolve(__dirname, "src/index.ts"),
  },
  output: {
    chunkFilename: "[name].js",
    filename: "[name].js",
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
    fallback: { crypto: false },
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
