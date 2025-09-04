const path = require("path");

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
        "../../packages/browser/src",
      ),
      "@packages/llm": path.resolve(__dirname, "../../packages/llm/src"),
      "@packages/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
};
