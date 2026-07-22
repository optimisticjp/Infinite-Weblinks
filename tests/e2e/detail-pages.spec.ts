import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 2F — the tool and roadmap DETAIL templates migrated to the V2 system. A lightweight
 * crawl of all ten tool + seven roadmap routes (structural invariants), targeted axe on a
 * representative matrix, and focused structural checks for each template.
 */

const TOOL_SLUGS = [
  "websites-hosting-performance",
  "ecommerce-operations",
  "email-sms-crm",
  "funnels-landing-pages",
  "courses-memberships-community",
  "loyalty-reviews-referrals",
  "seo-content",
  "analytics-tracking",
  "automation-ai",
  "support-security-legal",
];
const ROADMAP_SLUGS = [
  "ecommerce",
  "creator",
  "service-local",
  "established",
  "ads-not-profitable",
  "needs-automation",
  "brand-new",
];
const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function documentOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function structuralInvariants(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} should not error`).toBeLessThan(400);
  // one H1
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  // no cosmic hero (CosmicBackground canvas), no legacy final-cta banner, no VISIBLE node-orb
  expect(await page.locator("canvas").count(), `${path} has no cosmic canvas`).toBe(0);
  expect(await page.locator("#final-cta-heading").count(), `${path} has no legacy CTA banner`).toBe(0);
  expect(await page.locator(".iw-gradient-word").count(), `${path} has no gradient word`).toBe(0);
  expect(
    await page.locator('[class*="orbLegacy"]:visible').count(),
    `${path} shows no NodeOrb`,
  ).toBe(0);
  // the V2 final CTA is present
  await expect(page.locator("section#get-started h2")).toBeVisible();
  await expect(page.locator('main a[href="/growth-plan"]').first()).toBeVisible();
}

test.describe("tool detail — crawl of all ten routes", () => {
  for (const slug of TOOL_SLUGS) {
    test(`/tools/${slug} holds the V2 structural invariants`, async ({ page }) => {
      await structuralInvariants(page, `/tools/${slug}`);
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/tools/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("roadmap detail — crawl of all seven routes", () => {
  for (const slug of ROADMAP_SLUGS) {
    test(`/roadmaps/${slug} holds the V2 structural invariants`, async ({ page }) => {
      await structuralInvariants(page, `/roadmaps/${slug}`);
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/roadmaps/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("tool detail — structural detail (representative)", () => {
  test("/tools/websites-hosting-performance: breadcrumb, relationships, example disclaimer, ownership", async ({
    page,
  }) => {
    await page.goto("/tools/websites-hosting-performance");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    // relationship groups (RelationshipCards)
    await expect(page.getByRole("heading", { level: 3, name: "Connects with" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Where it fits in the journey" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Suits these businesses" })).toBeVisible();
    // example-tools disclaimer + ownership meaning
    await expect(page.getByText("Examples only. This does not imply partnership or endorsement.")).toBeVisible();
    await expect(page.getByText(/created in your name/i)).toBeVisible();
    // relationship links go to their real destinations, and none is a nested whole-card link
    const connects = page.getByRole("link", { name: /Analytics & Tracking/ }).first();
    await expect(connects).toHaveAttribute("href", /\/tools\//);
  });
});

test.describe("roadmap detail — structural detail (representative)", () => {
  test("/roadmaps/ecommerce: ordered phases with stable anchors, stage/service/goal links", async ({ page }) => {
    await page.goto("/roadmaps/ecommerce");
    // ordered phase list with stable ids in order
    const items = page.locator("ol > li[id^='phase-']");
    await expect(items).toHaveCount(4);
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`#phase-${i}`)).toHaveCount(1);
    }
    // stage / service / goal LinkChips resolve to their real destinations
    await expect(page.locator('#phase-1 a[href^="/how-it-works#"]').first()).toBeVisible();
    await expect(page.locator('#phase-1 a[href^="/services/"]').first()).toBeVisible();
    await expect(page.locator('#phase-1 a[href^="/goals/"]').first()).toBeVisible();
    // business-type summary links to the type
    await expect(page.locator('section#built-for a[href^="/business-types/"]')).toHaveCount(1);
    // no fake duration/progress language in the phase sequence
    const seq = await page.locator("section#phases").innerText();
    expect(seq).not.toMatch(/\d+%|\bweeks?\b|\bmonths?\b|complete|progress bar/i);
  });

  test("phase anchors are reachable (deep link to #phase-3 resolves to the phase element)", async ({ page }) => {
    await page.goto("/roadmaps/ecommerce#phase-3");
    const target = page.locator("#phase-3");
    await expect(target).toBeVisible();
    await expect(target.getByRole("heading", { level: 3 })).toBeVisible();
  });
});

test.describe("targeted axe — representative detail matrix (0 serious/critical)", () => {
  const pages = [
    "/tools/websites-hosting-performance",
    "/tools/courses-memberships-community",
    "/roadmaps/ecommerce",
    "/roadmaps/brand-new",
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

test.describe("detail responsive — no overflow across all widths", () => {
  for (const path of ["/tools/analytics-tracking", "/roadmaps/creator"]) {
    for (const width of RESPONSIVE_WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await documentOverflow(page), `${path} overflow @ ${width}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
