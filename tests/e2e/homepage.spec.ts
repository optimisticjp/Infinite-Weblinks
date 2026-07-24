import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";

/**
 * Phase 2K — the V2 light-first homepage. Server-rendered spine, no cosmic engine, every homepage
 * fragment preserved on real visible content, and no fabricated proof.
 */

// Section-level fragments (SectionShell <section id>).
const SECTION_IDS = ["goals", "how-it-connects", "ways-of-working", "ownership", "learn", "get-started"];
// Every homepage fragment that must resolve (sections + bridge cards + the honest subsection).
const ALL_FRAGMENTS = [
  "goals",
  "growth-journey",
  "how-it-connects",
  "customer-journey",
  "services",
  "ways-of-working",
  "ownership",
  "honest",
  "learn",
  "get-started",
];
const RESPONSIVE_WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

async function idCount(page: Page, id: string) {
  return page.locator(`[id="${id}"]`).count();
}

test.describe("homepage — V2 hero and content", () => {
  test("renders the server hero H1, both CTAs, reassurance, areas and the works-with rail", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Infinite Weblinks/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("grow your business online");
    await expect(page.getByRole("link", { name: "Build my growth plan" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "See how it all works" }).first()).toBeVisible();
    await expect(page.getByText("Start from where you are. We will help you understand what comes next.")).toBeVisible();
    await expect(page.getByText("Connected across")).toBeVisible();
    for (const area of ["Website", "Marketing", "Customer Tools", "Automation", "Analytics"]) {
      await expect(page.getByText(area, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText("Works with the tools your business already uses.")).toBeVisible();
    await expect(page.getByText("Examples only. No partnership or endorsement implied.")).toBeVisible();
    await expect(page.getByText(/official partner|our clients/i)).toHaveCount(0);
  });

  test("the complete H1, a full support line and the primary CTA are above the fold at 390×844", async ({
    page,
  }) => {
    const VW = 390;
    const VH = 844;
    await page.setViewportSize({ width: VW, height: VH });
    await page.goto("/");

    const h1 = page.getByRole("heading", { level: 1 });
    const support = page.getByText(
      "We help you choose the right digital tools and services, build what you need, and make everything work together around your goals.",
    );
    const cta = page.getByRole("link", { name: "Build my growth plan" }).first();
    await expect(h1).toBeVisible();
    await expect(support).toBeVisible();
    await expect(cta).toBeVisible();

    const h1Box = await h1.boundingBox();
    const supportBox = await support.boundingBox();
    const ctaBox = await cta.boundingBox();

    // Read the computed line-height of the support paragraph, resolving a computed `normal`
    // safely to ~1.2× the font size, so the "at least one full line visible" check uses a real
    // measured line rather than a hard-coded pixel guess.
    const supportLineHeight = await support.evaluate((el) => {
      const cs = getComputedStyle(el);
      const lh = cs.lineHeight;
      if (lh === "normal") return Math.round(parseFloat(cs.fontSize) * 1.2);
      return Math.round(parseFloat(lh));
    });

    // Record the measured geometry so a regression shows exact bounds in the failure context.
    const bounds = JSON.stringify({
      viewport: { VW, VH },
      h1: h1Box,
      support: supportBox,
      cta: ctaBox,
      supportLineHeight,
    });

    expect(h1Box, `H1 bounds ${bounds}`).not.toBeNull();
    expect(supportBox, `support bounds ${bounds}`).not.toBeNull();
    expect(ctaBox, `CTA bounds ${bounds}`).not.toBeNull();
    expect(supportLineHeight, `computed support line-height resolves — ${bounds}`).toBeGreaterThan(0);

    // The complete H1 bounding box sits inside the viewport.
    expect(h1Box!.y, `H1 top inside fold — ${bounds}`).toBeGreaterThanOrEqual(0);
    expect(h1Box!.y + h1Box!.height, `H1 bottom inside fold — ${bounds}`).toBeLessThanOrEqual(VH);
    expect(h1Box!.x, `H1 left inside viewport — ${bounds}`).toBeGreaterThanOrEqual(0);
    expect(h1Box!.x + h1Box!.width, `H1 right inside viewport — ${bounds}`).toBeLessThanOrEqual(VW + 1);

    // At least one COMPLETE computed line-height of the support paragraph is inside the viewport:
    // measure the visible vertical intersection of the paragraph box and the viewport.
    const visibleTop = Math.max(supportBox!.y, 0);
    const visibleBottom = Math.min(supportBox!.y + supportBox!.height, VH);
    const visibleSupportHeight = visibleBottom - visibleTop;
    expect(
      visibleSupportHeight,
      `at least one full support line (${supportLineHeight}px) visible — ${bounds}`,
    ).toBeGreaterThanOrEqual(supportLineHeight);

    // The complete primary CTA is inside the viewport.
    expect(ctaBox!.y, `CTA top inside fold — ${bounds}`).toBeGreaterThanOrEqual(0);
    expect(ctaBox!.y + ctaBox!.height, `CTA bottom inside fold — ${bounds}`).toBeLessThanOrEqual(VH);
    expect(ctaBox!.x + ctaBox!.width, `CTA right inside viewport — ${bounds}`).toBeLessThanOrEqual(VW + 1);

    await expectNoHorizontalOverflow(page, "/ hero @ 390×844");
  });
});

test.describe("homepage — without JavaScript (server output is complete)", () => {
  test.use({ javaScriptEnabled: false });

  test("the full homepage renders from the server response alone", async ({ page }) => {
    await page.goto("/");

    // One H1 with the complete approved headline text.
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("A smarter way to plan and grow your business online.");

    // Useful support copy + both hero CTAs.
    await expect(
      page.getByText(
        "We help you choose the right digital tools and services, build what you need, and make everything work together around your goals.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Build my growth plan" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "See how it all works" }).first()).toBeVisible();

    // All ten goal destinations.
    expect(await page.locator('section#goals a[href^="/growth-plan?goal="]').count()).toBe(10);

    // The five connected-system nodes.
    for (const node of ["Get discovered", "Your website", "Analytics", "Email and SMS", "Repeat customers"]) {
      await expect(page.getByText(node, { exact: true }).first()).toBeVisible();
    }

    // The three bridge destinations.
    await expect(page.locator('a#growth-journey[href="/how-it-works#growth-journey"]')).toHaveCount(1);
    await expect(page.locator('a#customer-journey[href="/connected-growth"]')).toHaveCount(1);
    await expect(page.locator('a#services[href="/services"]')).toHaveCount(1);

    // The four delivery models (with no delivery-* fragment target on the homepage).
    for (const model of ["We Do the Work", "We Bring In an Expert", "We Run It End to End", "You Run It After"]) {
      await expect(page.getByRole("heading", { name: model })).toBeVisible();
    }
    expect(await page.locator('[id^="delivery-"]').count(), "no delivery-* ids on the homepage").toBe(0);

    // Ownership + honest expectations content.
    await expect(page.getByText("Owned and controlled by you")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What we won't do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What we do promise" })).toBeVisible();

    // Learn preview + final CTA.
    await expect(page.locator("section#learn")).toBeVisible();
    await expect(page.locator("section#get-started")).toBeVisible();

    // Every required homepage fragment target is present exactly once (no interaction needed).
    for (const id of ALL_FRAGMENTS) {
      expect(await idCount(page, id), `#${id} exactly once (no JS)`).toBe(1);
    }
  });

  test("ordinary fragment navigation resolves without JavaScript", async ({ page }) => {
    await page.goto("/#ownership");
    await expect(page.locator("#ownership")).toBeVisible();
    await expect(page.locator("#honest")).toBeVisible();
  });
});

test.describe("homepage — V2 spine and fragments", () => {
  test("renders the V2 section spine in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.evaluate(() => [...document.querySelectorAll("main section[id]")].map((s) => s.id));
    expect(ids.filter((id) => SECTION_IDS.includes(id))).toEqual(SECTION_IDS);
  });

  test("every homepage fragment resolves exactly once on visible content", async ({ page }) => {
    await page.goto("/");
    for (const id of ALL_FRAGMENTS) {
      expect(await idCount(page, id), `#${id} exactly once`).toBe(1);
      await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    }
    // The bridge cards carry three of the fragments on whole-card links to the full pages.
    await expect(page.locator('a#growth-journey[href="/how-it-works#growth-journey"]')).toHaveCount(1);
    await expect(page.locator('a#customer-journey[href="/connected-growth"]')).toHaveCount(1);
    await expect(page.locator('a#services[href="/services"]')).toHaveCount(1);
  });

  test("the goal router links every goal into the plan builder", async ({ page }) => {
    await page.goto("/");
    const links = page.locator('section#goals a[href^="/growth-plan?goal="]');
    expect(await links.count()).toBe(10);
  });

  test("no cosmic engine, gradient text, legacy bands or extra dark sections", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("canvas").count(), "no canvas").toBe(0);
    expect(await page.locator(".iw-gradient-word, .iw-gradient-text").count(), "no gradient text").toBe(0);
    expect(await page.locator("section.theme-band, section.theme-band-bright").count(), "no legacy bands").toBe(0);
    expect(await page.locator("#final-cta-heading").count(), "no legacy CTA banner").toBe(0);
    expect(await page.locator('[class*="orbLegacy"]:visible, [class*="StageTimeline"], [class*="RailBar"], [class*="PhoneFrame"], [class*="Constellation"]').count()).toBe(0);
    // Exactly one reserved dark full-width section (the final CTA); no legacy theme-dark.
    expect(await page.locator("section.theme-night").count(), "one dark section").toBe(1);
    expect(await page.locator("section.theme-dark").count(), "no legacy dark").toBe(0);
  });

  test("contains no fabricated proof, testimonials or rating schema", async ({ page }) => {
    await page.goto("/");
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
    expect(ldTypes).toContain("Organization");
    expect(ldTypes).toContain("WebSite");
    expect(ldTypes).not.toContain("Review");
    expect(ldTypes).not.toContain("AggregateRating");
    await expect(page.getByRole("heading", { name: /testimonial|what clients say|results|case study/i })).toHaveCount(0);
    await expect(page.getByText(/verified client|★|our clients say/i)).toHaveCount(0);
  });

  test("canonical is preserved", async ({ page }) => {
    await page.goto("/");
    // The homepage self-canonical is the site root — origin only, no path segment
    // (Next normalises the trailing slash away).
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  });
});

test.describe("homepage — fragment clearance (every fragment)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("each homepage fragment clears the sticky header", async ({ page }) => {
    for (const id of ALL_FRAGMENTS) {
      await page.goto("about:blank");
      await page.goto(`/#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `homepage #${id}`);
    }
  });
});

test.describe("homepage — axe (0 serious/critical)", () => {
  test("/", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("homepage — no overflow across all widths", () => {
  for (const width of RESPONSIVE_WIDTHS) {
    test(`/ @ ${width}px`, async ({ page }) => {
      await page.goto("/");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `/ @ ${width}px`);
    });
  }
});
