import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { pricingFaqs } from "../../src/lib/content/data/pricing";
import { DELIVERY_MODEL_KEYS, deliveryModelMeta } from "../../src/lib/design/deliveryModel";

/**
 * Phase 2N — the migrated /pricing route. Verifies the V2 light-first page from the centralised
 * pricing content: one H1, no canvas, no horizontal card rail, a logical heading hierarchy, every
 * fragment resolving and clearing the sticky header, the complete page (including FAQ answers)
 * available without JavaScript, no invented currency figure, no serious/critical axe issue, no
 * horizontal overflow across eight widths, and graceful behaviour under reduced motion and 200% text.
 */

const FRAGMENTS = [
  "pricing-hero",
  "why-quotes",
  "what-shapes-a-quote",
  "delivery-cost",
  "engagement-shapes",
  "how-to-get-a-quote",
  "pricing-faq",
  "get-started",
];
// The hero is the top of the page and needs no mid-page clearance test.
const MID_FRAGMENTS = FRAGMENTS.filter((f) => f !== "pricing-hero");
const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

test.describe("/pricing — structure and content", () => {
  test("one H1, no canvas, no horizontal card rail, all eight fragments once, logical heading order", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How pricing works");
    expect(await page.locator("canvas").count(), "no canvas").toBe(0);

    for (const id of FRAGMENTS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} exactly once`).toBe(1);
    }

    // No horizontal card rail: no list/nav inside main is a horizontal scroller.
    const railed = await page.locator("main ul, main nav").evaluateAll((els) =>
      els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX)).length,
    );
    expect(railed, "no horizontally-scrolling card rail").toBe(0);

    // Heading hierarchy never jumps by more than one level, starting at H1.
    const levels = await page
      .locator("main :is(h1,h2,h3,h4,h5,h6)")
      .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    expect(levels[0], "first heading is the H1").toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `no heading-level jump before ${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test("shows every delivery model, every FAQ, and no currency figure", async ({ page }) => {
    await page.goto("/pricing");
    const main = page.getByRole("main");
    for (const key of DELIVERY_MODEL_KEYS) {
      await expect(main, `delivery ${key}`).toContainText(deliveryModelMeta(key).label);
    }
    for (const faq of pricingFaqs) {
      await expect(main, `FAQ Q "${faq.question}"`).toContainText(faq.question);
      await expect(main, `FAQ A "${faq.question}"`).toContainText(faq.answer);
    }
    // Honest framing — no invented price.
    await expect(page.getByText(/[£$€]\s?\d/)).toHaveCount(0);
  });

  test("the first jump chip shows a visible focus indicator", async ({ page }) => {
    await page.goto("/pricing");
    const chip = page.locator('nav[aria-label="Pricing sections"] a').first();
    await chip.focus();
    const focusRing = await chip.evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.outlineStyle !== "none" || cs.boxShadow !== "none";
    });
    expect(focusRing, "visible focus ring").toBe(true);
  });
});

test.describe("/pricing — without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the complete page — including every FAQ answer — renders from the server response", async ({ page }) => {
    await page.goto("/pricing");
    const main = page.getByRole("main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How pricing works");

    for (const faq of pricingFaqs) {
      await expect(main, `FAQ answer "${faq.question}" (no JS)`).toContainText(faq.answer);
    }
    for (const id of FRAGMENTS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
    }
    // Both hero CTAs and both final CTAs are present without JavaScript.
    expect(await page.locator('[id="pricing-hero"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="pricing-hero"] a[href="/contact"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="get-started"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="get-started"] a[href="/contact"]').count()).toBeGreaterThan(0);
    // The delivery-model description link is preserved.
    expect(await page.locator('a[href="/how-it-works#delivery-we-do"]').count()).toBeGreaterThan(0);
  });
});

test.describe("/pricing — fragment clearance", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("every mid-page fragment clears the sticky header", async ({ page }) => {
    for (const id of MID_FRAGMENTS) {
      await page.goto("about:blank");
      await page.goto(`/pricing#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `pricing #${id}`);
    }
  });
});

test.describe("/pricing — responsive", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.goto("/pricing");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `pricing @ ${width}px`);
    });
  }
});

test.describe("/pricing — reduced motion and 200% text", () => {
  test("renders with one H1 and no overflow under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `pricing reduced-motion @ ${width}px`);
    }
  });

  test("holds its width with the root text scaled to 200%", async ({ page }) => {
    await page.goto("/pricing");
    // Simulate a 200% text-only zoom by doubling the root font size (rem-based sizing scales up).
    await page.addStyleTag({ content: ":root{font-size:200%!important;}" });
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `pricing @200% text @ ${width}px`);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});

test("/pricing has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/pricing");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
});
