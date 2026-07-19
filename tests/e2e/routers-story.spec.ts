import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The router + story pages, rebuilt on the Constellation kit (this batch): the two new routes
 * (/connected-growth, /account-ownership) plus /about, which routes.spec doesn't already
 * axe-check. Each must load, carry exactly one H1 (the hero text), a growth-plan CTA, no
 * horizontal overflow at the narrowest and widest widths, and no serious/critical axe
 * violations. The kit-migration contracts for /goals, /services and /how-it-works
 * (facet ids, category links, stage/system anchors) are covered in routes.spec.
 */
const PAGES = ["/connected-growth", "/account-ownership", "/about"];

for (const path of PAGES) {
  test.describe(`router/story page: ${path}`, () => {
    test("loads with one H1, a growth-plan CTA, and no overflow", async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should not error`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('main a[href="/growth-plan"]').first()).toBeVisible();

      for (const width of [360, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `overflow at ${width}px on ${path}`).toBeLessThanOrEqual(1);
      }
    });

    test("no serious or critical accessibility violations", async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
    });
  });
}

test.describe("kit migration: /how-it-works deep-link anchors survive", () => {
  // The mega-menu links to every stage, cross-cutting system, and delivery model on this
  // page; the rebuild must keep all of them resolvable.
  const ANCHORS = [
    "discovery-plan",
    "foundation",
    "get-discovered",
    "convert",
    "deliver-operate",
    "retain",
    "advocacy-growth",
    "ai-automation",
    "analytics-data",
    "maintenance-scale",
    "delivery-we-do",
    "delivery-you-run",
  ];
  test("every mega-menu anchor resolves to an element", async ({ page }) => {
    await page.goto("/how-it-works");
    for (const id of ANCHORS) {
      await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(1);
    }
  });
});

test.describe("kit migration: /connected-growth is distinct from the gated /examples", () => {
  test("/connected-growth renders and /examples still 404s", async ({ page }) => {
    const cg = await page.goto("/connected-growth");
    expect(cg?.status()).toBeLessThan(400);
    const ex = await page.goto("/examples");
    expect(ex?.status()).toBe(404);
  });
});
