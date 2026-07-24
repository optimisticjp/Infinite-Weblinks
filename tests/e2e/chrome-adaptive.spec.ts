import { test, expect, type Page } from "@playwright/test";

/**
 * Adaptive compact header (Phase 2D §A1). The header must switch to the compact
 * logo + hamburger whenever the desktop nav + CTAs don't fit — INCLUDING at desktop widths
 * (≥1160px) under large text / zoom — without shrinking text, hiding overflow, wrapping the
 * nav to two rows, or dropping CTA wording. And it must return to the desktop nav once the
 * room is restored. We simulate real text-only zoom by scaling the root font-size (rem-based
 * type grows; the layout does not), which is exactly the case a fixed breakpoint overflows on.
 */

const DESKTOP_WIDTHS = [1160, 1280, 1440];

/** Scale text like a browser's "200% text size" (rem-based type doubles). */
async function setTextScale(page: Page, factor: number) {
  await page.evaluate((f) => {
    document.documentElement.style.fontSize = `${16 * f}px`;
  }, factor);
}

async function headerBarRows(page: Page) {
  // Row count = distinct vertical CENTRES among the direct, visible children of the header
  // bar (bucketed to 5px). The bar is `align-items:center`, so items on one row share a
  // centre even when their heights differ; a wrap would put a child on a new centre band.
  return page.evaluate(() => {
    const bar = document.querySelector("header .iw-container--wide");
    if (!bar) return -1;
    const centres = new Set<number>();
    for (const el of Array.from(bar.children)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) centres.add(Math.round((r.top + r.height / 2) / 5) * 5);
    }
    return centres.size;
  });
}

test.describe("Adaptive header — collapses under large text at desktop widths", () => {
  for (const width of DESKTOP_WIDTHS) {
    test(`@ ${width}px, 200% text → compact (no desktop nav, menu button, one row, no overflow)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Normal text: the desktop nav is available at these widths.
      await expect(page.getByRole("button", { name: "Services", exact: true })).toBeVisible();

      // 200% text: the header must collapse to compact.
      await setTextScale(page, 2);

      const menuBtn = page.getByRole("button", { name: "Open menu" });
      await expect(menuBtn).toBeVisible();
      // Desktop nav (its mega triggers) is no longer available.
      await expect(page.getByRole("button", { name: "Services", exact: true })).toBeHidden();
      await expect(page.getByRole("button", { name: "How It Works", exact: true })).toBeHidden();

      // Exactly one header row (nav did not wrap to a second line).
      expect(await headerBarRows(page), "header bar stays a single row").toBe(1);

      // The header chrome does not overflow — its scrollWidth equals its clientWidth (the
      // collapsed nav fits; the off-screen probes are clipped and add nothing to it).
      const headerOverflow = await page.evaluate(() => {
        const h = document.querySelector("header")!;
        return h.scrollWidth - h.clientWidth;
      });
      expect(headerOverflow, `header does not overflow at ${width}px, 200% text`).toBeLessThanOrEqual(1);

      // Restoring normal text returns the desktop nav.
      await setTextScale(page, 1);
      await expect(page.getByRole("button", { name: "Services", exact: true })).toBeVisible();
      await expect(menuBtn).toBeHidden();
    });
  }
});

test.describe("Adaptive header — desktop nav present at normal text", () => {
  for (const width of DESKTOP_WIDTHS) {
    test(`@ ${width}px, 100% text → desktop nav + CTA available`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("button", { name: "Services", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Build my growth plan" }).first()).toBeVisible();
      // The mobile menu button is not shown in desktop mode.
      await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    });
  }
});
