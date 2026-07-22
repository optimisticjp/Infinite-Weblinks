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

/**
 * After navigating to a fragment (via `page.goto("…#id")` or clicking an in-page link), assert the
 * fragment target actually clears the sticky header — i.e. its rendered top edge sits AT or BELOW
 * the visible sticky/fixed header's bottom (1px tolerance) AND inside the viewport. This measures
 * real geometry, not merely `scroll-padding-top` (which a broken header height or a mid-page target
 * could still defeat) and not merely "visible somewhere". It waits for the target to exist, lets
 * the layout settle (fonts + two animation frames), and polls with a finite timeout so a
 * still-scrolling page gets a brief chance to land — a target that stays under the header fails.
 * It changes no application CSS and makes no static content focusable.
 */
export async function expectFragmentTargetClearsStickyHeader(
  page: Page,
  targetSelector: string,
  context = "",
): Promise<void> {
  const label = context ? ` (${context})` : "";
  const target = page.locator(targetSelector).first();
  await target.waitFor({ state: "attached", timeout: 5_000 });

  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );

  const read = () =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // The visible sticky/fixed header's bottom edge (0 when there is no stuck header).
      let headerBottom = 0;
      for (const header of Array.from(document.querySelectorAll("header"))) {
        const cs = getComputedStyle(header);
        if (cs.position === "sticky" || cs.position === "fixed") {
          headerBottom = Math.max(headerBottom, header.getBoundingClientRect().bottom);
        }
      }
      return { top: rect.top, headerBottom, vh: window.innerHeight };
    }, targetSelector);

  await expect
    .poll(
      async () => {
        const m = await read();
        return m ? m.top >= m.headerBottom - 1 && m.top < m.vh : false;
      },
      {
        timeout: 3_000,
        message: `fragment target ${targetSelector}${label} did not clear the sticky header within the viewport`,
      },
    )
    .toBe(true);
}
