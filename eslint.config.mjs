// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [js.configs.recommended, prettier, {
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    globals: {
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      exports: 'writable',
      module: 'writable',
      require: 'readonly',
      global: 'readonly',
      URL: 'readonly'
    }
  },
  plugins: {
    '@typescript-eslint': typescript,
    'react': react,
    'react-hooks': reactHooks
  },
  rules: {
    'no-unused-vars': 'off', // Turn off base rule for TypeScript files
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'no-undef': 'off' // TypeScript handles this
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}, {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/.webpack/**'
  ]
}, ...storybook.configs["flat/recommended"]];