import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Visual-regression / breakpoint coverage (brief §P0-05, review §16).
 *
 * Runs ON DEMAND so the default `test:e2e` never fails on a missing pixel baseline and so
 * no disposable binary snapshots are committed (repo policy — see .gitignore). Two modes:
 *
 *   RUN_VISUAL=1 npx playwright test visual.spec.ts
 *       → captures full-page screenshots to ./review-artifacts/visual (gitignored) as the
 *         before/after evidence used in the PR, and asserts zero horizontal overflow +
 *         a visible H1 at every target width. No baseline required.
 *
 *   RUN_VISUAL=1 VISUAL_DIFF=1 npx playwright test visual.spec.ts --update-snapshots
 *       → additionally records/compares pixel baselines via toHaveScreenshot for anyone
 *         who wants true diff regression locally (snapshots stay gitignored).
 *
 * The always-on functional guards (layout.spec / homepage.spec) keep geometry regressions
 * covered in CI; this spec adds the visual + breakpoint evidence layer on top.
 */

const WIDTHS = [360, 390, 768, 1024, 1440] as const;
const ROUTES = [
  "/",
  "/growth-plan",
  "/contact",
  "/services",
  "/how-it-works",
  "/troubleshooter",
  "/goals",
] as const;

const OUT = path.resolve("review-artifacts/visual");

test.describe("visual regression / breakpoints", () => {
  test.skip(!process.env.RUN_VISUAL, "on-demand: set RUN_VISUAL=1 to capture screenshots");

  test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
  });

  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const slug = (route === "/" ? "home" : route.replace(/\W+/g, "_").replace(/^_/, "")) + `-${width}`;

      test(`${route} @ ${width}px`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

        // No horizontal overflow at any breakpoint (a hard requirement site-wide).
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);

        await page.screenshot({ path: path.join(OUT, `${slug}.png`), fullPage: true });

        if (process.env.VISUAL_DIFF) {
          await expect(page).toHaveScreenshot(`${slug}.png`, {
            fullPage: true,
            animations: "disabled",
            caret: "hide",
            maxDiffPixelRatio: 0.02,
          });
        }
      });
    }
  }
});
