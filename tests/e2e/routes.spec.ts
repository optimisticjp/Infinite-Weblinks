import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Smoke + a11y coverage for the site's routes beyond the homepage. These assert the
 * shared route contract (a single H1 via PageHero, a Breadcrumb nav on detail pages,
 * the primary Growth Plan CTA) rather than specific copy, so they stay stable as content
 * evolves. Axe runs on a representative page per template family.
 */

const noSeriousA11y = async (page: import("@playwright/test").Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
};

test.describe("listing & hub routes", () => {
  for (const path of [
    "/goals",
    "/services",
    "/tools",
    "/resources",
    "/roadmaps",
    "/learn",
    "/how-it-works",
    "/faq",
    "/about",
  ]) {
    test(`${path} renders one H1 and internal links`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should not 404`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.getByRole("link").count()).toBeGreaterThan(3);
    });
  }

  // The /goals front door routes without a meta-choice: a cold visitor sees goals first,
  // then two alternate ways in. It must link straight to the goal detail pages.
  test("/goals links through to a working goal detail page", async ({ page }) => {
    await page.goto("/goals");
    const firstGoal = page.locator('main a[href^="/goals/"]').first();
    await expect(firstGoal).toBeVisible();
    await firstGoal.click();
    await expect(page).toHaveURL(/\/goals\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // Phase 4: /services is a router of sixteen category pages; its cards link to
  // /services/<category>, not to seventy service detail pages (those folded into the
  // category page as anchored sections).
  test("/services links through to a working category page", async ({ page }) => {
    await page.goto("/services");
    const firstCategory = page.locator('main a[href^="/services/"]').first();
    await expect(firstCategory).toBeVisible();
    await firstCategory.click();
    await expect(page).toHaveURL(/\/services\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // A category page carries a breadcrumb, the primary CTA, and its services as anchored
    // blocks (the fold: every service is a section with an id, so the old URL lands on it).
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    // The primary CTA is a growth-plan link; the label varies by template (the legacy
    // category pages say "Build My Digital Growth Plan", the Constellation domain template
    // says "Build my growth plan"), so match on the shared "growth plan" wording.
    await expect(
      page.getByRole("main").getByRole("link", { name: /growth plan/i }).first(),
    ).toBeVisible();
    await expect(page.locator("main li[id]").first()).toBeAttached();
  });
});

test.describe("how-it-works anchors resolve", () => {
  for (const hash of ["discovery-plan", "ai-automation", "delivery"]) {
    test(`#${hash} targets an element on the page`, async ({ page }) => {
      await page.goto(`/how-it-works#${hash}`);
      const target = page.locator(`#${hash}`);
      await expect(target).toHaveCount(1);
    });
  }
});

test.describe("legal pages", () => {
  for (const path of ["/privacy", "/cookies", "/terms", "/refunds", "/accessibility"]) {
    test(`${path} renders with the professional-review note`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText(/professional legal review/i)).toBeVisible();
    });
  }
});

test.describe("retired index URLs fold into /goals (no dead links, no orphans)", () => {
  // The /business-types and /starting-points *index* pages are retired and folded into
  // /goals as facets. An old bookmark or inbound link must land on the matching facet,
  // never 404.
  for (const [from, to] of [
    ["/business-types", "/goals#by-business-type"],
    ["/starting-points", "/goals#by-where-you-are"],
  ] as const) {
    test(`${from} permanently redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()["location"]).toBe(to);
    });
  }

  // Only the index URLs move — every [slug] detail page stays and stays reachable.
  for (const path of ["/business-types/ecommerce", "/starting-points/website-no-traffic"]) {
    test(`${path} detail page still renders`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should not 404`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }
});

test.describe("services split into category pages (Phase 4)", () => {
  // A sample of category pages across the Build / Grow / Operate groups render as pages.
  for (const category of ["strategy-discovery", "seo-content", "analytics-data"]) {
    test(`/services/${category} renders one H1 and its service blocks`, async ({ page }) => {
      const res = await page.goto(`/services/${category}`);
      expect(res?.status(), `/services/${category} should not 404`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      // The folded services are anchored blocks with an id — the 301 target for each old URL.
      expect(await page.locator("main li[id]").count()).toBeGreaterThan(0);
    });
  }

  // A representative old service URL 301s onto the anchored block on its category page.
  for (const [from, to] of [
    ["/services/seo-audit", "/services/strategy-discovery#seo-audit"],
    ["/services/brand-identity-logo-design", "/services/branding-design#brand-identity-logo-design"],
  ] as const) {
    test(`${from} permanently redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()["location"]).toBe(to);
    });
  }
});

test.describe("404", () => {
  test("an unknown URL shows the branded not-found page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to home/i })).toBeVisible();
  });

  // Phase 4: /solutions (a once-live URL — Solutions was the goal router before /goals
  // existed) 301s to /goals instead of throwing its equity away on a hard 404.
  test("/solutions permanently redirects to /goals", async ({ request }) => {
    const res = await request.get("/solutions", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/goals");
  });
});

test.describe("proof stays hidden until verified", () => {
  // The gated PROOF system (real client work) stays hidden: no CaseStudy/Example record is
  // Verified/Ready-to-Publish, so /examples and any unknown detail slug 404. /case-studies now
  // renders illustrative EXAMPLE scenarios (clearly labelled, not real clients), so it is a
  // live page — but an unknown case slug still 404s.
  for (const path of ["/examples", "/examples/anything", "/case-studies/anything"]) {
    test(`${path} returns 404`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
    });
  }

  test("/case-studies renders labelled example scenarios (not real proof)", async ({ page }) => {
    const res = await page.goto("/case-studies");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // The honesty label must be present so examples are never mistaken for real clients.
    await expect(page.getByText(/not real clients/i).first()).toBeVisible();
    // Cards link through to a case detail page.
    await expect(page.locator('main a[href^="/case-studies/"]').first()).toBeVisible();
  });
});

test.describe("accessibility of key templates", () => {
  test("service category page has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/services");
    await page.locator('main a[href^="/services/"]').first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("/goals front door has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/goals");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("services listing has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("how-it-works deep page has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });

  test("growth plan builder has no serious/critical a11y violations", async ({ page }) => {
    await page.goto("/growth-plan");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSeriousA11y(page);
  });
});
