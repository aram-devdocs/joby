const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.css$/,
    use: ["style-loader", "css-loader", "postcss-loader"],
  },
];

module.exports = {
  module: {
    rules,
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
