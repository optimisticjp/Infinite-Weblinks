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

    // Travel to the link with steps — never teleport over the gap. Go DOWN through
    // the dead band into the panel first, then across to the left-column link: the
    // path a real cursor takes, and one that doesn't cut across the adjacent
    // Solutions trigger (which would switch menus — a separate, pre-existing issue).
    const link = panel.getByRole("link").first();
    const lb = (await link.boundingBox())!;
    await page.mouse.move(cx, lb.y + lb.height / 2, { steps: 25 });
    await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2, { steps: 25 });
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL(/\/services(#|$)/);
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
    await page.waitForURL(/\/services(#|$)/);

    // The route change closes the panel via useEffect([pathname]). Wait for that so
    // the reopen below is the real sequence (close, then move) and not racing it.
    await expect(panel).toBeHidden();

    // THE REAL SEQUENCE: the cursor does not leave. It twitches 1px.
    // Do NOT use .hover() here — it teleports the mouse and masks the bug.
    await page.mouse.move(cx + 1, cy);

    await expect(panel).toBeVisible(); // fails on main today (mouseenter can't refire)
  });

  test("panel survives the trip from trigger to a panel link", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: /^Services$/ });
    const panel = page.locator("#mega-services");

    const tb = (await trigger.boundingBox())!;
    const tcx = tb.x + tb.width / 2;
    await page.mouse.move(tcx, tb.y + tb.height / 2);
    await expect(panel).toBeVisible();

    const link = panel.getByRole("link").first();
    const lb = (await link.boundingBox())!;

    // Travel with steps so the pointer traverses the dead band between the nav and
    // the panel instead of teleporting over it. Go DOWN through the gap into the
    // panel, then across to the link — the real path to a left-column link, which
    // never cuts across an adjacent trigger. Without steps this passes on broken
    // code — that is exactly how this bug shipped.
    await page.mouse.move(tcx, lb.y + lb.height / 2, { steps: 25 });
    await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2, { steps: 25 });

    await page.waitForTimeout(250); // longer than the 140ms close timer
    await expect(panel).toBeVisible();

    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL(/\/services(#|$)/);
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

test.describe("Desktop mega-menu — link destinations & close-on-click", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // Open the trigger's panel and click a link inside it, reaching the link the way a
  // real cursor does — down into the panel then across — so it never teleports over
  // the gap or cuts across an adjacent trigger.
  async function openAndClickLink(
    page: import("@playwright/test").Page,
    trigger: string | RegExp,
    panelSelector: string,
    linkName: string,
  ) {
    const tb = (await page.getByRole("button", { name: trigger }).boundingBox())!;
    const tcx = tb.x + tb.width / 2;
    await page.mouse.move(tcx, tb.y + tb.height / 2);
    const panel = page.locator(panelSelector);
    await expect(panel).toBeVisible();
    const lb = (await panel.getByRole("link", { name: linkName }).boundingBox())!;
    await page.mouse.move(tcx, lb.y + lb.height / 2, { steps: 20 });
    await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2, { steps: 20 });
    await page.mouse.down();
    await page.mouse.up();
  }

  test("two different Services links land on different URLs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openAndClickLink(page, /^Services$/, "#mega-services", "Websites & Development");
    await page.waitForURL(/\/services(#|$)/);
    const url1 = page.url();

    await openAndClickLink(page, /^Services$/, "#mega-services", "SEO & Content");
    await page.waitForURL(/#seo-content$/);
    const url2 = page.url();

    expect(url1, `both links resolved to ${url1}`).not.toBe(url2);
  });

  test("clicking a Services link closes the panel — hash-only nav on the same page", async ({
    page,
  }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");

    await openAndClickLink(page, /^Services$/, "#mega-services", "SEO & Content");
    await expect(page).toHaveURL(/#seo-content$/);
    // Hash-only nav never fires useEffect([pathname]); the panel must still close.
    await expect(page.locator("#mega-services")).toBeHidden();
  });

  test("clicking a link to the current page closes the panel — no URL change", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("networkidle");

    // "The 8-stage journey" → /how-it-works, the page we're already on: no pathname
    // change, no URL change at all. The panel must still close.
    await openAndClickLink(page, "How It Works", "#mega-how-it-works", "The 8-stage journey");
    await expect(page.locator("#mega-how-it-works")).toBeHidden();
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
