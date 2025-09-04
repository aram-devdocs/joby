const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      "@packages/browser": path.resolve(
        __dirname,
        isDevelopment
          ? "../../packages/browser/src"
          : "../../packages/browser/dist",
      ),
      "@packages/llm": path.resolve(
        __dirname,
        isDevelopment ? "../../packages/llm/src" : "../../packages/llm/dist",
      ),
      "@packages/ui": path.resolve(
        __dirname,
        isDevelopment ? "../../packages/ui/src" : "../../packages/ui/dist",
      ),
    },
  },
};
