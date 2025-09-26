// custom_extensions/frontend/eslint.config.mjs
// This is an example. You'll need to integrate this into your existing config.
// If you're using a base config like 'next/core-web-vitals', you'll typically extend it.

// Import necessary modules if you're building the config from scratch
// For example, if using Next.js's recommended ESLint setup, it might look different.
// This example shows a direct way to add rule overrides.

// If your eslint.config.mjs is more complex, you'll need to find the appropriate object
// in the array to add/override these rules, or add a new configuration object to the array.

// A common pattern for Next.js 14+ with flat config:
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [".next/", "dist/"], // Example: ignore build output
  },
  // Your existing base configurations (e.g., eslint:recommended)
  // { ...eslint.configs.recommended.rules }, // Example if using eslint built-in

  // Configuration for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json", // Points to custom_extensions/frontend/tsconfig.json
      },
    },
    rules: {
      // Spread rules from recommended sets if you use them
      // ...tsPlugin.configs["eslint-recommended"].rules, // Example
      // ...tsPlugin.configs.recommended.rules, // Example
      // ...reactPlugin.configs.recommended.rules, // Example
      // ...hooksPlugin.configs.recommended.rules, // Example
      // ...nextPlugin.configs["core-web-vitals"].rules, // Example
      
      // --- Your overrides - More lenient like web directory ---
      "@typescript-eslint/no-explicit-any": "off", // Completely disable
      "@typescript-eslint/no-unused-vars": "off", // Completely disable like web config
      "no-unused-vars": "off", // Also disable base rule
      "@typescript-eslint/no-empty-object-type": "off", // Completely disable
      "react-hooks/exhaustive-deps": "off", // Disable like web config
      "@next/next/no-img-element": "off", // Disable like web config
      // Add any other specific rule overrides if needed
    },
    settings: { // If using react plugin
      react: {
        version: "detect",
      },
    },
  },
];
