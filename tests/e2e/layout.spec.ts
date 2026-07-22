import { test, expect, type Page } from "@playwright/test";

/**
 * Site-wide alignment regression guard. Asserts the page-grid contract that the container
 * fix restored: content is inset from the viewport edge (never flush-left), the header /
 * hero / mega-menu / sections centre on one grid, and containers respect their max-width
 * tokens. Uses tolerance ranges (not pixel snapshots) so responsive refinements don't make
 * these brittle.
 *
 * Note: `.iw-container` is intentionally full-width below its max-width, with the gutter
 * supplied by `padding-inline` — so alignment is measured on the CONTENT box (border-box
 * inset + padding), never the element's border-box position.
 */

const WIDTHS = [360, 390, 768, 1024, 1280, 1440];
const MIN_INSET = 16; // px — content must never sit within ~16px of the viewport edge
const CENTER_TOLERANCE = 4; // px — |leftInset - rightInset|

/** Content-box insets (border-box position + padding) and content width for `selector`. */
async function contentBox(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const pl = parseFloat(cs.paddingLeft) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    const cw = document.documentElement.clientWidth;
    return {
      left: r.left + pl, // content left inset from the viewport edge
      right: cw - r.right + pr, // content right inset from the viewport edge
      boxWidth: r.width, // border-box width (for max-width checks)
      cw,
    };
  }, selector);
}

const HERO = 'section[aria-labelledby="hero-heading"] .iw-container--wide';
const HEADER_BAR = "header .iw-container--wide";

test.describe("no horizontal overflow at every target width", () => {
  const paths = [
    "/",
    "/services",
    "/services/websites-development",
    "/how-it-works",
    "/growth-plan",
    "/tools/websites-hosting-performance",
  ];
  for (const width of WIDTHS) {
    for (const path of paths) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `horizontal overflow at ${width}px on ${path}`).toBeLessThanOrEqual(1);
      });
    }
  }
});

test.describe("header + hero content is inset and centred", () => {
  for (const width of [768, 1024, 1280, 1440]) {
    test(`@ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const bar = await contentBox(page, HEADER_BAR);
      expect(bar, "header bar container present").not.toBeNull();
      expect(bar!.left, "header left inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(bar!.right, "header right inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(Math.abs(bar!.left - bar!.right), "header centred").toBeLessThanOrEqual(CENTER_TOLERANCE);

      const hero = await contentBox(page, HERO);
      expect(hero, "hero inner container present").not.toBeNull();
      expect(hero!.left, "hero left inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(hero!.right, "hero right inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(Math.abs(hero!.left - hero!.right), "hero centred").toBeLessThanOrEqual(CENTER_TOLERANCE);

      // Header and hero (both wide containers) share the same left alignment line.
      expect(Math.abs(bar!.left - hero!.left), "header/hero share a left edge").toBeLessThanOrEqual(2);
    });
  }
});

test.describe("containers respect their max-width tokens", () => {
  test("wide ≤ --container-wide, standard ≤ --container @ 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        container: parseInt(cs.getPropertyValue("--container")),
        wide: parseInt(cs.getPropertyValue("--container-wide")),
      };
    });

    // The homepage header bar is a wide container (present on every page).
    const wide = await contentBox(page, HEADER_BAR);
    expect(wide!.boxWidth, "wide container width").toBeLessThanOrEqual(tokens.wide + 2);

    // The V2 homepage spine uses wide containers throughout, so the standard-container token is
    // sampled from a content page that still uses one (/about renders standard `.iw-container`s).
    await page.goto("/about");
    const widestStandard = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll(".iw-container:not(.iw-container--wide)"));
      return els.reduce((max, el) => Math.max(max, el.getBoundingClientRect().width), 0);
    });
    expect(widestStandard, "a standard container is present").toBeGreaterThan(0);
    expect(widestStandard, "standard container width").toBeLessThanOrEqual(tokens.container + 2);
  });
});

test.describe("mobile nav covers the full viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("open menu overlay fills the screen (not trapped in the header)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box, "dialog present").not.toBeNull();
    // Must nearly fill the 844px viewport — regression guard for the header
    // backdrop-filter containing-block bug that trapped it at ~72px.
    expect(box!.height, "mobile dialog fills the viewport").toBeGreaterThan(800);
  });
});

test.describe("desktop mega-menu inner content is inset and centred", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const label of ["How It Works", "Services", "Resources"]) {
    test(`${label} panel`, async ({ page }) => {
      await page.goto("/");
      // Hover opens the panel; clicking the trigger now navigates to the hub.
      await page.getByRole("button", { name: label }).hover();
      await expect(page.getByRole("group", { name: label })).toBeVisible();

      const inner = await contentBox(page, '[role="group"] .iw-container--wide');
      expect(inner, "mega-menu inner container present").not.toBeNull();
      expect(inner!.left, "mega-menu left inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(inner!.right, "mega-menu right inset").toBeGreaterThanOrEqual(MIN_INSET);
      expect(Math.abs(inner!.left - inner!.right), "mega-menu centred").toBeLessThanOrEqual(
        CENTER_TOLERANCE,
      );
      // Mega-menu content lines up with the header bar's left edge.
      const bar = await contentBox(page, HEADER_BAR);
      expect(Math.abs(inner!.left - bar!.left), "menu/header share a left edge").toBeLessThanOrEqual(2);
    });
  }
});
