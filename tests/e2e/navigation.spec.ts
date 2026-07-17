import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* ------------------------------------------------------------------ helpers
 * The path a person takes. A real cursor travels a straight line from a trigger
 * to a link and crosses whatever sits between — it does NOT go "down then across"
 * to dodge the neighbouring triggers. Every earlier nav fix shipped past a green
 * suite because the test routed around the live bug; these do not.
 */

type Box = { x: number; y: number; width: number; height: number };
type Pt = { x: number; y: number };
const center = (b: Box) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
const panelSel = (trigger: string) => `#mega-${trigger.replace(/\s+/g, "-").toLowerCase()}`;

/**
 * A straight diagonal at roughly hand speed, firing pointermove densely along the way.
 * Density matters: the trigger buttons are only ~40px tall, so the window where a
 * descending diagonal is still over a neighbour button is narrow — a sparse move can
 * step clean over it and miss the very swap we're trying to catch. ~2.5px/step samples
 * it the way a real, continuously-moving cursor would.
 */
async function handMove(page: Page, from: Pt, to: Pt) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(30, Math.round(dist / 2.5));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await page.mouse.move(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    await page.waitForTimeout(3);
  }
}

/** How many sample points of the straight segment a→b fall inside a neighbour button? */
function crossCount(a: Pt, b: Pt, rects: Box[]) {
  let n = 0;
  for (let i = 0; i <= 300; i++) {
    const t = i / 300;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (rects.some((r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height)) n++;
  }
  return n;
}

const MEGA_TRIGGERS = ["How It Works", "Services", "Resources"];

/**
 * Open `trigger`, then travel a straight diagonal to the panel link whose straight path
 * from the trigger crosses a NEIGHBOURING trigger button the most (chosen at runtime so
 * this adapts to whatever the menu contains). Guards that such a link exists — a
 * full-width panel means not every link qualifies, and if none do the layout changed and
 * we must know, not pass silently. Leaves the pointer on the link; returns its href.
 */
async function diagonalAcrossNeighbour(page: Page, trigger: string) {
  const neighbours: Box[] = [];
  for (const n of MEGA_TRIGGERS.filter((t) => t !== trigger)) {
    neighbours.push((await page.getByRole("button", { name: n, exact: true }).boundingBox())!);
  }
  const from = center((await page.getByRole("button", { name: trigger, exact: true }).boundingBox())!);
  await page.mouse.move(from.x, from.y);
  const panel = page.locator(panelSel(trigger));
  await expect(panel).toBeVisible();

  let best: { to: Pt; href: string } | null = null;
  let bestCount = 0;
  for (const link of await panel.getByRole("link").all()) {
    const lb = await link.boundingBox();
    if (!lb) continue;
    const to = center(lb);
    const c = crossCount(from, to, neighbours);
    if (c > bestCount) {
      bestCount = c;
      best = { to, href: (await link.getAttribute("href"))! };
    }
  }
  expect(
    bestCount,
    `No link in "${trigger}" whose straight diagonal from the trigger crosses a neighbouring trigger — layout changed; this test is no longer exercising Defect 3.`,
  ).toBeGreaterThan(0);

  await handMove(page, from, best!.to);
  return best!.href;
}

test.describe("Desktop mega-menu — keyboard & a11y", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("keyboard: Enter opens, Tab reaches a panel link, Esc closes and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
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

  test("no serious/critical a11y violations with a mega-menu open", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "How It Works" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "How It Works" })).toBeVisible();
    // Scan the SETTLED panel. The mega panel reveals with a `megaIn` opacity keyframe
    // (~240ms); while it is running, axe can sample the panel's muted heading mid-fade and
    // report a transient sub-4.5:1 contrast that does not exist in the resting state (which
    // is what WCAG 1.4.3 governs). Wait for the open animation to finish before analysing.
    await page
      .locator("#mega-how-it-works")
      .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("Desktop mega-menu — pointer open / navigate / reopen", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("moving onto a trigger opens its panel", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const t = center((await page.getByRole("button", { name: "Resources" }).boundingBox())!);
    await page.mouse.move(t.x, t.y);
    await expect(page.getByRole("group", { name: "Resources" })).toBeVisible();
  });

  test("moving onto a trigger opens it; clicking the trigger navigates to the hub", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const t = center((await page.getByRole("button", { name: "How It Works" }).boundingBox())!);
    await page.mouse.move(t.x, t.y);
    await expect(page.getByRole("group", { name: "How It Works" })).toBeVisible();
    await page.mouse.down();
    await page.mouse.up();
    await expect(page).toHaveURL(/\/how-it-works$/);
  });

  // The cursor clicks the trigger and NEVER leaves it. A one-shot mouseenter can't
  // refire without a boundary crossing; the panel must still reopen on a 1px twitch.
  test("mega menu reopens when the cursor never leaves the trigger", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const panel = page.locator("#mega-services");
    const c = center((await page.getByRole("button", { name: /^Services$/ }).boundingBox())!);

    await page.mouse.move(c.x, c.y);
    await expect(panel).toBeVisible();
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL(/\/services(#|$)/);
    await expect(panel).toBeHidden();

    await page.mouse.move(c.x + 1, c.y); // a twitch, not a .hover() teleport
    await expect(panel).toBeVisible();
  });
});

test.describe("Desktop mega-menu — diagonal reach across neighbours (Defect 3)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // A straight diagonal from a trigger to a link in a far column passes over the
  // neighbouring trigger(s) in between. At 1280 the two reaches that genuinely cross
  // (verified by the in-test geometry guard) are Services→left and Resources→left.
  // The menu must survive the crossing, the click must land on the thing it names,
  // and the panel must close behind it. On main the crossing swaps the menu mid-reach.

  test("Services: a diagonal that crosses a neighbour still reaches its link", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const href = await diagonalAcrossNeighbour(page, "Services");
    await expect(page.locator("#mega-services")).toBeVisible(); // did NOT swap mid-reach
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL((url) => url.pathname + url.hash === href);
    await expect(page.locator("#mega-services")).toBeHidden(); // and closed behind the click
  });

  test("Resources: a diagonal that crosses a neighbour still reaches its link", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const href = await diagonalAcrossNeighbour(page, "Resources");
    await expect(page.locator("#mega-resources")).toBeVisible();
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL((url) => url.pathname + url.hash === href);
    await expect(page.locator("#mega-resources")).toBeHidden();
  });
});

test.describe("Desktop mega-menu — promo column only when there's a promo (Defect 4)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("a promo-less panel does not reserve the 300px promo column", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Services has no promo. Its inner grid must be a single track — not two with a
    // 300px column reserved for a card that isn't there (which squeezes the links).
    const t = center((await page.getByRole("button", { name: "Services", exact: true }).boundingBox())!);
    await page.mouse.move(t.x, t.y);
    await expect(page.locator("#mega-services")).toBeVisible();
    const cols = await page
      .locator("#mega-services > div")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.trim().split(/\s+/).length, `Services inner grid tracks: "${cols}"`).toBe(1);

    // How It Works DOES have a promo, so it keeps the two-track layout.
    await page.keyboard.press("Escape");
    const h = center((await page.getByRole("button", { name: "How It Works", exact: true }).boundingBox())!);
    await page.mouse.move(h.x, h.y);
    await expect(page.locator("#mega-how-it-works")).toBeVisible();
    const cols2 = await page
      .locator("#mega-how-it-works > div")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols2.trim().split(/\s+/).length, `How It Works inner grid tracks: "${cols2}"`).toBe(2);
  });
});

test.describe("Desktop mega-menu — close on click, incl. no URL change (Defect 2)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // Keyboard-activated so no pointer travel can confound this with Defect 3. On main
  // the panel closes only on a `pathname` change, so both of these leave it open.

  test("closes on a link to the URL you're already on (no change at all)", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: "How It Works" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator("#mega-how-it-works");
    await expect(panel).toBeVisible();
    // First panel link is "The 8-stage journey" → /how-it-works: the page we're on.
    await page.keyboard.press("Tab");
    await expect(page.locator("a:focus")).toHaveAttribute("href", "/how-it-works");
    await page.keyboard.press("Enter");
    await expect(panel).toBeHidden();
  });

  test("closes on a hash-only link to the current page", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: "How It Works" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator("#mega-how-it-works");
    await expect(panel).toBeVisible();
    // Second panel link is the first stage → /how-it-works#… : a hash-only change.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator("a:focus")).toHaveAttribute("href", /\/how-it-works#/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/how-it-works#/);
    await expect(panel).toBeHidden();
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
    await page.getByRole("button", { name: "Services", exact: true }).click();
    await expect(page.getByRole("link", { name: "All Services", exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuBtn).toBeFocused();
  });
});
