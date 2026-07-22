import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 2G — the Learn article and case-scenario DETAIL templates migrated to V2, plus the
 * roadmap phase-jump correction. Crawls every article + scenario route, checks the structural
 * invariants, and runs targeted axe on a representative matrix.
 */

const ARTICLE_SLUGS = [
  "how-online-growth-works-as-one-system",
  "choosing-the-right-first-step",
  "what-connected-tools-actually-means",
  "understanding-delivery-models",
  "what-good-progress-actually-looks-like",
];
const SCENARIO_SLUGS = [
  "ecommerce-turn-browsers-into-buyers",
  "local-service-steady-enquiries",
  "creator-audience-into-income",
  "b2b-qualified-leads",
  "established-earn-more-per-customer",
];
const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

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

test.describe("Learn article detail — crawl of all five routes", () => {
  for (const slug of ARTICLE_SLUGS) {
    test(`/learn/${slug} holds the V2 article invariants`, async ({ page }) => {
      await commonInvariants(page, `/learn/${slug}`);
      // one semantic <article> containing the H1
      const article = page.locator("article");
      await expect(article).toHaveCount(1);
      await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);
      // organisation byline, no fabricated individual
      await expect(article.getByText("Infinite Weblinks").first()).toBeVisible();
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/learn/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("Learn article detail — structural (representative)", () => {
  test("first article: excerpt appears once, body paragraphs in order, meta + related", async ({ page }) => {
    await page.goto("/learn/how-online-growth-works-as-one-system");
    // reading time meta line (scoped to the article header, not a related-guide card)
    await expect(page.locator("article").getByText(/6 min read/)).toBeVisible();
    // four body paragraphs (source order) in the reading prose
    const prose = page.locator('[class*="prose"]');
    await expect(prose.locator("p")).toHaveCount(4);
    await expect(prose.locator("p").first()).toContainText("Every business we work with");
    // the excerpt (header lead) appears exactly once on the page
    const excerpt = "Why treating your website, marketing, and tools as one connected system beats juggling them as separate projects.";
    expect(await page.getByText(excerpt, { exact: false }).count()).toBe(1);
    // related goals (this article has one) + more-guides ArticleCards
    await expect(page.getByRole("heading", { level: 3, name: "Put this guide into practice" })).toBeVisible();
    await expect(page.locator('section#keep-going a[href^="/goals/"]').first()).toBeVisible();
    await expect(page.locator('section#keep-going a[href^="/learn/"]').first()).toBeVisible();
  });
});

test.describe("case-scenario detail — crawl of all five routes", () => {
  for (const slug of SCENARIO_SLUGS) {
    test(`/case-studies/${slug} holds the V2 scenario invariants`, async ({ page }) => {
      await commonInvariants(page, `/case-studies/${slug}`);
      // unmistakably illustrative: header badge + prominent challenge disclosure
      await expect(page.getByText("Illustrative example").first()).toBeVisible();
      await expect(
        page.getByText(/This is an illustrative example, not a real client/i),
      ).toBeVisible();
      // no real proof schema
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
      expect(ldTypes).not.toContain("Review");
      expect(ldTypes).not.toContain("AggregateRating");
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await documentOverflow(page), `/case-studies/${slug} overflow @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("case-scenario detail — structural (representative)", () => {
  test("ecommerce: ordered approach steps, work list, honest qualitative outcome, domains", async ({ page }) => {
    await page.goto("/case-studies/ecommerce-turn-browsers-into-buyers");
    // approach is an ordered list of h3 steps
    const approach = page.locator("section#approach ol");
    await expect(approach.locator(":scope > li")).toHaveCount(3);
    await expect(page.locator("section#approach").getByRole("heading", { level: 3 }).first()).toBeVisible();
    // work list
    await expect(page.locator("section#work ul > li")).not.toHaveCount(0);
    // outcome is qualitative, clearly labelled, with NO percentage / stat styling
    const outcome = page.locator("section#outcome");
    await expect(outcome.getByText("Illustrative outcome")).toBeVisible();
    await expect(outcome.getByText("Qualitative example, not a measured client result.")).toBeVisible();
    expect(await outcome.innerText()).not.toMatch(/\d+%/);
    // related service domains (DomainCards → /services/[category]), no BentoCard/node-orb
    await expect(page.locator('section#domains a[href^="/services/"]').first()).toBeVisible();
    expect(await page.locator('section#domains [class*="orbLegacy"]').count()).toBe(0);
  });
});

test.describe("roadmap phase-jump navigation (Phase 2F correction)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("phase links jump to their target, which clears the sticky header", async ({ page }) => {
    await page.goto("/roadmaps/ecommerce");
    const nav = page.getByRole("navigation", { name: "Roadmap phases" });
    await expect(nav).toBeVisible();
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(4);
    await expect(links.first()).toHaveAttribute("href", "#phase-1");
    // each phase target carries a scroll-margin so the fragment clears the sticky header
    const scrollMargin = await page
      .locator("#phase-2")
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
    expect(scrollMargin).toBeGreaterThan(60);
    // clicking a phase link updates the hash and reveals the phase
    await nav.getByRole("link", { name: /Operate and retain/ }).click();
    await expect(page).toHaveURL(/#phase-3$/);
    await expect(page.locator("#phase-3")).toBeVisible();
  });
});

test.describe("targeted axe — representative article + scenario matrix (0 serious/critical)", () => {
  const pages = [
    "/learn/how-online-growth-works-as-one-system",
    "/learn/choosing-the-right-first-step",
    "/case-studies/ecommerce-turn-browsers-into-buyers",
    "/case-studies/b2b-qualified-leads",
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
  for (const path of ["/learn/understanding-delivery-models", "/case-studies/established-earn-more-per-customer"]) {
    for (const width of RESPONSIVE_WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await documentOverflow(page), `${path} overflow @ ${width}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
