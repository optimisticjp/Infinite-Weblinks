import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 2D content hubs — /learn and /case-studies migrated to the V2 content-card system,
 * plus a targeted axe sweep of the pages the migration touches.
 */

const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function documentOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("/learn — V2 content hub", () => {
  test("has exactly one H1 (plain, no gradient word) and the right heading", async ({ page }) => {
    await page.goto("/learn");
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText("Understand how it all fits together");
  });

  test("guides are a semantic list of whole-card links, each with an H3 (one tab stop per card)", async ({
    page,
  }) => {
    await page.goto("/learn");
    const list = page.locator('section#articles ul[aria-label="Guides"]');
    await expect(list).toBeVisible();
    const items = list.locator(":scope > li");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const li = items.nth(i);
      // exactly one link per card (whole card is one link, no nested link)
      await expect(li.locator("a")).toHaveCount(1);
      // and the card link carries an h3 title
      await expect(li.locator("a h3")).toHaveCount(1);
    }
  });

  test("renders no cosmic canvas and closes with a night FinalCtaSection", async ({ page }) => {
    await page.goto("/learn");
    expect(await page.locator("canvas").count()).toBe(0);
    const cta = page.locator("section#get-started");
    await expect(cta).toBeVisible();
    await expect(cta.locator("h2")).toBeVisible();
    await expect(cta.getByRole("link", { name: "Build my growth plan" })).toBeVisible();
  });

  for (const width of RESPONSIVE_WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/learn");
      expect(await documentOverflow(page), `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("/case-studies — V2 content hub", () => {
  test("has exactly one H1 and a prominent illustrative Callout", async ({ page }) => {
    await page.goto("/case-studies");
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText("How a connected system fits together");
    const note = page.getByRole("note").filter({ hasText: /illustrative examples, not real clients/i });
    await expect(note).toBeVisible();
  });

  test("EVERY case card carries its own 'Illustrative example' marker and is a whole-card link with an H3", async ({
    page,
  }) => {
    await page.goto("/case-studies");
    const list = page.locator('section#examples ul[aria-label="Example scenarios"]');
    const items = list.locator(":scope > li");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const li = items.nth(i);
      await expect(li.locator("a")).toHaveCount(1);
      await expect(li.locator("a h3")).toHaveCount(1);
      await expect(li.getByText("Illustrative example")).toBeVisible();
    }
  });

  test("shows no numeric result / metric on the cards", async ({ page }) => {
    await page.goto("/case-studies");
    const cardsText = await page
      .locator('section#examples ul[aria-label="Example scenarios"]')
      .innerText();
    expect(cardsText).not.toMatch(/\d+%|\b\d+x\b/i);
  });

  for (const width of RESPONSIVE_WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/case-studies");
      expect(await documentOverflow(page), `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("targeted axe — 0 serious/critical on the touched pages", () => {
  const pages = [
    "/",
    "/faq",
    "/resources",
    "/learn",
    "/learn/how-online-growth-works-as-one-system",
    "/case-studies",
    "/case-studies/ecommerce-turn-browsers-into-buyers",
    "/privacy",
    "/contact",
    "/design-preview",
    "/design-preview/shells",
  ];
  for (const path of pages) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.length })))).toEqual([]);
    });
  }
});
