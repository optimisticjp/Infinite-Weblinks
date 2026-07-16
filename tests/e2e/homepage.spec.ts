import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage opening", () => {
  test("renders the hero headline and both primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Infinite Weblinks/);
    await expect(page.locator("h1")).toContainText("grow your business online");
    await expect(
      page.getByRole("link", { name: "Build My Digital Growth Plan" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "See How It All Works" }).first()).toBeVisible();
  });

  test("lists the six connected areas as real text", async ({ page }) => {
    await page.goto("/");
    for (const area of [
      "Website or Store",
      "Search & Advertising",
      "Social & Content",
      "Customer Tools",
      "Analytics",
      "Automation & AI",
    ]) {
      // Some of these strings legitimately recur further down the page (e.g. an
      // "Analytics" system node, an "Automation & AI" tool category), so assert the
      // hero renders each as real, visible text via the first match rather than
      // requiring global uniqueness.
      await expect(page.getByText(area, { exact: true }).first()).toBeVisible();
    }
  });

  test("shows the bright editorial band after the hero", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /The digital world keeps getting bigger/i }),
    ).toBeVisible();
  });

  // Phase 2 regression guard: the homepage summarises and routes. The lean spine renders
  // in order, and the exhaustive sections that moved to inner pages don't reappear here.
  test("renders the Phase-2 section spine in order, with relocated sections gone", async ({
    page,
  }) => {
    await page.goto("/");
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll("section[id]")].map((s) => s.id),
    );
    const spine = ["how-it-connects", "goals", "why-us", "services", "learn", "get-started"];
    expect(
      ids.filter((id) => spine.includes(id)),
      "homepage spine present and in order",
    ).toEqual(spine);
    // These moved to /how-it-works, /starting-points, /tools, /faq — not the homepage.
    for (const gone of ["growth-journey", "start", "tools", "how-we-deliver", "process", "faq"]) {
      expect(ids, `#${gone} should have moved off the homepage`).not.toContain(gone);
    }
  });

  // Two cream bands, not six: exactly the editorial (tension) and learn (rest) sections.
  test("exactly two cream bands render", async ({ page }) => {
    await page.goto("/");
    const bandCount = await page.evaluate(
      () => document.querySelectorAll("section.theme-band").length,
    );
    expect(bandCount, "exactly two theme-band sections").toBe(2);
  });

  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }

  test("no serious or critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      serious,
      JSON.stringify(
        serious.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        null,
        2,
      ),
    ).toEqual([]);
  });
});
