import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage opening", () => {
  test("renders the hero headline and both primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Infinite Weblinks/);
    await expect(page.locator("h1")).toContainText("grow your business online");
    await expect(
      page.getByRole("link", { name: "Build my growth plan" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "See how it all works" }).first()).toBeVisible();
  });

  test("lists the five connected domains as real text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Connected across")).toBeVisible();
    for (const area of ["Website", "Marketing", "Customer Tools", "Automation", "Analytics"]) {
      // These strings legitimately recur further down the page, so assert the hero
      // renders each as real, visible text via the first match rather than requiring
      // global uniqueness.
      await expect(page.getByText(area, { exact: true }).first()).toBeVisible();
    }
  });

  test("shows the platform rail with neutral, non-partner framing", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Works with the tools your business already uses."),
    ).toBeVisible();
    // Never claims partnership or ownership of these tools.
    await expect(page.getByText(/official partner|our clients/i)).toHaveCount(0);
  });

  test("shows the bright editorial band after the hero", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /The digital world keeps getting bigger/i }),
    ).toBeVisible();
  });

  // Constellation rebrand: the homepage spine is the flagship narrative — hero → the digital
  // world today → start with your goal → the connected growth journey → one system not silos
  // → customer journey → services constellation → four ways we deliver → ownership → honest
  // expectations → resources → final CTA. This asserts the section spine renders in that order.
  test("renders the Constellation homepage spine in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll("section[id]")].map((s) => s.id),
    );
    const spine = [
      "goals", // router — start with your goal
      "growth-journey", // the 8-stage connected journey
      "how-it-connects", // one system, not silos
      "customer-journey", // the connected story, made concrete
      "services", // services constellation
      "ways-of-working", // four ways we deliver
      "ownership", // you own it
      "honest", // honest expectations
      "learn", // resources teaser
      "get-started", // final CTA
    ];
    expect(
      ids.filter((id) => spine.includes(id)),
      "homepage spine present and in order",
    ).toEqual(spine);
    // Inner-page-only anchors that must not leak onto the homepage.
    for (const gone of ["where-you-are", "examples", "why-us", "start", "tools", "how-we-deliver", "process", "faq"]) {
      expect(ids, `#${gone} should not be on the homepage`).not.toContain(gone);
    }
  });

  // Phase 3 regression guard: Phase 2 centred the goalExplorer and whyUs headers, creating
  // a left/left/centre/centre/left zigzag. The site holds a single left edge; only the
  // finalCtaBanner (the second and last gradient headline) is centred.
  test("one left edge — only the final CTA section is centred", async ({ page }) => {
    await page.goto("/");
    const aligns = await page.evaluate(() =>
      [...document.querySelectorAll("main section")]
        .map((s) => {
          const h = s.querySelector("h1, h2");
          return { id: s.id, align: h ? getComputedStyle(h).textAlign : "none" };
        })
        .filter((x) => x.align !== "none"),
    );
    const centred = aligns.filter((a) => a.align === "center").map((a) => a.id);
    expect(centred, `only #get-started may be centred; got [${centred.join(", ")}]`).toEqual([
      "get-started",
    ]);
  });

  // Two cream bands, not six: exactly the editorial (tension) and learn (rest) sections.
  test("exactly two cream bands render", async ({ page }) => {
    await page.goto("/");
    const bandCount = await page.evaluate(
      () => document.querySelectorAll("section.theme-band").length,
    );
    expect(bandCount, "exactly two theme-band sections").toBe(2);
  });

  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    });
  }

  test("no serious or critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      serious,
      JSON.stringify(
        serious.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        null,
        2,
      ),
    ).toEqual([]);
  });
});
