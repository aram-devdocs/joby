const path = require('path');

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              // Allow importing from source files directly
              allowJs: true,
              esModuleInterop: true,
              moduleResolution: 'node',
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      // Always use source files for hot reload to work
      '@packages/browser': path.resolve(
        __dirname,
        '../../packages/browser/src',
      ),
      '@packages/llm': path.resolve(__dirname, '../../packages/llm/src'),
      '@packages/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@packages/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
    // Prefer source over dist for workspace packages
    mainFields: ['source', 'module', 'main'],
  },
  // Enable source maps in development
  devtool: process.env.NODE_ENV === 'production' ? false : 'eval-source-map',
};
