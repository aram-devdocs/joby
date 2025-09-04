module.exports = {
  // Line length
  printWidth: 80,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Semicolons
  semi: true,

  // Quotes
  singleQuote: true,
  quoteProps: 'as-needed',

  // JSX
  jsxSingleQuote: false,

  // Trailing commas
  trailingComma: 'all',

  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'always',

  // Format embedded languages
  embeddedLanguageFormatting: 'auto',

  // End of line
  endOfLine: 'lf',

  // Prose wrap for markdown
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Vue files
  vueIndentScriptAndStyle: false,

  // Require pragma
  requirePragma: false,
  insertPragma: false,

  // Overrides for specific file types
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 80,
        trailingComma: 'none',
      },
    },
    {
      files: '*.yml',
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.css', '*.scss', '*.sass'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
