import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Desktop mega-menu", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("keyboard: Enter opens, Tab reaches a panel link, Esc closes and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    // Wait for hydration before keyboard interaction — key handlers attach on the
    // client, so pressing Enter before hydrate races an unhandled key event.
    await page.waitForLoadState("networkidle");
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
    await page.waitForLoadState("networkidle");
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

test.describe("Desktop mega-menu — hover / click / keyboard intents", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("hover opens the panel; clicking the trigger navigates to the hub", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "How It Works" });
    await trigger.hover();
    await expect(page.getByRole("group", { name: "How It Works" })).toBeVisible();
    await trigger.click();
    await expect(page).toHaveURL(/\/how-it-works$/);
  });

  test("clicking a panel link navigates, and the menu reopens on the next pointer move (regression)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: "Services" });
    const box = (await trigger.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Open by moving the cursor onto the trigger (a real journey, not .hover()).
    await page.mouse.move(cx, cy);
    const panel = page.locator("#mega-services");
    await expect(panel).toBeVisible();

    await panel.getByRole("link").first().click();
    // The menu closes on navigation…
    await expect(page.locator("#mega-services")).toBeHidden();

    // …and must reopen when the cursor returns to the trigger. Drive the mouse with
    // real coordinates — NEVER .hover() to re-establish a hover state after an
    // interaction; it teleports the cursor and manufactures a mouseenter.
    await page.mouse.move(cx, cy);
    await expect(page.locator("#mega-services")).toBeVisible();
  });

  // The reproduction the Phase 1 tests missed: the cursor clicks the trigger and
  // NEVER leaves it. A one-shot mouseenter cannot fire again without a boundary
  // crossing, so a menu whose open-state is driven by mouseenter stays dead.
  test("mega menu reopens when the cursor never leaves the trigger", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: /^Services$/ });
    const panel = page.locator("#mega-services");

    const box = (await trigger.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Open by hover
    await page.mouse.move(cx, cy);
    await expect(panel).toBeVisible();

    // Click the trigger — navigates to the hub
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL("**/services");

    // The route change closes the panel via useEffect([pathname]). Wait for that so
    // the reopen below is the real sequence (close, then move) and not racing it.
    await expect(panel).toBeHidden();

    // THE REAL SEQUENCE: the cursor does not leave. It twitches 1px.
    // Do NOT use .hover() here — it teleports the mouse and masks the bug.
    await page.mouse.move(cx + 1, cy);

    await expect(panel).toBeVisible(); // fails on main today (mouseenter can't refire)
  });

  test("keyboard: Enter toggles the panel open, then closed", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: "How It Works" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
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
