import { defineConfig } from "@playwright/test";

const PORT = process.env.PW_PORT ?? "3101";
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL,
    browserName: "chromium",
    trace: "on-first-retry",
    // Use the pre-installed Chromium (build differs from the pinned Playwright).
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
    },
  },
  webServer: {
    command: `PORT=${PORT} npm run start`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
