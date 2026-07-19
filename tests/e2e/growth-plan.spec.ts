import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Growth Plan Builder — the multi-step flow, per-step validation, client-side plan
 * generation (no email required), the optional email form, and accessibility. The e2e
 * server runs with no Formspree id, so a valid email submission must surface the truthful
 * "delivery-unavailable" path, never a fake success — but the on-screen plan is the main
 * deliverable and must render without any email at all.
 */

/** Click the option card for a radio group (by index). */
async function pick(page: Page, name: string, index = 0) {
  await page.locator(`label:has(input[name="${name}"])`).nth(index).click();
}

/** Advance through the four steps to the generated plan. Proves hydration on the first pick. */
async function fillToPlan(page: Page) {
  await page.goto("/growth-plan");
  await pick(page, "businessType", 0);
  // The checked-state class is applied by React state, so it only appears after hydration.
  await expect(page.locator(`label:has(input[name="businessType"])`).first()).toHaveClass(/checked/);
  await page.getByRole("button", { name: "Continue to my goal" }).click();

  await pick(page, "mainGoal", 0);
  await page.getByRole("button", { name: "Continue to my setup" }).click();

  await pick(page, "existingSetup", 0);
  await page.getByRole("button", { name: "Continue to the last step" }).click();

  await pick(page, "engagement", 0);
  await pick(page, "timeline", 0);
  await page.getByRole("button", { name: "See my plan" }).click();
}

test.describe("growth plan builder", () => {
  test("renders one H1 and the first question", async ({ page }) => {
    const res = await page.goto("/growth-plan");
    expect(res?.status(), "/growth-plan should not error").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("growth plan");
    await expect(
      page.getByRole("heading", { name: "What best describes your business?" }),
    ).toBeVisible();
  });

  test("blocks continuing until a required choice is made", async ({ page }) => {
    await page.goto("/growth-plan");
    // Prove hydration, then clear intent by continuing with nothing chosen.
    await pick(page, "businessType", 0);
    await expect(page.locator(`label:has(input[name="businessType"])`).first()).toHaveClass(/checked/);
    await page.getByRole("button", { name: "Continue to my goal" }).click();

    // On the goal step, continue with no goal selected → inline, specific error, no advance.
    await page.getByRole("button", { name: "Continue to my setup" }).click();
    await expect(page.getByText("Please choose your main goal.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What's your main goal right now?" })).toBeVisible();
  });

  test("generates the on-screen plan with no email required", async ({ page }) => {
    await fillToPlan(page);
    const plan = page.getByTestId("growth-plan-result");
    await expect(plan).toBeVisible();
    await expect(plan).toContainText("Start here");
    await expect(plan).toContainText("How we'd help");
    // The plan is shown without submitting anything, and does not fake a sent state.
    await expect(page.getByText("your plan is on its way")).toHaveCount(0);
    // The optional email form is offered.
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("a valid email submission never fakes success when delivery is unconfigured", async ({
    page,
  }) => {
    await fillToPlan(page);
    await page.getByLabel("Your name").fill("Jordan Rivers");
    await page.getByLabel("Email").fill("jordan@example.com");
    await page.waitForTimeout(1700); // clear the server anti-bot timing gate
    await page.getByRole("button", { name: "Send my plan by email" }).click();
    await expect(page.getByText("your plan is on its way")).toHaveCount(0);
    const notice = page.locator('[role="alert"], [role="status"]').first();
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/support@infiniteweblinks\.com/);
  });

  test("no serious or critical accessibility violations (first step)", async ({ page }) => {
    await page.goto("/growth-plan");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });

  test("no serious or critical accessibility violations (generated plan)", async ({ page }) => {
    await fillToPlan(page);
    await expect(page.getByTestId("growth-plan-result")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});
