/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./.storybook/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};