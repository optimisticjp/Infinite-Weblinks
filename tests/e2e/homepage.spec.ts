import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage opening", () => {
  test("renders the hero headline and both primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Infinite Weblinks/);
    await expect(page.locator("h1")).toContainText("grow your business online");
    await expect(
      page.getByRole("link", { name: "Build My Digital Growth Plan" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "See How It All Works" }).first()).toBeVisible();
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

  // Redesign guard: the homepage was recomposed to the reference master layout (a richer
  // spine than the Phase-2 lean one — the connected journey, customer journey, starting
  // points, examples, ways-of-working and ownership are now on the homepage by design).
  // The spine still renders in the approved order, and the sections that genuinely belong
  // on inner pages (tool universe, process steps, delivery deep-anchors, FAQ) don't appear.
  test("renders the homepage section spine in order, with inner-page-only sections absent", async ({
    page,
  }) => {
    await page.goto("/");
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll("section[id]")].map((s) => s.id),
    );
    const spine = [
      "goals",
      "growth-journey",
      "how-it-connects",
      "customer-journey",
      "where-you-are",
      "services",
      "examples",
      "ways-of-working",
      "ownership",
      "why-us",
      "learn",
      "get-started",
    ];
    expect(
      ids.filter((id) => spine.includes(id)),
      "homepage spine present and in order",
    ).toEqual(spine);
    // Still relocated to inner pages: the old startingPointSelector anchor ("start"),
    // the tool universe, delivery deep-anchors ("how-we-deliver"), process steps and FAQ.
    for (const gone of ["start", "tools", "how-we-deliver", "process", "faq"]) {
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
