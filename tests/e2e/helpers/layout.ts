import { expect, type Page } from "@playwright/test";

/**
 * Layout test helpers — deterministic viewport-resize + horizontal-overflow checks.
 *
 * The naive pattern `await page.setViewportSize(w); const o = await page.evaluate(scrollWidth −
 * clientWidth)` measures the layout the instant the viewport changes, before the browser has
 * reflowed. Under full parallel worker load that occasionally samples the pre-reflow (desktop-
 * width) layout and reports a huge spurious overflow — the intermittent race seen in Phase 2G/2H
 * on the service-domain routes. These helpers remove the race WITHOUT weakening the assertion:
 * they wait on real readiness signals (the reported width, font readiness, animation frames) and
 * then poll the actual overflow value, so a still-settling layout gets a brief finite chance to
 * stabilise while a persistent REAL overflow still fails. No fixed sleeps, no relaxed threshold.
 */

/**
 * Resize the viewport and wait until the layout has actually settled at that width:
 *  - `setViewportSize` to the requested size,
 *  - poll until `documentElement.clientWidth` reports the requested width (the resize has landed),
 *  - await `document.fonts.ready` where supported (font swaps can change text width),
 *  - flush at least two `requestAnimationFrame` turns so a resize-driven reflow has painted.
 */
export async function setViewportAndWaitForStableLayout(
  page: Page,
  width: number,
  height = 900,
): Promise<void> {
  await page.setViewportSize({ width, height });

  await expect
    .poll(() => page.evaluate(() => document.documentElement.clientWidth), {
      timeout: 5_000,
      message: `viewport clientWidth never reached ${width}px`,
    })
    .toBe(width);

  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

/**
 * Assert no horizontal overflow (`scrollWidth − clientWidth ≤ 1px`). Polls with a finite timeout
 * so a layout that is a frame or two from settling is given a chance to stabilise, but a
 * persistent real overflow still fails — and the failure message names the context and the
 * measured overflow so the offending route/width is obvious.
 */
export async function expectNoHorizontalOverflow(page: Page, context = ""): Promise<void> {
  const label = context ? ` (${context})` : "";
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      {
        timeout: 3_000,
        message: `horizontal overflow${label}: scrollWidth − clientWidth exceeded the 1px tolerance`,
      },
    )
    .toBeLessThanOrEqual(1);
}
