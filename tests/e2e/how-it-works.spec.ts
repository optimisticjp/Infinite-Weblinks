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

test.describe("how-it-works — fragment clearance (representative targets, every group)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const [group, id] of [
    ["stage", "discovery-plan"],
    ["system", "ai-automation"],
    ["section", "process"],
    ["delivery", "delivery-we-do"],
  ] as const) {
    test(`${group} #${id} clears the sticky header`, async ({ page }) => {
      await page.goto(`/how-it-works#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `#${id}`, `how-it-works #${id}`);
    });
  }
});

test.describe("homepage safety — the homepage is not migrated in this phase", () => {
  test("/ keeps its legacy presentation and none of the V2 how-it-works sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // The legacy homepage sections are still present (gradient titles are a legacy tell).
    expect(await page.locator(".iw-gradient-word").count(), "homepage still legacy").toBeGreaterThan(0);
    // The V2 how-it-works page-jump nav must NOT appear on the homepage.
    await expect(page.getByRole("navigation", { name: "How it works sections" })).toHaveCount(0);
    // And no V2 stage-jump nav either.
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
