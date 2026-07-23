import { test, expect, type Page } from "@playwright/test";
import { setViewportAndWaitForStableLayout, expectNoHorizontalOverflow } from "./helpers/layout";

/**
 * Phase 2S (§H) — automated STRUCTURAL visual-acceptance across every representative template family
 * (not a manual visual sign-off; complete manual visual certification is deferred to Phase 3C).
 * The document root is light-first, dark is one reserved section on ordinary pages (zero on legal /
 * status), and no route renders a cosmic canvas, starfield/globe, gradient content heading or the
 * removed legacy hero. One H1 per page; no horizontal overflow at 390 / 768 / 1440.
 */

// One representative route per unique template family.
const ROUTES: { name: string; path: string; nightMax: number }[] = [
  { name: "homepage", path: "/", nightMax: 1 },
  { name: "goals-hub", path: "/goals", nightMax: 1 },
  { name: "goal-detail", path: "/goals/launch-professional-store", nightMax: 1 },
  { name: "business-type-detail", path: "/business-types/ecommerce", nightMax: 1 },
  { name: "starting-point-detail", path: "/starting-points/nothing-built-yet", nightMax: 1 },
  { name: "services-hub", path: "/services", nightMax: 1 },
  { name: "service-category", path: "/services/strategy-discovery", nightMax: 1 },
  { name: "tools-hub", path: "/tools", nightMax: 1 },
  { name: "tool-detail", path: "/tools/websites-hosting-performance", nightMax: 1 },
  { name: "roadmaps-hub", path: "/roadmaps", nightMax: 1 },
  { name: "roadmap-detail", path: "/roadmaps/ecommerce", nightMax: 1 },
  { name: "learn-hub", path: "/learn", nightMax: 1 },
  { name: "article-detail", path: "/learn/how-online-growth-works-as-one-system", nightMax: 1 },
  { name: "case-study-hub", path: "/case-studies", nightMax: 1 },
  { name: "resources", path: "/resources", nightMax: 1 },
  { name: "faq", path: "/faq", nightMax: 1 },
  { name: "pricing", path: "/pricing", nightMax: 1 },
  { name: "how-it-works", path: "/how-it-works", nightMax: 1 },
  { name: "about", path: "/about", nightMax: 1 },
  { name: "connected-growth", path: "/connected-growth", nightMax: 1 },
  { name: "account-ownership", path: "/account-ownership", nightMax: 1 },
  { name: "contact", path: "/contact", nightMax: 1 },
  { name: "growth-plan", path: "/growth-plan", nightMax: 1 },
  { name: "troubleshooter", path: "/troubleshooter", nightMax: 1 },
  // Legal reading pages stay fully light — zero dark sections.
  { name: "legal", path: "/privacy", nightMax: 0 },
];

/** Parse an "rgb(r, g, b)" string to [r,g,b]. */
async function bodyBg(page: Page): Promise<number[]> {
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const m = bg.match(/\d+/g)!.map(Number);
  return [m[0], m[1], m[2]];
}

for (const r of ROUTES) {
  test(`${r.name} meets the V2 acceptance contract`, async ({ page }) => {
    const res = await page.goto(r.path);
    expect(res?.status(), `${r.path} status`).toBeLessThan(400);

    // Light-first root: the body canvas is near-white (every channel ≥ 240).
    const [red, green, blue] = await bodyBg(page);
    expect(Math.min(red, green, blue), `${r.name} body is light`).toBeGreaterThanOrEqual(240);

    // Exactly one H1; no cosmic surface, canvas, globe/starfield or gradient-heading decoration.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(await page.locator(".theme-cosmic").count(), `${r.name} no cosmic`).toBe(0);
    expect(await page.locator("canvas").count(), `${r.name} no canvas`).toBe(0);
    expect(await page.locator("main linearGradient, main radialGradient").count(), `${r.name} no svg-gradient`).toBe(0);

    // At most `nightMax` reserved dark sections (1 on ordinary pages, 0 on legal).
    expect(await page.locator(".theme-night").count(), `${r.name} night sections`).toBeLessThanOrEqual(r.nightMax);

    // No horizontal overflow at mobile / tablet / desktop.
    for (const width of [390, 768, 1440]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `${r.name} @ ${width}px`);
    }
  });
}
