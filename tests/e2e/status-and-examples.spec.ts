import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setViewportAndWaitForStableLayout, expectNoHorizontalOverflow } from "./helpers/layout";

/**
 * Phase 2S (§E/§F/§J) — the migrated status surface (404) and the preserved gated-examples contract.
 * The 404 is a calm light panel with its own <main id="main"> (so the root skip link resolves), one
 * H1, the visible code + Back-to-home, and no cosmic canvas; /examples stays 404 while no proof is
 * published. (The error boundary's reset()/logging contract is covered by the unit test — it can't be
 * triggered from a normal navigation, and axe cannot run with JavaScript disabled.)
 */

const axeSerious = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test.describe("404 status surface (V2 light)", () => {
  test("renders the branded light not-found page with a working skip target", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);

    // One H1, the visible code + primary action (the existing routes.spec contract, preserved).
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to home/i })).toBeVisible();

    // Its own <main id="main"> + the root skip link that targets it.
    expect(await page.locator("main#main").count(), "main#main").toBe(1);
    await expect(page.locator('a.iw-skip-link[href="#main"]')).toHaveCount(1);

    // Light surface, no cosmic canvas/decoration.
    const [r, g, b] = await page.evaluate(() => {
      const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number);
      return [m[0], m[1], m[2]];
    });
    expect(Math.min(r, g, b), "404 body is light").toBeGreaterThanOrEqual(240);
    expect(await page.locator("canvas").count(), "no canvas").toBe(0);
    expect(await page.locator(".theme-cosmic").count(), "no cosmic surface").toBe(0);

    // Helpful-links navigation is labelled.
    await expect(page.getByRole("navigation", { name: "Helpful links" })).toBeVisible();
  });

  test("has no serious/critical accessibility violations and no overflow", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), "404 a11y").toBe("[]");
    for (const width of [360, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `404 @ ${width}px`);
    }
  });
});

test.describe("gated examples — proof stays hidden until verified", () => {
  for (const path of ["/examples", "/examples/anything", "/examples/some-slug"]) {
    test(`${path} returns 404 while no proof is published`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
    });
  }
});
