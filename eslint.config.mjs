// ESLint flat config for Next.js 16 — uses eslint-config-next's native flat
// configs directly (no @eslint/eslintrc FlatCompat bridge, which mis-serialises
// v16's config). core-web-vitals already includes jsx-a11y + react-hooks rules.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      ".claude/**",
      ".specify/**",
      "specs/**",
      "studio/**",
      "tests/**",
      "test-results/**",
      "playwright-report/**",
      "coverage/**",
      "*.config.mjs",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
