import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Coverage for the pages added or rebuilt in the final rebrand pass: the pricing page, the
 * reformatted legal reading surface (refunds), and the three detail templates moved off the
 * legacy PageHero onto the Constellation kit. Each must render a single H1, pass axe, and
 * hold its width with no horizontal overflow.
 */

const noSeriousA11y = async (page: import("@playwright/test").Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
};

test.describe("rebrand: new and rebuilt pages", () => {
  test("/pricing renders one H1, the growth-plan CTA, and passes axe", async ({ page }) => {
    const res = await page.goto("/pricing");
    expect(res?.status(), "/pricing should not 404").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("main").getByRole("link", { name: /growth plan/i }).first(),
    ).toBeVisible();
    // Honest framing: no invented prices — there is no currency figure on the page.
    await expect(page.getByText(/[£$€]\s?\d/).first()).toHaveCount(0);
    await noSeriousA11y(page);
  });

  test("/refunds renders on the legal reading surface with the review note and passes axe", async ({ page }) => {
    await page.goto("/refunds");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText(/professional legal review/i)).toBeVisible();
    await noSeriousA11y(page);
  });

  test("goal detail (rebuilt) has one H1 and passes axe", async ({ page }) => {
    await page.goto("/goals");
    await page.locator('main a[href^="/goals/"]').first().click();
    await expect(page).toHaveURL(/\/goals\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("roadmap detail (rebuilt) has one H1 and passes axe", async ({ page }) => {
    await page.goto("/roadmaps");
    await page.locator('main a[href^="/roadmaps/"]').first().click();
    await expect(page).toHaveURL(/\/roadmaps\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await noSeriousA11y(page);
  });

  test("starting-point detail (rebuilt) has one H1 and passes axe", async ({ page }) => {
    const res = await page.goto("/starting-points/website-no-traffic");
    expect(res?.status(), "starting-point detail should not 404").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await noSeriousA11y(page);
  });

  for (const path of ["/pricing", "/refunds", "/resources", "/starting-points/website-no-traffic"]) {
    for (const width of [360, 768, 1440]) {
      test(`no horizontal overflow on ${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `overflow on ${path} at ${width}px`).toBeLessThanOrEqual(1);
      });
    }
  }
});
