import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Content templates built on the Constellation kit: learn/blog (index + article), tools
 * (index + tool), case studies (index + case), and FAQ. These assert the load-bearing
 * contract for each — one H1, no horizontal overflow at the narrow and wide breakpoints, no
 * serious/critical axe violations — plus the structured data and the FAQ accordion behaviour.
 */

const PAGES: { path: string; label: string }[] = [
  { path: "/learn", label: "learn index" },
  { path: "/learn/how-online-growth-works-as-one-system", label: "article" },
  { path: "/tools", label: "tools index" },
  { path: "/tools/websites-hosting-performance", label: "tool" },
  { path: "/case-studies", label: "case-studies index" },
  { path: "/case-studies/ecommerce-turn-browsers-into-buyers", label: "case" },
  { path: "/faq", label: "faq" },
];

for (const { path, label } of PAGES) {
  test.describe(`content page: ${label} (${path})`, () => {
    test("loads with one H1, growth-plan CTA, no overflow", async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should not error`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('main a[href="/growth-plan"]').first()).toBeVisible();
      for (const width of [360, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `overflow at ${width}px on ${path}`).toBeLessThanOrEqual(1);
      }
    });

    test("no serious or critical accessibility violations", async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
    });
  });
}

test.describe("structured data", () => {
  const ldTypes = (page: import("@playwright/test").Page) =>
    page.$$eval('script[type="application/ld+json"]', (nodes) =>
      nodes.flatMap((n) => {
        try {
          const d = JSON.parse(n.textContent || "{}");
          return Array.isArray(d) ? d.map((x) => x["@type"]) : [d["@type"]];
        } catch {
          return [];
        }
      }),
    );

  test("article emits BlogPosting + BreadcrumbList", async ({ page }) => {
    await page.goto("/learn/how-online-growth-works-as-one-system");
    const types = await ldTypes(page);
    expect(types).toContain("BlogPosting");
    expect(types).toContain("BreadcrumbList");
  });

  test("faq emits FAQPage + BreadcrumbList", async ({ page }) => {
    await page.goto("/faq");
    const types = await ldTypes(page);
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");
  });

  test("case detail emits BreadcrumbList (and no proof-implying schema)", async ({ page }) => {
    await page.goto("/case-studies/ecommerce-turn-browsers-into-buyers");
    const types = await ldTypes(page);
    expect(types).toContain("BreadcrumbList");
    expect(types).not.toContain("Review");
  });
});

test.describe("faq accordion", () => {
  test("questions are keyboard-operable disclosures and search filters", async ({ page }) => {
    await page.goto("/faq");
    const firstTrigger = page.locator("button[aria-expanded]").first();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    await firstTrigger.focus();
    await page.keyboard.press("Enter");
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    // Searching narrows the visible questions.
    const before = await page.locator("button[aria-expanded]").count();
    await page.getByRole("searchbox", { name: /search questions/i }).fill("budget");
    const after = await page.locator("button[aria-expanded]").count();
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThan(0);
  });
});

test.describe("llms.txt + sitemap", () => {
  test("/llms.txt is served as plain text with company content", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body).toContain("Infinite Weblinks");
    expect(body).toContain("Service domains");
  });

  test("sitemap includes the new content routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("/case-studies");
    expect(xml).toContain("/learn/how-online-growth-works-as-one-system");
  });
});
