import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Desktop mega-menu", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("keyboard: Enter opens, Tab reaches a panel link, Esc closes and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "How It Works" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("group", { name: "How It Works" })).toBeVisible();

    await page.keyboard.press("Tab");
    const focusInPanel = await page.evaluate(() => {
      const panel = document.querySelector('[role="group"][aria-label="How It Works"]');
      return !!panel && panel.contains(document.activeElement);
    });
    expect(focusInPanel).toBe(true);

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("pointer: hover opens the panel", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Solutions" });
    await trigger.hover();
    await expect(page.getByRole("group", { name: "Solutions" })).toBeVisible();
  });

  test("no serious/critical a11y violations with a mega-menu open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "How It Works" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "How It Works" })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens full-screen, focuses close, Esc closes and restores focus", async ({ page }) => {
    await page.goto("/");
    const menuBtn = page.getByRole("button", { name: "Open menu" });
    await menuBtn.click();

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

    // Expand a family accordion.
    await page.getByRole("button", { name: "Services" }).click();
    await expect(page.getByRole("link", { name: "All Services", exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuBtn).toBeFocused();
  });
});
