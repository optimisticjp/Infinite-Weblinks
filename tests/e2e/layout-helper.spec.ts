import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
} from "./helpers/layout";

/**
 * Direct browser contract for the layout helpers (Phase 2I §A1). It drives the real browser
 * layout with `page.setContent` — no production test route, no mocking of the geometry under
 * test — and confirms the helpers reach the requested width, accept a clean/≤1px page, and REJECT
 * a persistent real overflow with the caller's context in the message.
 */

const FRAME = (body: string) =>
  `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}</style></head><body>${body}</body></html>`;

test.describe("layout helper contract", () => {
  test("setViewportAndWaitForStableLayout reaches the requested clientWidth", async ({ page }) => {
    await page.setContent(FRAME(`<div style="width:100%;height:40px"></div>`));
    await setViewportAndWaitForStableLayout(page, 390);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(clientWidth).toBe(390);
  });

  test("a stable page with no overflow passes", async ({ page }) => {
    await page.setContent(FRAME(`<div style="width:100%;height:40px"></div>`));
    await setViewportAndWaitForStableLayout(page, 360);
    await expectNoHorizontalOverflow(page, "clean page"); // resolves
  });

  test("a 1px overflow is within tolerance and passes", async ({ page }) => {
    await page.setContent(FRAME(`<div style="width:calc(100vw + 1px);height:40px"></div>`));
    await setViewportAndWaitForStableLayout(page, 360);
    await expectNoHorizontalOverflow(page, "1px tolerance"); // ≤1 passes
  });

  test("a persistent real overflow fails, with the context in the message", async ({ page }) => {
    await page.setContent(FRAME(`<div style="width:3000px;height:40px"></div>`));
    await setViewportAndWaitForStableLayout(page, 360);

    // The intentional failure is caught HERE, so this test passes only when the helper correctly
    // rejects a real overflow — and only when it surfaces the supplied context.
    const start = Date.now();
    let caught: Error | null = null;
    try {
      await expectNoHorizontalOverflow(page, "intentional-overflow-marker");
    } catch (err) {
      caught = err as Error;
    }
    expect(caught, "helper must reject a persistent 3000px overflow").not.toBeNull();
    expect(String(caught?.message)).toContain("intentional-overflow-marker");
    // Finite timeout: the rejection lands well within the helper's bounded poll window.
    expect(Date.now() - start).toBeLessThan(15_000);
  });
});

test.describe("layout helper source contract", () => {
  const source = readFileSync("tests/e2e/helpers/layout.ts", "utf8");

  test("uses no page.waitForTimeout and no arbitrary sleep", () => {
    expect(source).not.toContain("waitForTimeout");
    expect(source).not.toMatch(/setTimeout\s*\(/);
    // The only waits are real readiness signals: rAF, fonts.ready, expect.poll.
    expect(source).toMatch(/requestAnimationFrame/);
    expect(source).toMatch(/expect\s*\n?\s*\.poll|expect\.poll/);
  });
});
