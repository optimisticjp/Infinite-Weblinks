import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";

/**
 * Phase 2J — /how-it-works migrated to the V2 explainer system, plus homepage safety. Every
 * mega-menu deep link now lands on real visible content (the hidden anchor band is gone).
 */

const STAGES = [
  "discovery-plan",
  "foundation",
  "get-discovered",
  "build-trust",
  "convert",
  "deliver-operate",
  "retain",
  "advocacy-growth",
];
const SYSTEMS = ["ai-automation", "analytics-data", "maintenance-scale"];
const DELIVERY = ["delivery-we-do", "delivery-we-expert", "delivery-we-run", "delivery-you-run"];
const SECTIONS = ["growth-journey", "how-it-connects", "process", "delivery", "get-started"];
const ALL_IDS = [...STAGES, ...SYSTEMS, ...DELIVERY, ...SECTIONS];
const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function idCount(page: Page, id: string) {
  return page.evaluate((i) => document.querySelectorAll(`[id="${i}"]`).length, id);
}

test.describe("how-it-works — V2 structure and preserved wiring", () => {
  test("one H1, V2 surfaces, and none of the cosmic/legacy components", async ({ page }) => {
    const res = await page.goto("/how-it-works");
    expect(res?.status(), "/how-it-works should not error").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "One connected system, built around your growth",
    );
    expect(await page.locator("canvas").count(), "no cosmic canvas").toBe(0);
    expect(await page.locator(".iw-gradient-word").count(), "no gradient word").toBe(0);
    expect(await page.locator("#final-cta-heading").count(), "no legacy CTA banner").toBe(0);
    expect(await page.locator('[class*="orbLegacy"]:visible').count(), "no visible node-orb").toBe(0);
    expect(await page.locator('[class*="StageTimeline"], [class*="RailBar"], [class*="ConnectorPath"]').count()).toBe(0);
    await expect(page.locator("section#get-started h2")).toBeVisible();
  });

  test("metadata, canonical and breadcrumb structured data are preserved", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page).toHaveTitle(/How It Works/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/how-it-works$/);
    const ldTypes = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
      nodes.flatMap((n) => {
        try {
          const d = JSON.parse(n.textContent || "{}");
          return Array.isArray(d) ? d.map((x) => x["@type"]) : [d["@type"]];
        } catch {
          return [];
        }
      }),
    );
    expect(ldTypes).toContain("BreadcrumbList");
  });

  test("the page-jump nav has exactly four section destinations", async ({ page }) => {
    await page.goto("/how-it-works");
    const nav = page.getByRole("navigation", { name: "How it works sections" });
    await expect(nav).toBeVisible();
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(4);
    await expect(links.nth(0)).toHaveAttribute("href", "#growth-journey");
    await expect(links.nth(1)).toHaveAttribute("href", "#how-it-connects");
    await expect(links.nth(2)).toHaveAttribute("href", "#process");
    await expect(links.nth(3)).toHaveAttribute("href", "#delivery");
    // ≥44px targets
    for (let i = 0; i < 4; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box!.height, `jump link ${i} height`).toBeGreaterThanOrEqual(44);
    }
  });

  test("every deep-link id exists exactly once, on meaningful visible content", async ({ page }) => {
    await page.goto("/how-it-works");
    for (const id of ALL_IDS) {
      expect(await idCount(page, id), `#${id} exactly once`).toBe(1);
    }
    // Stage ids sit on the ordered-list items (not a hidden empty anchor band).
    for (const slug of STAGES) {
      const li = page.locator(`li#${slug}`);
      await expect(li).toHaveCount(1);
      expect((await li.innerText()).trim().length, `#${slug} has visible text`).toBeGreaterThan(0);
    }
    // System + delivery ids sit on real article cards with text.
    for (const id of [...SYSTEMS, ...DELIVERY]) {
      const art = page.locator(`article#${id}`);
      await expect(art).toHaveCount(1);
      expect((await art.innerText()).trim().length, `#${id} has visible text`).toBeGreaterThan(0);
    }
    // No leftover hidden anchor band.
    expect(await page.locator('[aria-hidden="true"] > span[id]').count(), "no hidden anchor band").toBe(0);
  });

  test("the growth journey is an ordered list of eight stages, no horizontal timeline", async ({ page }) => {
    await page.goto("/how-it-works");
    const list = page.locator("section#growth-journey ol").first();
    await expect(list.locator(":scope > li")).toHaveCount(8);
    // no horizontal scroll container inside the journey
    const scrollers = await page.locator("section#growth-journey *").evaluateAll((els) =>
      els.filter((el) => {
        const ox = getComputedStyle(el).overflowX;
        return ox === "auto" || ox === "scroll";
      }).length,
    );
    expect(scrollers, "no horizontal timeline/scroller").toBe(0);
  });
});

test.describe("how-it-works — fragment clearance (every id)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  const groups: Record<string, string[]> = { stage: STAGES, system: SYSTEMS, section: SECTIONS, delivery: DELIVERY };
  // One test per group (each reuses the same page/server) navigates to every fragment in the
  // group and asserts real geometry — so all 20 ids are covered without extra server boots.
  for (const [group, ids] of Object.entries(groups)) {
    test(`${group} fragments each clear the sticky header`, async ({ page }) => {
      for (const id of ids) {
        // Force a full document navigation each iteration (a hash-only goto does not reliably
        // re-scroll), so every fragment is measured from a fresh load like a real inbound link.
        await page.goto("about:blank");
        await page.goto(`/how-it-works#${id}`);
        await expectFragmentTargetClearsStickyHeader(page, `#${id}`, `how-it-works #${id}`);
      }
    });
  }
});

test.describe("how-it-works — works with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });
  test("all approved content and fragments are server-rendered without JS", async ({ page }) => {
    await page.goto("/how-it-works");
    // One H1, and the eight-stage ordered list, three systems, eight process steps and four
    // delivery models are all in the server response (locators do not depend on page JS).
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("section#growth-journey ol > li")).toHaveCount(8);
    for (const id of SYSTEMS) await expect(page.locator(`article#${id}`)).toHaveCount(1);
    await expect(page.locator("section#process ol > li")).toHaveCount(8);
    for (const id of DELIVERY) await expect(page.locator(`article#${id}`)).toHaveCount(1);
    // Every required fragment target exists exactly once, with visible content (no interaction).
    // Locator counts do not depend on page JS (unlike page.evaluate).
    for (const id of ALL_IDS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} once (no JS)`).toBe(1);
      await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    }
    // Ordinary fragment navigation resolves to a real target without JS.
    await page.goto("/how-it-works#foundation");
    await expect(page.locator("li#foundation")).toBeVisible();
    // The primary CTA destination is present.
    await expect(page.locator('a[href="/growth-plan"]').first()).toBeVisible();
  });
});

test.describe("how-it-works page navs stay page-scoped (not duplicated onto the homepage)", () => {
  test("/ is the V2 spine and carries none of the how-it-works page-specific navs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // The migrated homepage is the V2 light-first spine — no legacy gradient titles.
    expect(await page.locator(".iw-gradient-word").count(), "homepage is V2, not legacy").toBe(0);
    // The how-it-works page-jump nav belongs to /how-it-works, never the homepage.
    await expect(page.getByRole("navigation", { name: "How it works sections" })).toHaveCount(0);
    // And no stage-jump nav either (the homepage bridges to the journey, it does not embed it).
    await expect(page.getByRole("navigation", { name: "Growth journey stages" })).toHaveCount(0);
  });
});

test.describe("how-it-works — axe (0 serious/critical)", () => {
  test("/how-it-works", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("how-it-works — no overflow across all widths", () => {
  for (const width of RESPONSIVE_WIDTHS) {
    test(`/how-it-works @ ${width}px`, async ({ page }) => {
      await page.goto("/how-it-works");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `/how-it-works @ ${width}px`);
    });
  }
});
