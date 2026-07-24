import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setViewportAndWaitForStableLayout, expectNoHorizontalOverflow } from "./helpers/layout";

/**
 * Strategy & Discovery — the first instance of the reusable V2 ServiceDomainTemplate. It must
 * show the FULL service list, grouped into clusters with delivery-model badges and #slug article
 * anchors (the 308 target for the old service URLs), name the growth stage it connects to, and
 * close with the next area in the journey. Accessibility and no-overflow are part of the sell.
 */

const PATH = "/services/strategy-discovery";
const SERVICES = [
  "discovery-requirements-workshop",
  "website-technical-audit",
  "seo-audit",
  "analytics-tracking-audit",
];

test.describe("service domain template — Strategy & Discovery", () => {
  test("renders one H1, a breadcrumb, and the full service list as anchored blocks", async ({
    page,
  }) => {
    const res = await page.goto(PATH);
    expect(res?.status(), `${PATH} should not error`).toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Strategy & Discovery");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    // Every service in the area is present as an article[id=<slug>] (the anchor old URLs 308 to).
    for (const slug of SERVICES) {
      await expect(page.locator(`main article#${slug}`)).toHaveCount(1);
      await expect(page.locator(`#${slug}`)).toContainText(/\w/);
    }
  });

  test("shows delivery-model badges (readable, not colour-only)", async ({ page }) => {
    await page.goto(PATH);
    // Discovery workshop is delivered via the specialist network; the audits are in-house.
    await expect(page.getByText("We Bring In an Expert").first()).toBeVisible();
    await expect(page.getByText("We Do the Work").first()).toBeVisible();
  });

  test("links to the next domain in the journey", async ({ page }) => {
    await page.goto(PATH);
    const next = page.locator('a[href="/services/websites-development"]').first();
    await expect(next).toBeVisible();
    await expect(next).toContainText("Websites & Development");
    // And back out to the full services index.
    await expect(page.locator('a[href="/services"]').first()).toBeVisible();
  });

  for (const width of [360, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.goto(PATH);
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `strategy-discovery @ ${width}px`);
    });
  }

  test("no serious or critical accessibility violations", async ({ page }) => {
    await page.goto(PATH);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});
