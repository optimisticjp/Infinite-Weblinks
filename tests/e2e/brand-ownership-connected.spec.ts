import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";

/**
 * Phase 2L — the V2 brand-story / ownership / connected-growth routes. Server-rendered spines, no
 * cosmic engine, every retained fragment on real visible content, illustrative content clearly
 * labelled, and no fabricated proof.
 */

const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

const ROUTES = {
  "/about": {
    h1: "Your digital growth partner",
    fragments: ["about-hero", "who-we-are", "principles", "ways-of-working", "honest", "get-started"],
  },
  "/account-ownership": {
    h1: "Your business is built in your name",
    fragments: ["ownership-hero", "ownership", "get-started"],
  },
  "/connected-growth": {
    h1: "Simple combinations that compound",
    fragments: ["connected-growth-hero", "journey", "examples", "get-started"],
  },
} as const;

async function idCount(page: Page, id: string) {
  return page.locator(`[id="${id}"]`).count();
}
async function ldTypes(page: Page) {
  return page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.flatMap((n) => {
      try {
        const d = JSON.parse(n.textContent || "{}");
        return Array.isArray(d) ? d.map((x) => x["@type"]) : [d["@type"]];
      } catch {
        return [];
      }
    }),
  );
}

for (const [route, cfg] of Object.entries(ROUTES)) {
  test.describe(`${route} — V2 structure`, () => {
    test("one H1 with the approved text, a breadcrumb graph and a self-canonical", async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(cfg.h1);
      expect(await ldTypes(page)).toContain("BreadcrumbList");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route}$`));
      // The single reserved dark section is the final CTA.
      expect(await page.locator("section.theme-night").count(), "one dark section").toBe(1);
    });

    test("no cosmic engine, gradient text, phone strip or extra dark sections", async ({ page }) => {
      await page.goto(route);
      expect(await page.locator("canvas").count(), "no canvas").toBe(0);
      expect(await page.locator(".iw-gradient-word, .iw-gradient-text").count(), "no gradient text").toBe(0);
      expect(
        await page.locator('[class*="PhoneFrame"], [class*="Constellation"], [class*="orbLegacy"]:visible').count(),
        "no cosmic/phone constructs",
      ).toBe(0);
      expect(await page.locator("section.theme-dark").count(), "no legacy dark").toBe(0);
    });

    test("every retained fragment resolves exactly once on visible content", async ({ page }) => {
      await page.goto(route);
      for (const id of cfg.fragments) {
        expect(await idCount(page, id), `#${id} exactly once`).toBe(1);
        await expect(page.locator(`[id="${id}"]`)).toBeVisible();
      }
    });

    test("each mid-page fragment clears the sticky header", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      // The top-of-page hero fragment sits above the fold; there is nothing to scroll past it, so
      // clearance is only meaningful for the mid-page fragments.
      for (const id of cfg.fragments.filter((f) => !f.endsWith("-hero"))) {
        await page.goto("about:blank");
        await page.goto(`${route}#${id}`);
        await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `${route} #${id}`);
      }
    });

    test("axe — 0 serious/critical", async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
    });

    for (const width of WIDTHS) {
      test(`no overflow @ ${width}px`, async ({ page }) => {
        await page.goto(route);
        await setViewportAndWaitForStableLayout(page, width);
        await expectNoHorizontalOverflow(page, `${route} @ ${width}px`);
      });
    }
  });

  test.describe(`${route} — without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });
    test("the full page renders from the server response, with all fragments", async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(cfg.h1);
      await expect(page.getByRole("link", { name: "Build my growth plan" }).first()).toBeVisible();
      for (const id of cfg.fragments) {
        expect(await idCount(page, id), `#${id} present (no JS)`).toBe(1);
      }
    });
  });
}

test.describe("/about — content integrity", () => {
  test("keeps all five principles, four delivery models and the honest items; no delivery-* ids", async ({ page }) => {
    await page.goto("/about");
    for (const principle of [
      "We understand before we sell",
      "Growth is one connected system",
      "We start with the smallest next step",
      "You own your accounts, data and tools",
      "More tools is not better",
    ]) {
      await expect(page.getByRole("heading", { name: principle })).toBeVisible();
    }
    for (const model of ["We Do the Work", "We Bring In an Expert", "We Run It End to End", "You Run It After"]) {
      await expect(page.getByRole("heading", { name: model })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "What we won't do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What we do promise" })).toBeVisible();
    // The delivery cards carry no fragment target on /about (those are page-scoped to /how-it-works).
    expect(await page.locator('[id^="delivery-"]').count(), "no delivery-* on /about").toBe(0);
  });
});

test.describe("/account-ownership — content integrity", () => {
  test("keeps the ownership assets, guarantees and CTA destinations", async ({ page }) => {
    await page.goto("/account-ownership");
    await expect(page.getByText("Owned and controlled by you")).toBeVisible();
    for (const guarantee of ["Your accounts", "Your data", "Your future"]) {
      await expect(page.getByRole("heading", { name: guarantee })).toBeVisible();
    }
    await expect(page.locator('#get-started a[href="/growth-plan"]')).toBeVisible();
    await expect(page.locator('#get-started a[href="/how-it-works"]')).toBeVisible();
  });
});

test.describe("/connected-growth — illustrative content, no fabricated proof", () => {
  test("shows the illustrative framing, six journey steps and six examples, and no rating schema", async ({ page }) => {
    await page.goto("/connected-growth");
    await expect(page.getByText(/not real clients/i).first()).toBeVisible();
    await expect(page.getByText(/generic, illustrative path/i)).toBeVisible();
    // Six journey phase headings.
    for (const phase of ["Discover", "Visit store", "Take action", "Follow up", "Purchase", "Retain & grow"]) {
      await expect(page.getByRole("heading", { name: phase })).toBeVisible();
    }
    // Six illustrative combination cards, each carrying the "Illustrative combination" badge.
    expect(await page.locator("section#examples article").count()).toBe(6);
    expect(await page.getByText("Illustrative combination").first().isVisible()).toBe(true);
    // No proof / rating schema.
    const types = await ldTypes(page);
    expect(types).not.toContain("Review");
    expect(types).not.toContain("AggregateRating");
    await expect(page.getByRole("heading", { name: /testimonial|what clients say|results/i })).toHaveCount(0);
    // No false "see how it works" span affordance (only real Buttons/links).
    const seeHow = page.getByText(/^see how it works$/i);
    expect(await seeHow.count()).toBe(0);
  });
});
