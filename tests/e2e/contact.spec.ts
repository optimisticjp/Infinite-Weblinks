import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Contact page — structure, accessibility, and the contact-form flow. The e2e server runs
 * with no Formspree id configured, so a *valid* submission must surface the
 * "delivery-unavailable" notice (and the visible support-email fallback) rather than a
 * fake success — the load-bearing "never claim a send that didn't happen" guarantee.
 */

// The form's server-side human-timing check silently accepts (ok:true) submissions faster
// than 1.5s to waste a bot's time. A real person is always slower; tests must wait past it
// to exercise the genuine delivery path rather than the anti-bot short-circuit.
const HUMAN_DELAY = 1700;

/**
 * Navigate and wait for React hydration before interacting. Clicking submit before the
 * client handlers attach would trigger a native form submit (a page reload) instead of the
 * fetch flow. The character counter is state-driven, so its update is a reliable
 * hydration signal.
 */
async function gotoHydrated(page: import("@playwright/test").Page, url = "/contact") {
  await page.goto(url);
  const message = page.getByLabel("Your message");
  await message.fill("x");
  await expect(page.getByText("1 / 1000")).toBeVisible();
  await message.fill("");
}

test.describe("contact page", () => {
  test("renders one H1, a breadcrumb, and the labelled form", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status(), "/contact should not error").toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    // Required + optional fields are all present and labelled.
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Business name")).toBeVisible();
    await expect(page.getByLabel("Website")).toBeVisible();
    await expect(page.getByLabel("Business type")).toBeVisible();
    await expect(page.getByLabel("Where you are now")).toBeVisible();
    await expect(page.getByLabel("Your main goal")).toBeVisible();
    await expect(page.getByLabel("Your message")).toBeVisible();

    // The support-email fallback is always visible (never hidden behind a failure state).
    await expect(
      page.locator('a[href="mailto:support@infiniteweblinks.com"]').first(),
    ).toBeVisible();
  });

  test("useful input types and autocomplete are wired up", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(page.getByLabel("Your name")).toHaveAttribute("autocomplete", "name");
    await expect(page.getByLabel("Business name")).toHaveAttribute("autocomplete", "organization");
    await expect(page.getByLabel("Website")).toHaveAttribute("type", "url");
  });

  test("an empty submission surfaces an accessible error summary and moves focus to it", async ({
    page,
  }) => {
    await gotoHydrated(page);
    await page.locator("#contact-form button[type=submit]").click();

    const alert = page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/fix the following/i);
    // Focus is moved to the summary so a screen-reader / keyboard user lands on it.
    await expect(alert).toBeFocused();
    // The invalid field is marked for assistive tech.
    await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
  });

  test("a valid submission never fakes success when delivery is unconfigured", async ({ page }) => {
    await gotoHydrated(page);
    await page.getByLabel("Your name").fill("Jordan Rivers");
    await page.getByLabel("Email").fill("jordan@example.com");
    await page
      .getByLabel("Your message")
      .fill("We'd like help joining up our website and email tools — not sure where to start.");

    await page.waitForTimeout(HUMAN_DELAY); // clear the anti-bot timing gate
    await page.locator("#contact-form button[type=submit]").click();

    // Must NOT claim the message was sent.
    await expect(page.getByText("your message is on its way")).toHaveCount(0);
    // Must surface a truthful notice pointing at the visible email fallback.
    const notice = page.locator('[role="alert"], [role="status"]').first();
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/support@infiniteweblinks\.com/);
  });

  test("prefills the main goal from a ?goal= deep link", async ({ page }) => {
    await page.goto("/contact?goal=get-found-on-google");
    await expect(page.getByLabel("Your main goal")).toHaveValue("get-found-on-google");
  });

  test("no serious or critical accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});
