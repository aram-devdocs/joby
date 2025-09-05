module.exports = {
  extends: ['@repo/eslint-config/base'],
  overrides: [
    {
      // Allow console usage in Logger transport files
      files: ['src/logger/transports/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
