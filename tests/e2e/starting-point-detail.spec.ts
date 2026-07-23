import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { startingPoints } from "../../src/lib/content/data/starting-points";
import { stages } from "../../src/lib/content/data/stages";
import { services } from "../../src/lib/content/data/services";
import { serviceCategories } from "../../src/lib/content/data/service-categories";
import { isRenderable } from "../../src/lib/content/types";

/**
 * /starting-points/[slug] — the eight V2 starting-point detail pages. Structure, the exact recommended
 * stage + stage-service graph, links, fragments, breadcrumb (visible + JSON-LD aligned to Goals),
 * no-JS content, responsive/zoom/reduced-motion and accessibility. Fully server-rendered — no
 * route-specific Client Component, no canvas.
 */

const SPs = startingPoints.filter(isRenderable);
const FRAGMENTS = ["starting-point-hero", "recommended-stage", "recommendation", "stage-services", "get-started"];
const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

/** Resolve a starting point's recommended stage + services exactly as the route does. */
function resolve(sp: (typeof SPs)[number]) {
  const stage = stages.find((s) => s.slug === sp.recommendedStageSlug)!;
  const stageServices = (stage.serviceSlugs ?? []).map((slug) => {
    const service = services.find((sv) => sv.slug === slug)!;
    const category = serviceCategories.find((c) => c.slug === service.categorySlug)!;
    return {
      slug: service.slug,
      name: service.name,
      href: `/services/${service.categorySlug}#${service.slug}`,
      categoryLabel: category.name,
    };
  });
  return { stage, stageServices };
}

/** The route with the most services (get-discovered, 7) → the long-content route. */
const LONG = SPs.find((sp) => resolve(sp).stageServices.length >= 7) ?? SPs[2];

const axeSerious = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test.describe("starting-point detail — content & structure (all eight)", () => {
  for (const sp of SPs) {
    const { stage, stageServices } = resolve(sp);
    test(`/${sp.slug}: H1, breadcrumb, situation, stage, services, recommendation, CTA, fragments`, async ({ page }) => {
      const res = await page.goto(`/starting-points/${sp.slug}`);
      expect(res?.status(), `${sp.slug} status`).toBeLessThan(400);

      // One H1 = the label; canonical; no canvas; no cosmic decoration in the content.
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(sp.label);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/starting-points/${sp.slug}$`));
      expect(await page.locator("canvas").count(), "no canvas").toBe(0);
      expect(await page.locator("main linearGradient, main radialGradient").count(), "no SVG-gradient decoration").toBe(0);
      expect(await page.locator("main .theme-cosmic, main.theme-cosmic").count(), "no cosmic surface").toBe(0);

      // Visible breadcrumb: Goals → label (never a /starting-points destination).
      const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(crumb).toBeVisible();
      await expect(crumb.getByRole("link", { name: "Goals" })).toHaveAttribute("href", "/goals");
      expect(await crumb.locator('a[href="/starting-points"]').count(), "no /starting-points crumb").toBe(0);

      const main = page.getByRole("main");
      // Situation (lead) + trust note + both hero actions.
      await expect(main).toContainText(sp.situation);
      await expect(main).toContainText("Most businesses sit in more than one situation at once, and that's normal.");
      expect(await page.locator(`[id="starting-point-hero"] a[href="${sp.cta.route}"]`).count()).toBeGreaterThan(0);
      expect(await page.locator('[id="starting-point-hero"] a[href="/goals#by-where-you-are"]').count()).toBeGreaterThan(0);

      // Recommended stage — exactly one JourneyStageCard for the resolved stage.
      const stageSection = page.locator("#recommended-stage");
      await expect(stageSection.getByRole("heading", { level: 3, name: stage.name })).toBeVisible();
      await expect(stageSection).toContainText(`Stage ${stage.order}`);
      await expect(stageSection).toContainText(stage.summary);
      await expect(stageSection.locator(`a[href="/how-it-works#${stage.slug}"]`)).toHaveCount(1);

      // Recommendation + verbatim reassurance.
      const recSection = page.locator("#recommendation");
      await expect(recSection).toContainText(sp.recommendation);
      await expect(recSection).toContainText("Your plan is tailored to your specifics during discovery.");

      // Stage services — exact set + order + destinations.
      const svcSection = page.locator("#stage-services");
      const hrefs = await svcSection.locator("a[href^='/services/']").evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).getAttribute("href")),
      );
      expect(hrefs, `${sp.slug} service order`).toEqual(stageServices.map((s) => s.href));
      for (const s of stageServices) {
        await expect(svcSection, s.name).toContainText(s.name);
        await expect(svcSection, s.categoryLabel).toContainText(s.categoryLabel);
      }

      // Final CTA (primary /growth-plan + secondary /contact).
      await expect(page.getByRole("heading", { name: "Ready to turn this starting point into a plan?" })).toBeVisible();
      expect(await page.locator('[id="get-started"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);
      expect(await page.locator('[id="get-started"] a[href="/contact"]').count()).toBeGreaterThan(0);

      // Every fragment occurs exactly once.
      for (const id of FRAGMENTS) {
        expect(await page.locator(`[id="${id}"]`).count(), `#${id}`).toBe(1);
      }
    });
  }

  test("BreadcrumbList JSON-LD is aligned to Goals (Home → Goals → label), never /starting-points", async ({ page }) => {
    const sp = SPs[2];
    await page.goto(`/starting-points/${sp.slug}`);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const crumbs = blocks
      .map((b) => JSON.parse(b))
      .filter((d) => d["@type"] === "BreadcrumbList");
    expect(crumbs, "exactly one BreadcrumbList").toHaveLength(1);
    const names = crumbs[0].itemListElement.map((i: { name: string }) => i.name);
    expect(names).toEqual(["Home", "Goals", sp.label]);
    const items: string[] = crumbs[0].itemListElement.map((i: { item: string }) => i.item);
    expect(items.some((u) => /\/goals$/.test(u)), "Goals crumb → /goals").toBe(true);
    expect(items.some((u) => /\/starting-points$/.test(u)), "no /starting-points crumb").toBe(false);
    // No fabricated schema types on the route.
    const types = blocks.map((b) => JSON.parse(b)["@type"]);
    for (const t of ["FAQPage", "HowTo", "Product", "Offer", "Review", "AggregateRating"]) {
      expect(types, `no ${t}`).not.toContain(t);
    }
  });

  test("an unknown slug returns 404", async ({ page }) => {
    const res = await page.goto("/starting-points/not-a-real-starting-point");
    expect(res?.status()).toBe(404);
  });

  test("no serious or critical accessibility violations on every one of the eight routes", async ({ page }) => {
    test.setTimeout(90_000);
    for (const sp of SPs) {
      await page.goto(`/starting-points/${sp.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(sp.label);
      expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), `${sp.slug} a11y`).toBe("[]");
    }
  });
});

test.describe("starting-point detail — without JavaScript (all eight)", () => {
  test.use({ javaScriptEnabled: false });
  for (const sp of SPs) {
    const { stage, stageServices } = resolve(sp);
    test(`/${sp.slug}: complete content renders from the server`, async ({ page }) => {
      await page.goto(`/starting-points/${sp.slug}`);
      const main = page.getByRole("main");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(sp.label);
      await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
      await expect(main).toContainText(sp.situation);
      await expect(main).toContainText("Most businesses sit in more than one situation at once, and that's normal.");
      expect(await page.locator(`[id="starting-point-hero"] a[href="${sp.cta.route}"]`).count()).toBeGreaterThan(0);
      expect(await page.locator('[id="starting-point-hero"] a[href="/goals#by-where-you-are"]').count()).toBeGreaterThan(0);
      // Recommended stage + recommendation + reassurance.
      await expect(page.locator("#recommended-stage")).toContainText(stage.name);
      await expect(page.locator("#recommended-stage")).toContainText(stage.summary);
      await expect(page.locator(`#recommended-stage a[href="/how-it-works#${stage.slug}"]`)).toHaveCount(1);
      await expect(page.locator("#recommendation")).toContainText(sp.recommendation);
      await expect(page.locator("#recommendation")).toContainText("Your plan is tailored to your specifics during discovery.");
      // Every stage service card + destination.
      for (const s of stageServices) {
        await expect(page.locator("#stage-services"), s.name).toContainText(s.name);
        expect(await page.locator(`#stage-services a[href="${s.href}"]`).count(), s.href).toBe(1);
      }
      // Final CTA both destinations + every fragment.
      expect(await page.locator('[id="get-started"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);
      expect(await page.locator('[id="get-started"] a[href="/contact"]').count()).toBeGreaterThan(0);
      for (const id of FRAGMENTS) {
        expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
      }
    });
  }
});

test.describe("starting-point detail — fragment geometry", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const id of FRAGMENTS) {
    test(`#${id} occurs once, is meaningful content and clears the sticky header`, async ({ page }) => {
      await page.goto(`/starting-points/${LONG.slug}`);
      await page.waitForLoadState("networkidle");
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} count`).toBe(1);
      const target = page.locator(`[id="${id}"]`);
      await expect(target).toBeVisible();
      expect(((await target.textContent()) ?? "").trim().length, `#${id} content`).toBeGreaterThan(0);
      await page.evaluate((f) => {
        window.location.hash = "";
        window.location.hash = f;
      }, `#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `starting-point #${id}`);
    });
  }
});

test.describe("starting-point detail — responsive & zoom", () => {
  // All eight routes at 360 and 1280.
  for (const sp of SPs) {
    for (const width of [360, 1280]) {
      test(`/${sp.slug} no overflow @ ${width}px`, async ({ page }) => {
        await page.goto(`/starting-points/${sp.slug}`);
        await setViewportAndWaitForStableLayout(page, width);
        await expectNoHorizontalOverflow(page, `${sp.slug} @ ${width}px`);
      });
    }
  }

  // The long-content route at every width.
  for (const width of WIDTHS) {
    test(`long-content route (/${LONG.slug}) no overflow @ ${width}px`, async ({ page }) => {
      await page.goto(`/starting-points/${LONG.slug}`);
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `${LONG.slug} @ ${width}px`);
    });
  }

  test("holds up under reduced motion and 200% text (one H1, no overflow)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/starting-points/${LONG.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `${LONG.slug} reduced-motion @ ${width}px`);
    }
    await page.addStyleTag({ content: ":root{font-size:200%!important;}" });
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `${LONG.slug} @200% text @ ${width}px`);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
