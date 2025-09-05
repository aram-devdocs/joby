import baseConfig from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    // Allow console usage in Logger transport files
    files: ['src/logger/transports/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
