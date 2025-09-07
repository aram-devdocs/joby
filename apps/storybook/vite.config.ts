import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point to source files for hot reload
      '@packages/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@packages/browser': path.resolve(
        __dirname,
        '../../packages/browser/src',
      ),
      '@packages/llm': path.resolve(__dirname, '../../packages/llm/src'),
      '@packages/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  optimizeDeps: {
    // Include workspace packages for pre-bundling
    include: ['@packages/ui', '@packages/shared'],
    // Force re-optimization when package sources change
    exclude: [
      '@packages/ui',
      '@packages/browser',
      '@packages/llm',
      '@packages/shared',
    ],
  },
  server: {
    // Watch workspace packages for changes
    watch: {
      ignored: ['!**/node_modules/@packages/**'],
    },
    fs: {
      // Allow serving files from workspace packages
      allow: ['../..'],
    },
  },
  build: {
    // Ensure source maps for debugging
    sourcemap: true,
  },
});
