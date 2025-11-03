import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // --- ADD THIS OBJECT ---
  // This adds the rule to ignore unused variables starting with an underscore
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error" if you prefer
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  }
  // -----------------------
];

export default eslintConfig;