import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Smoke + a11y coverage for the site's routes beyond the homepage. These assert the
 * shared route contract (a single H1 via PageHero, a Breadcrumb nav on detail pages,
 * the primary Growth Plan CTA) rather than specific copy, so they stay stable as content
 * evolves. Axe runs on a representative page per template family.
 */

const noSeriousA11y = async (page: import("@playwright/test").Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
};

test.describe("listing & hub routes", () => {
  for (const path of ["/services", "/tools", "/solutions", "/roadmaps", "/learn", "/how-it-works", "/faq", "/about"]) {
    test(`${path} renders one H1 and internal links`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should not 404`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.getByRole("link").count()).toBeGreaterThan(3);
    });
  }

  test("/services links through to a working service detail page", async ({ page }) => {
    await page.goto("/services");
    const firstService = page.locator('a[href^="/services/"]').first();
    await expect(firstService).toBeVisible();
    await firstService.click();
    await expect(page).toHaveURL(/\/services\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Detail pages carry a breadcrumb and the primary CTA (scope to main content —
    // the header mega-menu promo also links to the Growth Plan).
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: /Build My Digital Growth Plan/i }).first(),
    ).toBeVisible();
  });
});

test.describe("how-it-works anchors resolve", () => {
  for (const hash of ["discovery-plan", "ai-automation", "delivery"]) {
    test(`#${hash} targets an element on the page`, async ({ page }) => {
      await page.goto(`/how-it-works#${hash}`);
      const target = page.locator(`#${hash}`);
      await expect(target).toHaveCount(1);
    });
  }
});

test.describe("legal pages", () => {
  for (const path of ["/privacy", "/cookies", "/terms", "/accessibility"]) {
    test(`${path} renders with the professional-review note`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText(/professional legal review/i)).toBeVisible();
    });
  }
});

test.describe("404", () => {
  test("an unknown URL shows the branded not-found page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to home/i })).toBeVisible();
  });
});

test.describe("accessibility of key templates", () => {
  test("service detail page has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/services");
    await page.locator('a[href^="/services/"]').first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("solutions hub has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/solutions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("services listing has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("how-it-works deep page has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("growth plan builder has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/growth-plan");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });
});
