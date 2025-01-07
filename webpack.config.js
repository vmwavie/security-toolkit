const path = require("path");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV === "production";

const commonConfig = {
  entry: {
    index: path.resolve(__dirname, "src/index.ts"),
  },
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
    extensions: [".ts", ".js"],
    fallback: {
      crypto: false,
      stream: false,
      path: false,
      fs: false,
      child_process: false,
      assert: require.resolve("assert"),
      util: require.resolve("util/"),
      net: false,
      os: require.resolve("os-browserify/browser"),
      dgram: false,
      vm: require.resolve("vm-browserify"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  stats: {
    errorDetails: true,
  },
};

const nodeConfig = {
  ...commonConfig,
  target: "node",
  output: {
    chunkFilename: "[name].js",
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs2",
  },
};

const browserConfig = {
  ...commonConfig,
  target: "web",
  output: {
    chunkFilename: "[name].browser.js",
    filename: "[name].browser.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    globalObject: "this",
  },
  resolve: {
    ...commonConfig.resolve,
    fallback: {
      ...commonConfig.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
    },
  },
};

module.exports = () => {
  if (isProduction) {
    nodeConfig.mode = "production";
    browserConfig.mode = "production";
  } else {
    nodeConfig.mode = "development";
    browserConfig.mode = "development";
  }
  return [nodeConfig, browserConfig];
};
