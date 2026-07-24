import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 2E catalog hubs — /tools and /roadmaps migrated to the V2 ToolCard / RoadmapCard
 * system, plus a targeted axe sweep of the routes the migration touches (hub + one legacy
 * detail each).
 */

const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function documentOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("/tools — V2 catalog hub", () => {
  test("one plain H1, no cosmic/legacy hero, night FinalCtaSection (not the legacy banner)", async ({
    page,
  }) => {
    await page.goto("/tools");
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText("Tools we help you choose, configure and connect");
    // no cosmic canvas, no gradient-word span, no legacy final-cta banner
    expect(await page.locator("canvas").count()).toBe(0);
    expect(await page.locator(".iw-gradient-word").count()).toBe(0);
    expect(await page.locator("#final-cta-heading").count()).toBe(0);
    const cta = page.locator("section#get-started");
    await expect(cta.locator("h2")).toBeVisible();
    await expect(cta.getByRole("link", { name: "Build my growth plan" })).toBeVisible();
  });

  test("tools are a list of whole-card links with an H3; chips are spans (no first-card feature)", async ({
    page,
  }) => {
    await page.goto("/tools");
    const list = page.locator('section#tool-areas ul[aria-label="Tool areas"]');
    const items = list.locator(":scope > li");
    const count = await items.count();
    expect(count).toBe(10); // all ten tool destinations
    for (let i = 0; i < count; i++) {
      const li = items.nth(i);
      await expect(li.locator("a")).toHaveCount(1); // whole card, one link
      await expect(li.locator("a h3")).toHaveCount(1);
      // no card is arbitrarily featured (equal grid → every cell is the same, none spans)
      const cls = (await li.getAttribute("class")) ?? "";
      expect(cls).not.toContain("featuredCell");
      // any connection chips are informational spans, not links/buttons
      expect(await li.locator("button").count()).toBe(0);
    }
  });

  for (const width of RESPONSIVE_WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/tools");
      expect(await documentOverflow(page), `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("/roadmaps — V2 planning hub", () => {
  test("one plain H1, no cosmic/legacy hero, night FinalCtaSection", async ({ page }) => {
    await page.goto("/roadmaps");
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText("Suggested roadmaps for common situations");
    expect(await page.locator("canvas").count()).toBe(0);
    expect(await page.locator(".iw-gradient-word").count()).toBe(0);
    expect(await page.locator("#final-cta-heading").count()).toBe(0);
    await expect(page.locator("section#get-started h2")).toBeVisible();
  });

  test("roadmaps are whole-card links with an H3 and an ordered phase sequence (no first-card feature)", async ({
    page,
  }) => {
    await page.goto("/roadmaps");
    const list = page.locator('section#roadmap-list ul[aria-label="Suggested roadmaps"]');
    const items = list.locator(":scope > li");
    const count = await items.count();
    expect(count).toBe(7); // every roadmap destination
    for (let i = 0; i < count; i++) {
      const li = items.nth(i);
      await expect(li.locator("a")).toHaveCount(1);
      await expect(li.locator("a h3")).toHaveCount(1);
      // each card carries an ordered phase preview (an <ol>)
      await expect(li.locator("ol")).toHaveCount(1);
      const cls = (await li.getAttribute("class")) ?? "";
      expect(cls).not.toContain("featuredCell");
    }
  });

  test("the roadmap cards link through to a working detail page", async ({ page }) => {
    await page.goto("/roadmaps");
    await page.locator('section#roadmap-list a[href^="/roadmaps/"]').first().click();
    await expect(page).toHaveURL(/\/roadmaps\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  for (const width of RESPONSIVE_WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/roadmaps");
      expect(await documentOverflow(page), `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("current navigation state (hub + detail live under Resources)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const path of ["/tools", "/tools/websites-hosting-performance", "/roadmaps", "/roadmaps/ecommerce"]) {
    test(`${path} marks its section current (aria-current=location)`, async ({ page }) => {
      await page.goto(path);
      const resources = page.getByRole("button", { name: /^Resources$/ });
      await expect(resources).toHaveAttribute("aria-current", "location");
    });
  }
});

test.describe("Learn hero reassurance appears once", () => {
  test("'Educational first, no hard sell' is not duplicated across lead + trust note", async ({ page }) => {
    await page.goto("/learn");
    const hero = page.locator("section#learn-hero");
    const matches = await hero.getByText("Educational first, no hard sell").count();
    expect(matches).toBe(1);
  });
});

test.describe("targeted axe — 0 serious/critical on the migrated + legacy detail routes", () => {
  const pages = [
    "/tools",
    "/tools/websites-hosting-performance",
    "/roadmaps",
    "/roadmaps/ecommerce",
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
      expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
    });
  }
});
