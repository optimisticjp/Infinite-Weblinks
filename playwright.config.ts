import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const PORT = process.env.PW_PORT ?? "3101";
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Use the sandbox's pre-installed Chromium when it exists (its build differs from the
 * pinned Playwright, so we can't let Playwright download its own there). Everywhere else —
 * notably GitHub Actions, where `playwright install --with-deps chromium` provisions the
 * managed browser — leave this unset so Playwright resolves its own executable.
 */
const sandboxChromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

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
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  webServer: {
    command: `PORT=${PORT} npm run start`,
    // Exercise the form pipeline as a preview-WITHOUT-keys deployment: the in-memory rate limiter and
    // a Turnstile dev-bypass, so a real submission reaches the truthful delivery-unavailable path
    // instead of failing closed on the production-only required Cloudflare bindings. `next start` runs
    // as NODE_ENV=production, so APP_ENV=development is what selects the non-fail-closed policy here.
    env: {
      APP_ENV: "development",
      FORMS_ALLOW_INSECURE_BYPASS: "true",
    },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
