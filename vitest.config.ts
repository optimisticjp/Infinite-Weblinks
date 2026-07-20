import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    // .tsx enabled for component tests; per-file `// @vitest-environment jsdom` opts those into jsdom.
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    environment: "node",
    // Return CSS-module class names untouched (e.g. styles.primary === "primary") so tests can
    // assert on variant/size classes without a scoping hash.
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
