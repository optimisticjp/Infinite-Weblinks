import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { troubleshooterProblems } from "../../src/lib/content/data/troubleshooter";

/**
 * /troubleshooter — the V2 Digital Growth Troubleshooter. Structure, the click/keyboard selection
 * contract, all eight problem states, the no-JS server result (the first problem), responsive/zoom/
 * reduced-motion behaviour and accessibility. No form or API is involved; selection lives in React
 * state only (no URL/hash/persistence), so with JavaScript disabled the first problem is the result
 * and switching requires JavaScript.
 */

const P = troubleshooterProblems;
const SECTION_FRAGMENTS = ["troubleshooter-hero", "diagnose", "diagnosis", "get-started"];
const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

const axeSerious = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

const selector = (page: Page, label: string) => page.getByRole("button", { name: label, exact: true });

/** Prove hydration: the first pick applies the pressed state via React state. */
async function gotoHydrated(page: Page) {
  await page.goto("/troubleshooter");
  await selector(page, P[1].label).click();
  await expect(selector(page, P[1].label)).toHaveAttribute("aria-pressed", "true");
}

test.describe("troubleshooter — structure & accessibility", () => {
  test("one H1, breadcrumb, both hero CTAs, the diagnose+diagnosis+result regions, no canvas, logical headings", async ({ page }) => {
    const res = await page.goto("/troubleshooter");
    expect(res?.status(), "/troubleshooter should not error").toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Tell us what is not working. We'll show you where to look first.",
    );
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    expect(await page.locator('[id="troubleshooter-hero"] a[href="#diagnose"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="troubleshooter-hero"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);

    for (const id of [...SECTION_FRAGMENTS, "troubleshooter-result"]) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id}`).toBe(1);
    }
    expect(await page.locator("canvas").count(), "no canvas").toBe(0);
    // No SVG-gradient decoration in the route content (the shared chrome logo is excluded).
    expect(await page.locator("main linearGradient, main radialGradient").count(), "no SVG-gradient decoration").toBe(0);

    // The result region is not sticky/fixed.
    const sticky = await page.locator("#troubleshooter-result").evaluate((el) => {
      for (let n: HTMLElement | null = el as HTMLElement; n && n !== document.body; n = n.parentElement) {
        const p = getComputedStyle(n).position;
        if (p === "sticky" || p === "fixed") return true;
      }
      return false;
    });
    expect(sticky, "result is not sticky/fixed").toBe(false);

    // No horizontally-scrolling selector rail.
    const railed = await page.locator("#diagnose ul, #diagnose ol, #diagnose nav").evaluateAll((els) =>
      els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX)).length,
    );
    expect(railed, "no horizontal selector rail").toBe(0);

    const levels = await page.locator("main :is(h1,h2,h3,h4,h5,h6)").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `no jump before ${levels[i]}`).toBeLessThanOrEqual(1);
  });

  test("the selector buttons meet the 44px target and show a visible focus ring", async ({ page }) => {
    await page.goto("/troubleshooter");
    const first = selector(page, P[0].label);
    const box = await first.boundingBox();
    expect(box!.height, "button >= 44px").toBeGreaterThanOrEqual(44);
    await first.focus();
    const ring = await first.evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.outlineStyle !== "none" || cs.boxShadow !== "none";
    });
    expect(ring, "visible focus ring").toBe(true);
  });

  test("no serious or critical accessibility violations (initial state)", async ({ page }) => {
    await page.goto("/troubleshooter");
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id))).toBe("[]");
  });
});

test.describe("troubleshooter — selection interaction", () => {
  test("selecting a problem updates the whole guidance and the exact stage link, keeping one pressed", async ({ page }) => {
    await gotoHydrated(page);
    const target = P[2];
    await selector(page, target.label).click();

    // Exactly one pressed, and it is the clicked problem; the clicked button keeps focus.
    expect(await page.locator('button[aria-pressed="true"]').count()).toBe(1);
    await expect(selector(page, target.label)).toHaveAttribute("aria-pressed", "true");
    await expect(selector(page, target.label)).toBeFocused();

    const region = page.locator("#troubleshooter-result");
    await expect(region.getByRole("heading", { level: 2, name: target.label })).toBeVisible();
    await expect(region).toContainText(target.explanation);
    await expect(region).toContainText(target.reasons[0].title);
    await expect(region).toContainText(target.checks[0]);
    await expect(region).toContainText(target.focusFirst);
    await expect(region.getByRole("link", { name: "See the connected stage" })).toHaveAttribute(
      "href",
      `/how-it-works#${target.recommendedStageSlug}`,
    );
  });

  test("selection is visible beyond colour (the pressed button carries a tick mark)", async ({ page }) => {
    await page.goto("/troubleshooter");
    const pressedSvgs = await page.locator('button[aria-pressed="true"] svg').count();
    const anyUnpressed = page.locator('button[aria-pressed="false"]').first();
    const unpressedSvgs = await anyUnpressed.locator("svg").count();
    // The pressed button renders an extra glyph (the tick) that the unpressed ones do not.
    expect(pressedSvgs).toBeGreaterThan(unpressedSvgs);
  });

  test("Enter and Space both activate a choice; the live status updates", async ({ page }) => {
    await page.goto("/troubleshooter");
    // Enter activates.
    await selector(page, P[3].label).focus();
    await page.keyboard.press("Enter");
    await expect(selector(page, P[3].label)).toHaveAttribute("aria-pressed", "true");
    // Space activates.
    await selector(page, P[5].label).focus();
    await page.keyboard.press(" ");
    await expect(selector(page, P[5].label)).toHaveAttribute("aria-pressed", "true");
    // The concise polite status reflects the current selection.
    await expect(page.locator('[aria-live="polite"]')).toHaveText(`Showing guidance for: ${P[5].label}`);
  });

  test("every one of the eight selector buttons is reachable and selectable", async ({ page }) => {
    await page.goto("/troubleshooter");
    for (const p of P) {
      await selector(page, p.label).click();
      await expect(selector(page, p.label)).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#troubleshooter-result").getByRole("heading", { level: 2, name: p.label })).toBeVisible();
    }
  });

  test("no serious or critical accessibility violations in each of the eight problem states", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/troubleshooter");
    for (const p of P) {
      await selector(page, p.label).click();
      await expect(page.locator("#troubleshooter-result").getByRole("heading", { level: 2, name: p.label })).toBeVisible();
      expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), `${p.slug} a11y`).toBe("[]");
    }
  });
});

test.describe("troubleshooter — without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the hero, all eight choices and the first problem's full guidance render from the server", async ({ page }) => {
    await page.goto("/troubleshooter");
    const main = page.getByRole("main");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(main).toContainText(
      "Choose a business problem and get a simple explanation, useful checks and a sensible next step — built around the connected growth journey.",
    );
    expect(await page.locator('[id="troubleshooter-hero"] a[href="#diagnose"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="troubleshooter-hero"] a[href="/growth-plan"]').count()).toBeGreaterThan(0);
    await expect(main).toContainText("not a guaranteed diagnosis");

    // All eight choices render server-side, and the first problem is selected in the server response.
    for (const p of P) await expect(selector(page, p.label)).toBeVisible();
    expect(await page.locator('button[aria-pressed="true"]').count(), "one pressed on the server").toBe(1);
    await expect(selector(page, P[0].label)).toHaveAttribute("aria-pressed", "true");

    // The first problem's full guidance is the no-JS result.
    const region = page.locator("#troubleshooter-result");
    await expect(region.getByRole("heading", { level: 2, name: P[0].label })).toBeVisible();
    await expect(region).toContainText(P[0].explanation);
    for (const r of P[0].reasons) await expect(region, r.title).toContainText(r.title);
    for (const c of P[0].checks) await expect(region, c).toContainText(c);
    await expect(region).toContainText(P[0].focusFirst);
    await expect(region.getByRole("link", { name: "See the connected stage" })).toHaveAttribute(
      "href",
      `/how-it-works#${P[0].recommendedStageSlug}`,
    );
    expect(await region.locator('a[href="/growth-plan"]').count()).toBeGreaterThan(0);

    // The final CTA and every route fragment.
    await expect(page.getByRole("heading", { name: "Ready to turn the first check into a plan?" })).toBeVisible();
    for (const id of SECTION_FRAGMENTS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
    }
  });

  // NOTE: axe cannot run with JavaScript disabled (it injects and executes axe-core in the page). The
  // no-JS result is the same server-rendered DOM as the JS initial state (the first problem selected),
  // so its accessibility is covered by the "initial state" axe run above, which loads that exact DOM
  // before any interaction.
});

test.describe("troubleshooter — fragment geometry", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const id of SECTION_FRAGMENTS) {
    test(`#${id} occurs once, is meaningful content and clears the sticky header via hash nav`, async ({ page }) => {
      await page.goto("about:blank");
      await page.goto(`/troubleshooter#${id}`);
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} count`).toBe(1);
      const target = page.locator(`[id="${id}"]`);
      await expect(target).toBeVisible();
      const text = ((await target.textContent()) ?? "").trim();
      expect(text.length, `#${id} has meaningful content`).toBeGreaterThan(0);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `troubleshooter #${id}`);
    });
  }
});

test.describe("troubleshooter — responsive & zoom", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.goto("/troubleshooter");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `troubleshooter @ ${width}px`);
    });
  }

  test("the selector appears before the guidance on mobile", async ({ page }) => {
    await page.goto("/troubleshooter");
    await setViewportAndWaitForStableLayout(page, 390);
    const selectorTop = await page.locator("#diagnose").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const guidanceTop = await page.locator("#diagnosis").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(selectorTop, "selector is above the guidance").toBeLessThan(guidanceTop);
  });

  test("holds up under reduced motion and 200% text (one H1, no overflow)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/troubleshooter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `troubleshooter reduced-motion @ ${width}px`);
    }
    await page.addStyleTag({ content: ":root{font-size:200%!important;}" });
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `troubleshooter @200% text @ ${width}px`);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});

test.describe("cross-route accessibility smoke (no serious/critical axe)", () => {
  const ROUTES = [
    "/",
    "/growth-plan",
    "/contact",
    "/pricing",
    "/services",
    "/how-it-works",
    "/about",
    "/starting-points/website-no-traffic",
    "/privacy",
    "/design-preview",
    "/design-preview/shells",
  ];
  for (const route of ROUTES) {
    test(`no serious or critical violations on ${route}`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `${route} should not error`).toBeLessThan(400);
      expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), `${route} a11y`).toBe("[]");
    });
  }
});
