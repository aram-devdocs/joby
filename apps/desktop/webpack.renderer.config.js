const path = require("path");

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
        "../../packages/browser/src",
      ),
      "@packages/llm": path.resolve(__dirname, "../../packages/llm/src"),
      "@packages/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
};
