import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setViewportAndWaitForStableLayout, expectNoHorizontalOverflow } from "./helpers/layout";

/**
 * Every service domain renders from the shared Constellation template. This sweeps all
 * sixteen category slugs and checks the load-bearing contract for each: one H1, the full
 * service list as anchored blocks (li[id] — the 301 target for old service URLs), no
 * horizontal overflow at the narrowest and widest breakpoints, and no serious/critical
 * accessibility violations. Detailed Strategy-specific assertions live in
 * services-strategy.spec.ts.
 */

const DOMAINS = [
  "strategy-discovery",
  "branding-design",
  "websites-development",
  "seo-content",
  "paid-ads",
  "social-media",
  "social-growth",
  "funnels-conversion",
  "courses-memberships",
  "email-sms-crm",
  "ecommerce-ops-delivery",
  "retention-loyalty-advocacy",
  "ai-automation",
  "analytics-data",
  "security-maintenance-compliance",
  "marketplaces-more",
];

for (const slug of DOMAINS) {
  test.describe(`service domain: ${slug}`, () => {
    test("renders the template with one H1 and anchored services, no overflow", async ({ page }) => {
      const res = await page.goto(`/services/${slug}`);
      expect(res?.status(), `/services/${slug} should not error`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      // The full service list is present as li[id=<slug>] anchors.
      expect(await page.locator("main li[id]").count()).toBeGreaterThan(0);
      // A domain-hued CTA into the growth-plan builder is present.
      await expect(page.locator('main a[href="/growth-plan"]').first()).toBeVisible();

      for (const width of [360, 1440]) {
        await setViewportAndWaitForStableLayout(page, width);
        await expectNoHorizontalOverflow(page, `${slug} @ ${width}px`);
      }
    });

    test("no serious or critical accessibility violations", async ({ page }) => {
      await page.goto(`/services/${slug}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, `${slug}: ${JSON.stringify(serious.map((v) => v.id))}`).toEqual([]);
    });
  });
}
