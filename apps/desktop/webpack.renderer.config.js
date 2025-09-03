const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
];

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
};