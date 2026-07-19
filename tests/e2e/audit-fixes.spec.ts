import { test, expect } from "@playwright/test";

/**
 * Regression guards for the rebrand audit-fix pass. Each test pins a fix that isn't already
 * covered by the axe/overflow sweeps: the keyboard focus ring on the gradient CTAs (which a
 * cascade collision was hiding), the mobile dialog's background-inert + focus trap, and the
 * visible "required fields" key on both forms.
 */

// The focus-ring token is `--ring: 0 0 0 3px rgba(168, 85, 247, 0.65)`. When the ring shows,
// its colour appears in the element's computed box-shadow.
const RING_RGB = /168,\s*85,\s*247/;

test.describe("keyboard focus ring survives on gradient CTAs", () => {
  // The box-shadow transitions in over ~250ms, so each test polls the computed value until it
  // settles to the ring rather than reading a mid-transition interpolation.
  test("home hero primary CTA shows the ring on focus (not just its resting glow)", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.locator('main a[href="/growth-plan"]').first();
    await cta.focus();
    // Poll so the box-shadow transition settles to its final value before matching.
    await expect
      .poll(() => cta.evaluate((el) => getComputedStyle(el).boxShadow))
      .toMatch(RING_RGB);
  });

  test("contact form submit (GlowButton) shows the ring on focus", async ({ page }) => {
    await page.goto("/contact");
    const submit = page.locator('button[type="submit"]').first();
    await submit.focus();
    await expect
      .poll(() => submit.evaluate((el) => getComputedStyle(el).boxShadow))
      .toMatch(RING_RGB);
  });
});

test.describe("mobile menu neutralises the page behind it", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opening the menu makes the background inert and traps focus; Escape restores it", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();

    const dialog = page.locator("#mobile-nav");
    await expect(dialog).toBeVisible();

    // Background landmarks are inert while the dialog is open.
    for (const sel of ["header", "main", "footer"]) {
      await expect
        .poll(() => page.evaluate((s) => document.querySelector(s)?.hasAttribute("inert"), sel))
        .toBe(true);
    }

    // Focus is trapped inside the dialog.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => document.getElementById("mobile-nav")?.contains(document.activeElement)),
    ).toBe(true);

    // Escape closes it and clears the inert flags.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.querySelector("header")?.hasAttribute("inert"))).toBe(
      false,
    );
  });
});

test.describe("forms declare the required-field convention in text", () => {
  // The contact form renders immediately, so its required-field key is in the initial DOM.
  // (The growth-plan email form carries the same key, but only after the builder is completed,
  // so it isn't asserted here.)
  test("/contact states that * marks required fields", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText(/marked .* are required/i).first()).toBeVisible();
  });
});
