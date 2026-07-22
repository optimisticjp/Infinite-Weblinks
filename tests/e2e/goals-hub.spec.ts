import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setViewportAndWaitForStableLayout, expectNoHorizontalOverflow } from "./helpers/layout";

/**
 * Phase 2I — the /goals routing hub migrated to V2 (PageHeader + light/alt shells + the card
 * system + a compact hub-jump nav), plus redirect/fragment safety for the retired index URLs.
 */

const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function ldTypes(page: Page) {
  return page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.flatMap((n) => {
      try {
        const d = JSON.parse(n.textContent || "{}");
        return Array.isArray(d) ? d.map((x) => x["@type"]) : [d["@type"]];
      } catch {
        return [];
      }
    }),
  );
}

test.describe("goals hub — V2 structure and preserved wiring", () => {
  test("one H1, V2 surfaces, and none of the cosmic components", async ({ page }) => {
    const res = await page.goto("/goals");
    expect(res?.status(), "/goals should not error").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("What do you want to achieve right now?");
    expect(await page.locator("canvas").count(), "no cosmic canvas").toBe(0);
    expect(await page.locator(".iw-gradient-word").count(), "no gradient word").toBe(0);
    expect(await page.locator("#final-cta-heading").count(), "no legacy CTA banner").toBe(0);
    expect(await page.locator('[class*="orbLegacy"]:visible').count(), "no visible node-orb").toBe(0);
    // The V2 FinalCtaSection closes the page.
    await expect(page.locator("section#get-started h2")).toBeVisible();
  });

  test("metadata, canonical and structured data are preserved", async ({ page }) => {
    await page.goto("/goals");
    await expect(page).toHaveTitle(/Your goal/);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/goals$/);
    const types = await ldTypes(page);
    expect(types).toContain("ItemList");
    expect(types).toContain("BreadcrumbList");
  });

  test("the hub-jump nav has exactly three section destinations", async ({ page }) => {
    await page.goto("/goals");
    const nav = page.getByRole("navigation", { name: "Choose how to start" });
    await expect(nav).toBeVisible();
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(3);
    await expect(links.nth(0)).toHaveAttribute("href", "#by-goal");
    await expect(links.nth(1)).toHaveAttribute("href", "#by-where-you-are");
    await expect(links.nth(2)).toHaveAttribute("href", "#by-business-type");
    // Each jump target exists exactly once, on its own section.
    for (const id of ["by-goal", "by-where-you-are", "by-business-type"]) {
      expect(await page.locator(`#${id}`).count(), `#${id} once`).toBe(1);
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test("all goal, starting-point and business-type destinations are retained", async ({ page }) => {
    await page.goto("/goals");
    // 10 goal cards → /goals/[slug]
    const goalLinks = await page.locator('section#by-goal a[href^="/goals/"]').count();
    expect(goalLinks).toBe(10);
    // 8 starting-point cards → /growth-plan (plus the section CTA)
    const spCards = await page.locator("section#by-where-you-are").getByRole("heading", { level: 3 }).count();
    expect(spCards).toBe(8);
    expect(await page.locator('section#by-where-you-are a[href="/growth-plan"]').count()).toBeGreaterThanOrEqual(8);
    // 7 business-type cards → /business-types/[slug]
    const btLinks = await page.locator('section#by-business-type a[href^="/business-types/"]').count();
    expect(btLinks).toBe(7);
  });

  test("the where-you-are facet is a grid, not a horizontal rail", async ({ page }) => {
    await page.goto("/goals");
    const scrollers = await page.locator("section#by-where-you-are *").evaluateAll((els) =>
      els.filter((el) => {
        const ox = getComputedStyle(el).overflowX;
        return ox === "auto" || ox === "scroll";
      }).length,
    );
    expect(scrollers, "no horizontal scroll container in the where-you-are facet").toBe(0);
  });

  test("a hub-jump link updates the hash and reveals its section, clearing the sticky header", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/goals");
    // The global scroll-padding keeps a fragment target clear of the sticky header.
    const scrollPad = await page
      .locator("html")
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollPaddingTop) || 0);
    expect(scrollPad).toBeGreaterThan(60);
    await page.getByRole("navigation", { name: "Choose how to start" }).getByRole("link", { name: "Start with my business type" }).click();
    await expect(page).toHaveURL(/#by-business-type$/);
    await expect(page.locator("section#by-business-type")).toBeVisible();
  });
});

test.describe("retired index URLs still fold into the /goals facets (redirect safety)", () => {
  for (const [from, to] of [
    ["/business-types", "/goals#by-business-type"],
    ["/starting-points", "/goals#by-where-you-are"],
  ] as const) {
    test(`${from} → ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), `${from} is a permanent redirect`).toBeGreaterThanOrEqual(300);
      expect(res.status()).toBeLessThan(400);
      expect(res.headers()["location"]).toBe(to);
    });
  }
});

test.describe("goals hub — axe (0 serious/critical)", () => {
  test("/goals", async ({ page }) => {
    await page.goto("/goals");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("goals hub — no overflow across all widths", () => {
  for (const width of RESPONSIVE_WIDTHS) {
    test(`/goals @ ${width}px`, async ({ page }) => {
      await page.goto("/goals");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `/goals @ ${width}px`);
    });
  }
});
