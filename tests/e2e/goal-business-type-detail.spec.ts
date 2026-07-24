import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 2H — the goal and business-type DETAIL templates migrated to V2. Crawls every
 * /goals/[slug] and /business-types/[slug] route, checks the structural invariants, guards the
 * (deliberately un-migrated) /goals hub, and runs targeted axe on a representative matrix.
 */

const GOAL_SLUGS = [
  "launch-professional-store",
  "get-found-on-google",
  "make-ads-profitable",
  "turn-visitors-into-buyers",
  "bring-customers-back",
  "grow-social-following",
  "sell-course-membership",
  "save-time-with-automation",
  "get-leads-and-bookings",
  "understand-whats-working",
];
const BUSINESS_TYPE_SLUGS = [
  "ecommerce",
  "creators",
  "local-service",
  "b2b",
  "software",
  "established",
  "beginner",
];
const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];
const DELIVERY_LABELS =
  /We Do the Work|We Bring In an Expert|We Run It End to End|You Run It After/;

async function documentOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function commonInvariants(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} should not error`).toBeLessThan(400);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  expect(await page.locator("canvas").count(), `${path} no cosmic canvas`).toBe(0);
  expect(await page.locator(".iw-gradient-word").count(), `${path} no gradient word`).toBe(0);
  expect(await page.locator("#final-cta-heading").count(), `${path} no legacy CTA banner`).toBe(0);
  expect(await page.locator('[class*="orbLegacy"]:visible').count(), `${path} no visible node-orb`).toBe(0);
  await expect(page.locator("section#get-started h2")).toBeVisible();
}

test.describe("goal detail — crawl of all ten routes", () => {
  for (const slug of GOAL_SLUGS) {
    test(`/goals/${slug} holds the V2 goal invariants`, async ({ page }) => {
      await commonInvariants(page, `/goals/${slug}`);
      // GoalPath is a semantic ordered list of exactly three H3 steps in fixed order.
      const path = page.locator("section#approach ol");
      await expect(path.locator(":scope > li")).toHaveCount(3);
      const headings = path.getByRole("heading", { level: 3 });
      await expect(headings.nth(0)).toHaveText("What you need");
      await expect(headings.nth(1)).toHaveText("How we help");
      await expect(headings.nth(2)).toHaveText("Intended outcome");
      // The header primary CTA carries the goal query param.
      await expect(page.locator(`a[href="/growth-plan?goal=${slug}"]`).first()).toBeVisible();
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/goals/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("goal detail — structural (representative)", () => {
  test("first goal: variability note, example tools + disclaimer, service + stage cards", async ({ page }) => {
    await page.goto("/goals/launch-professional-store");
    // Visible variability note (a passive callout, not fine print), no promised number.
    await expect(page.getByText(/Outcomes vary/i)).toBeVisible();
    // Example tools: chips + the exact honesty disclaimer, ownership stated once.
    await expect(page.locator("section#tools")).toBeVisible();
    await expect(
      page.getByText("Examples only. This does not imply partnership or endorsement."),
    ).toBeVisible();
    // Ownership ("in your name") is stated exactly once on the page.
    const bodyText = await page.locator("body").innerText();
    expect((bodyText.match(/in your name/gi) ?? []).length).toBe(1);
    // Related services: ServiceCards linking to /services/[category]#[service], with a locked
    // delivery-model label; not the goal colour on every card, no node-orb.
    const serviceLink = page.locator('section#services a[href^="/services/"]').first();
    await expect(serviceLink).toBeVisible();
    await expect(serviceLink).toHaveAttribute("href", /\/services\/[a-z-]+#[a-z0-9-]+$/);
    await expect(page.locator("section#services").getByText(DELIVERY_LABELS).first()).toBeVisible();
    expect(await page.locator('section#services [class*="orbLegacy"]').count()).toBe(0);
    // Related stages: JourneyStageCards to /how-it-works#[stage], showing "Stage N".
    await expect(page.locator('section#where-it-fits a[href^="/how-it-works#"]').first()).toBeVisible();
    await expect(page.locator("section#where-it-fits").getByText(/^Stage \d+$/).first()).toBeVisible();
  });
});

test.describe("business-type detail — crawl of all seven routes", () => {
  for (const slug of BUSINESS_TYPE_SLUGS) {
    test(`/business-types/${slug} holds the V2 invariants`, async ({ page }) => {
      await commonInvariants(page, `/business-types/${slug}`);
      // The "Your goal" breadcrumb parent still points at /goals.
      await expect(page.locator('a[href="/goals"]', { hasText: "Your goal" }).first()).toBeVisible();
      // Situation goals render as GoalCards.
      await expect(page.locator('section#matters a[href^="/goals/"]').first()).toBeVisible();
      // The closing CTA's secondary points back to the hub's by-business-type facet.
      await expect(page.locator('section#get-started a[href="/goals#by-business-type"]')).toBeVisible();
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/business-types/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("business-type detail — structural (representative)", () => {
  test("ecommerce: roadmap card (suggested sequence) + derived service domains", async ({ page }) => {
    await page.goto("/business-types/ecommerce");
    // A single sequence-led RoadmapCard to the roadmap detail — not a grid of phase bento cards.
    const roadmapLink = page.locator('section#roadmap a[href^="/roadmaps/"]').first();
    await expect(roadmapLink).toBeVisible();
    // The RoadmapCard frames itself as a suggested sequence (exact match — the section lead also
    // contains the phrase "suggested sequence").
    await expect(roadmapLink.getByText("Suggested sequence", { exact: true })).toBeVisible();
    // Derived service domains → DomainCards to /services/[category], no node-orb.
    await expect(page.locator('section#domains a[href^="/services/"]').first()).toBeVisible();
    expect(await page.locator('section#domains [class*="orbLegacy"]').count()).toBe(0);
    // No project-progress / percentage styling anywhere on the page.
    expect(await page.locator("progress").count()).toBe(0);
  });
});

test.describe("goals hub safety — /goals is NOT migrated and its anchors/JSON-LD are intact", () => {
  test("keeps its redirect anchors, destinations and structured data", async ({ page }) => {
    await page.goto("/goals");
    // Exactly one H1, and the permanent redirect anchors both present.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("#by-where-you-are")).toHaveCount(1);
    await expect(page.locator("#by-business-type")).toHaveCount(1);
    // Destinations to both migrated detail templates still leave from the hub.
    await expect(page.locator('a[href^="/goals/"]').first()).toBeVisible();
    await expect(page.locator('a[href^="/business-types/"]').first()).toBeVisible();
    // Structured data unchanged: an ItemList of goals + a BreadcrumbList.
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
    expect(ldTypes).toContain("ItemList");
    expect(ldTypes).toContain("BreadcrumbList");
  });
});

test.describe("targeted axe — representative goal + business-type matrix (0 serious/critical)", () => {
  const pages = [
    "/goals/launch-professional-store",
    "/goals/understand-whats-working",
    "/business-types/ecommerce",
    "/business-types/beginner",
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
  for (const path of ["/goals/get-leads-and-bookings", "/business-types/beginner"]) {
    for (const width of RESPONSIVE_WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await documentOverflow(page), `${path} overflow @ ${width}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
