import { test, expect, type Page } from "@playwright/test";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { services } from "../../src/lib/content/data/services";
import { serviceCategories } from "../../src/lib/content/data/service-categories";
import { stages } from "../../src/lib/content/data/stages";
import { goals } from "../../src/lib/content/data/goals";
import { getServiceDomainConfig } from "../../src/lib/services/domains";
import { deliveryModelMeta } from "../../src/lib/design/deliveryModel";

/**
 * Phase 2M — the full service-domain system, verified exhaustively (the Phase 2N correction pass).
 *
 * The seed + domain config are the test oracle, so the contract can never drift from the content:
 *  • every one of the 70 folded /services/<service> URLs 308s to its exact category anchor
 *    (request level) AND, followed in a real browser, lands on the visible anchored article;
 *  • every category renders the V2 template with no canvas and every service as a visible article;
 *  • every section fragment AND every service fragment clears the sticky header on its real
 *    category page (geometry, grouped by category — one page load per category, real
 *    getBoundingClientRect measurement, never merely scroll-padding);
 *  • with JavaScript disabled every category exposes its complete content from the server HTML;
 *  • /services exposes its complete hub content from the server HTML.
 */

const renderable = <T extends { status: string }>(x: T) => x.status === "verified" || x.status === "readyToPublish";
const CATEGORIES = serviceCategories.filter(renderable);
const SERVICES = services.filter(renderable);
const BASE_SECTION_FRAGMENTS = ["domain-outcomes", "domain-catalog", "domain-connects", "domain-forwho", "domain-next", "get-started"];
const servicesFor = (slug: string) => SERVICES.filter((s) => s.categorySlug === slug);

/** Resolve the full oracle for one category exactly the way the route does. */
function resolve(catSlug: string) {
  const category = serviceCategories.find((c) => c.slug === catSlug)!;
  const config = getServiceDomainConfig(catSlug)!;
  const catServices = servicesFor(catSlug);
  const activeStage = stages.find((s) => s.slug === config.stageSlug)!;
  const nextCategory = serviceCategories.find((c) => c.slug === config.next.slug)!;
  const relatedGoals = [...new Set(catServices.flatMap((s) => s.goalSlugs))]
    .map((gs) => goals.find((g) => g.slug === gs))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ slug: g.slug, title: g.title, outcome: g.outcome }));
  const copyFor = (slug: string) =>
    config.serviceCopy?.[slug] ?? catServices.find((s) => s.slug === slug)!.plainDescription;
  // Exercise the serviceCopy precedence for real: prefer a service that HAS an override.
  const selected = catServices.find((s) => config.serviceCopy?.[s.slug]) ?? catServices[0];
  // domain-goals only renders when there are related goals.
  const sectionFragments = relatedGoals.length > 0 ? [...BASE_SECTION_FRAGMENTS, "domain-goals"] : [...BASE_SECTION_FRAGMENTS];
  return { category, config, catServices, activeStage, nextCategory, relatedGoals, copyFor, selected, sectionFragments };
}

const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];
// Representative categories for the full-width sweep: fewest services, most services, and a
// long-content area (websites-development has three clusters and long names).
const byCount = [...CATEGORIES].sort((a, b) => servicesFor(a.slug).length - servicesFor(b.slug).length);
const REPRESENTATIVE = [...new Set([byCount[0].slug, byCount[byCount.length - 1].slug, "websites-development"])];

/** Assert a fragment on the already-loaded category page clears the sticky header, grouped per
 *  category (one page load), driving the jump via the real hash so scroll-margin geometry applies —
 *  but the assertion measures the rendered top edge, not merely computed scroll-padding. */
async function expectHashFragmentClears(page: Page, id: string, ctx: string) {
  await page.evaluate((frag) => {
    // Reset then set so re-visiting the same id still re-triggers the fragment scroll.
    if (window.location.hash === `#${frag}`) window.location.hash = "";
    window.location.hash = frag;
  }, id);
  await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, ctx);
}

test("all 70 folded service URLs 308 to their exact category anchor", async ({ request }) => {
  expect(SERVICES).toHaveLength(70);
  for (const s of SERVICES) {
    const res = await request.get(`/services/${s.slug}`, { maxRedirects: 0 });
    expect(res.status(), `${s.slug} status`).toBe(308);
    expect(res.headers()["location"], `${s.slug} location`).toBe(`/services/${s.categorySlug}#${s.slug}`);
  }
});

for (const c of CATEGORIES) {
  const { catServices, activeStage, nextCategory, relatedGoals, config, copyFor, selected, sectionFragments } = resolve(c.slug);

  test.describe(`/services/${c.slug}`, () => {
    test("one H1, no canvas, every service a unique visible article anchor, section fragments resolve", async ({ page }) => {
      await page.goto(`/services/${c.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(c.name);
      expect(await page.locator("canvas").count(), `${c.slug} no canvas`).toBe(0);

      for (const s of catServices) {
        const el = page.locator(`article[id="${s.slug}"]`);
        expect(await el.count(), `#${s.slug} exactly once`).toBe(1);
        await expect(el).toBeVisible();
        await expect(el, `#${s.slug} shows its name`).toContainText(s.name);
      }
      for (const id of sectionFragments) {
        expect(await page.locator(`[id="${id}"]`).count(), `#${id} exactly once`).toBe(1);
      }
    });

    test("every section fragment and every service fragment clears the sticky header", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/services/${c.slug}`);
      const ids = [...sectionFragments, ...catServices.map((s) => s.slug)];
      for (const id of ids) {
        expect(await page.locator(`[id="${id}"]`).count(), `${c.slug} #${id} unique`).toBe(1);
        await expectHashFragmentClears(page, id, `${c.slug} #${id}`);
      }
    });

    test("no overflow at 360 and 1440", async ({ page }) => {
      await page.goto(`/services/${c.slug}`);
      for (const width of [360, 1440]) {
        await setViewportAndWaitForStableLayout(page, width);
        await expectNoHorizontalOverflow(page, `${c.slug} @ ${width}px`);
      }
    });
  });

  test.describe(`/services/${c.slug} — without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });
    test("the complete category content renders from the server response", async ({ page }) => {
      await page.goto(`/services/${c.slug}`);
      const main = page.getByRole("main");

      // One H1 = the category name.
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(c.name);

      // Active-stage name and destination.
      await expect(main).toContainText(activeStage.name);
      expect(await page.locator(`a[href="/how-it-works#${config.stageSlug}"]`).count(), `${c.slug} stage link`).toBeGreaterThan(0);

      // Every outcome (title + body) and every configured cluster heading + intro.
      for (const o of config.outcomes) {
        await expect(main, `${c.slug} outcome "${o.title}"`).toContainText(o.title);
        await expect(main, `${c.slug} outcome body "${o.title}"`).toContainText(o.body);
      }
      for (const cl of config.clusters) {
        await expect(main, `${c.slug} cluster "${cl.heading}"`).toContainText(cl.heading);
        await expect(main, `${c.slug} cluster intro "${cl.heading}"`).toContainText(cl.intro);
      }

      // Every service title.
      for (const s of catServices) await expect(main, `${c.slug} service "${s.name}"`).toContainText(s.name);

      // Selected service: summary via the EXACT serviceCopy precedence, exact delivery label,
      // every whatYouGet item and every example tool — all inside its own article.
      const art = page.locator(`article[id="${selected.slug}"]`);
      await expect(art, `${selected.slug} summary`).toContainText(copyFor(selected.slug));
      await expect(art, `${selected.slug} delivery label`).toContainText(deliveryModelMeta(selected.deliveryModel).label);
      for (const point of selected.whatYouGet) await expect(art, `${selected.slug} whatYouGet`).toContainText(point);
      for (const tool of selected.exampleTools) await expect(art, `${selected.slug} tool`).toContainText(tool);

      // The catalog-level non-endorsement clarification.
      await expect(main).toContainText("Example tools are illustrative. No partnership or endorsement is implied.");

      // Every connectsTo label and body.
      for (const conn of config.connectsTo) {
        await expect(main, `${c.slug} connectsTo "${conn.label}"`).toContainText(conn.label);
        await expect(main, `${c.slug} connectsTo body "${conn.label}"`).toContainText(conn.body);
      }

      // Every related goal title and destination.
      for (const g of relatedGoals) {
        await expect(main, `${c.slug} goal "${g.title}"`).toContainText(g.title);
        expect(await page.locator(`a[href="/goals/${g.slug}"]`).count(), `${c.slug} goal link ${g.slug}`).toBeGreaterThan(0);
      }

      // config.forWho and every config.when item.
      await expect(main, `${c.slug} forWho`).toContainText(config.forWho);
      for (const w of config.when) await expect(main, `${c.slug} when "${w}"`).toContainText(w);

      // Resolved next-category name and destination.
      await expect(main, `${c.slug} next name`).toContainText(nextCategory.name);
      expect(await page.locator(`a[href="/services/${config.next.slug}"]`).count(), `${c.slug} next link`).toBeGreaterThan(0);

      // Final CTA destinations.
      expect(await page.locator('[id="get-started"] a[href="/growth-plan"]').count(), `${c.slug} CTA growth-plan`).toBeGreaterThan(0);
      expect(await page.locator('[id="get-started"] a[href="/services"]').count(), `${c.slug} CTA services`).toBeGreaterThan(0);

      // Every section fragment and every service fragment, exactly once, from the server HTML.
      for (const id of sectionFragments) expect(await page.locator(`[id="${id}"]`).count(), `${c.slug} #${id} (no JS)`).toBe(1);
      for (const s of catServices) expect(await page.locator(`article[id="${s.slug}"]`).count(), `${c.slug} #${s.slug} (no JS)`).toBe(1);
    });
  });

  test.describe(`/services/${c.slug} — folded service redirects (browser follow)`, () => {
    test("every old service URL lands on its visible, header-cleared article", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const s of catServices) {
        await page.goto(`/services/${s.slug}`);
        const url = new URL(page.url());
        expect(url.pathname, `${s.slug} final path`).toBe(`/services/${c.slug}`);
        expect(url.hash, `${s.slug} final hash`).toBe(`#${s.slug}`);
        const art = page.locator(`article[id="${s.slug}"]`);
        expect(await art.count(), `${s.slug} article once`).toBe(1);
        await expect(art, `${s.slug} name`).toContainText(s.name);
        await expect(art, `${s.slug} summary`).toContainText(copyFor(s.slug));
        await expectFragmentTargetClearsStickyHeader(page, `article[id="${s.slug}"]`, `redirect ${s.slug}`);
      }
    });
  });
}

test.describe("/services — without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the complete hub content renders from the server response", async ({ page }) => {
    await page.goto("/services");
    const main = page.getByRole("main");

    // One H1.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    // Approved lead and trust note.
    await expect(main).toContainText("Sixteen areas of work, grouped the way you actually need them.");
    await expect(main).toContainText("Every service shows who does the work.");

    // Both PageHeader CTA destinations.
    expect(await page.locator('[id="services-hero"] a[href="/growth-plan"]').count(), "hub CTA growth-plan").toBeGreaterThan(0);
    expect(await page.locator('[id="services-hero"] a[href="#service-domains"]').count(), "hub CTA jump").toBeGreaterThan(0);

    // All 16 category links, in source order, with real singular/plural service counts.
    const domainLinks = page.locator('[id="service-domains"] a[href^="/services/"]');
    const hrefs = await domainLinks.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")));
    expect(hrefs, "16 category links in source order").toEqual(CATEGORIES.map((c) => `/services/${c.slug}`));
    for (const c of CATEGORIES) {
      const count = servicesFor(c.slug).length;
      const card = page.locator(`[id="service-domains"] a[href="/services/${c.slug}"]`);
      await expect(card, `${c.slug} count text`).toContainText(`${count} service${count === 1 ? "" : "s"}`);
    }

    // Fragments and final CTA destinations.
    for (const id of ["services-hero", "service-domains", "get-started"]) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
    }
    expect(await page.locator('[id="get-started"] a[href="/growth-plan"]').count(), "hub final CTA growth-plan").toBeGreaterThan(0);
    expect(await page.locator('[id="get-started"] a[href="/how-it-works"]').count(), "hub final CTA how-it-works").toBeGreaterThan(0);
  });
});

for (const slug of REPRESENTATIVE) {
  test.describe(`/services/${slug} — no overflow across all widths`, () => {
    for (const width of WIDTHS) {
      test(`@ ${width}px`, async ({ page }) => {
        await page.goto(`/services/${slug}`);
        await setViewportAndWaitForStableLayout(page, width);
        await expectNoHorizontalOverflow(page, `${slug} @ ${width}px`);
      });
    }
  });
}
