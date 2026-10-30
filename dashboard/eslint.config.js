const js = require("@eslint/js");

module.exports = [
  { ignores: ["eslint.config.js", "build/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "src/**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        React: "readonly",
        document: "readonly",
        window: "readonly",
        process: "readonly",
        require: "readonly",
        console: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    files: ["src/__tests__/**/*.js", "src/__tests__/**/*.jsx", "src/setupTests.js"],
    rules: {
      "no-unused-vars": "off",
    },
    languageOptions: {
      globals: {
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        jest: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
];
