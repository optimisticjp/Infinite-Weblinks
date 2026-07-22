import { test, expect } from "@playwright/test";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { services } from "../../src/lib/content/data/services";
import { serviceCategories } from "../../src/lib/content/data/service-categories";

/**
 * Phase 2M — the full service-domain system: every category renders the V2 template, every one of
 * the 70 services is a visible anchored article, every old /services/<service> URL 308s to its exact
 * category anchor, and all of it works without JavaScript. Data-driven from the seed so the contract
 * can never drift from the content.
 */

const renderable = <T extends { status: string }>(x: T) => x.status === "verified" || x.status === "readyToPublish";
const CATEGORIES = serviceCategories.filter(renderable);
const SERVICES = services.filter(renderable);
const SECTION_FRAGMENTS = ["domain-outcomes", "domain-catalog", "domain-connects", "domain-forwho", "domain-next", "get-started"];
const servicesFor = (slug: string) => SERVICES.filter((s) => s.categorySlug === slug);

const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];
// Representative categories for the full-width sweep: fewest services, most services, and a
// long-content area (websites-development has three clusters and long names).
const byCount = [...CATEGORIES].sort((a, b) => servicesFor(a.slug).length - servicesFor(b.slug).length);
const REPRESENTATIVE = [...new Set([byCount[0].slug, byCount[byCount.length - 1].slug, "websites-development"])];

test("all 70 folded service URLs 308 to their exact category anchor", async ({ request }) => {
  expect(SERVICES).toHaveLength(70);
  for (const s of SERVICES) {
    const res = await request.get(`/services/${s.slug}`, { maxRedirects: 0 });
    expect(res.status(), `${s.slug} status`).toBe(308);
    expect(res.headers()["location"], `${s.slug} location`).toBe(`/services/${s.categorySlug}#${s.slug}`);
  }
});

for (const c of CATEGORIES) {
  const catServices = servicesFor(c.slug);

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
      for (const id of SECTION_FRAGMENTS) {
        expect(await page.locator(`[id="${id}"]`).count(), `#${id} exactly once`).toBe(1);
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
    test("every service and section fragment renders from the server response", async ({ page }) => {
      await page.goto(`/services/${c.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(c.name);
      for (const s of catServices) {
        expect(await page.locator(`article[id="${s.slug}"]`).count(), `#${s.slug} (no JS)`).toBe(1);
        await expect(page.locator(`article[id="${s.slug}"]`)).toContainText(s.name);
      }
      for (const id of SECTION_FRAGMENTS) {
        expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
      }
    });
  });
}

test.describe("service fragment clearance (strategy-discovery)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("section + service fragments clear the sticky header", async ({ page }) => {
    const ids = [...SECTION_FRAGMENTS, ...servicesFor("strategy-discovery").map((s) => s.slug)];
    for (const id of ids) {
      await page.goto("about:blank");
      await page.goto(`/services/strategy-discovery#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `strategy #${id}`);
    }
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
