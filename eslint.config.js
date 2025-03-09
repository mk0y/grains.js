import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.node, // Ensures Node.js globals
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn", // Allow `any` as a warning
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  prettierConfig, // Disables conflicting Prettier rules
];
