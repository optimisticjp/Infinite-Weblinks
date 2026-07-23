import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import { businessTypes } from "../../src/lib/content/data/business-types";
import {
  growthPlanHeroTrustPoints,
  growthPlanIncludes,
} from "../../src/lib/content/data/growth-plan";

/**
 * /growth-plan — the V2 Growth Plan Builder. The multi-step flow, per-step validation, the
 * client-side plan (no email required), the truthful REVIEW-REQUEST follow-up form, responsive /
 * zoom / no-JS behaviour and accessibility.
 *
 * The e2e server runs with NO Formspree id, so a real valid follow-up submission must surface the
 * truthful "delivery-unavailable" notice — never a fake "your plan was emailed" success. The
 * delivered / generic-failure / rate-limit / turnstile-failed branches are exercised by MOCKING the
 * API response (page.route), so no external Formspree/Cloudflare call is ever made. The plan itself
 * is generated on-screen with no account and no email at all.
 */

const SUPPORT_EMAIL = "support@infiniteweblinks.com";
const SECTION_FRAGMENTS = ["growth-plan-hero", "builder", "what-your-plan-includes", "get-started"];
const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

/** Same public-status gate the content getter applies, so the expected options match what renders. */
const renderable = <T extends { status: string }>(x: T) => x.status === "verified" || x.status === "readyToPublish";

// The server's human-timing check silently accepts (ok:true) submissions faster than 1.5s. The
// four-step flow already takes longer, but we wait past it before the REAL delivery path to be safe.
const HUMAN_DELAY = 1700;

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
  await expect(page.getByTestId("growth-plan-result")).toBeVisible();
}

/** Reach the plan, then fill the required follow-up review-request fields. */
async function fillReviewRequest(page: Page) {
  await fillToPlan(page);
  await page.getByLabel("Your name").fill("Jordan Rivers");
  await page.getByLabel("Email").fill("jordan@example.com");
}

const axeSerious = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test.describe("growth plan — structure & metadata", () => {
  test("renders one H1, the breadcrumb, the truthful lead and the first question", async ({ page }) => {
    const res = await page.goto("/growth-plan");
    expect(res?.status(), "/growth-plan should not error").toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("growth plan");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    const main = page.getByRole("main");
    await expect(main).toContainText("No account needed");
    for (const t of growthPlanHeroTrustPoints) await expect(main, t).toContainText(t);

    await expect(
      page.getByRole("heading", { name: "What best describes your business?" }),
    ).toBeVisible();
  });

  test("shows the what-your-plan-includes section verbatim and the final CTA", async ({ page }) => {
    await page.goto("/growth-plan");
    const main = page.getByRole("main");
    await expect(page.getByRole("heading", { name: "What your plan can include" })).toBeVisible();
    for (const item of growthPlanIncludes) {
      await expect(main, item.title).toContainText(item.title);
      await expect(main, item.body).toContainText(item.body);
    }
    await expect(page.getByRole("heading", { name: "Ready to find your first step?" })).toBeVisible();
    // The final CTA offers the builder anchor and the contact fallback.
    expect(await page.locator('[id="get-started"] a[href="#builder"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[id="get-started"] a[href="/contact"]').count()).toBeGreaterThan(0);
  });

  test("every section fragment resolves exactly once, no canvas, no scrolling rail", async ({ page }) => {
    await page.goto("/growth-plan");
    for (const id of SECTION_FRAGMENTS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id}`).toBe(1);
    }
    expect(await page.locator("canvas").count(), "no canvas").toBe(0);
    const railed = await page.locator("main ul, main nav, main ol").evaluateAll((els) =>
      els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX)).length,
    );
    expect(railed, "no horizontally-scrolling rail").toBe(0);
  });

  test("keeps noindex, follow on the tool", async ({ page }) => {
    await page.goto("/growth-plan");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /follow/);
  });

  test("no serious or critical accessibility violations (first step)", async ({ page }) => {
    await page.goto("/growth-plan");
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id))).toBe("[]");
  });
});

test.describe("growth plan — the flow", () => {
  test("blocks continuing until a required choice is made, with a specific inline error", async ({ page }) => {
    await page.goto("/growth-plan");
    await pick(page, "businessType", 0);
    await expect(page.locator(`label:has(input[name="businessType"])`).first()).toHaveClass(/checked/);
    await page.getByRole("button", { name: "Continue to my goal" }).click();

    // On the goal step, continue with no goal selected → inline, specific error, no advance.
    await page.getByRole("button", { name: "Continue to my setup" }).click();
    await expect(page.getByText("Please choose your main goal.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What's your main goal right now?" })).toBeVisible();
  });

  test("generates the on-screen plan with no email required, and never fakes a sent state", async ({ page }) => {
    await fillToPlan(page);
    const plan = page.getByTestId("growth-plan-result");
    await expect(plan).toContainText("Start here");
    await expect(plan).toContainText("How we'd help");
    // Truthful framing + tools disclaimer; never the old "same growth journey" phrasing.
    await expect(plan).toContainText(/reviewed framework/i);
    await expect(plan).toContainText("Example tools are illustrative. No partnership or endorsement is implied.");
    await expect(page.getByText(/your plan is on its way/i)).toHaveCount(0);
    await expect(page.getByText(/we've sent this plan to your email/i)).toHaveCount(0);
    // The optional REVIEW-REQUEST form is offered, honestly framed.
    await expect(page.getByRole("heading", { name: "Ask us to review this plan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send my plan for review" })).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("Start again resets the builder back to the first step", async ({ page }) => {
    await fillToPlan(page);
    await page.getByRole("button", { name: "Start again" }).click();
    await expect(page.getByTestId("growth-plan-result")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "What best describes your business?" })).toBeVisible();
  });

  test("no serious or critical accessibility violations (last step)", async ({ page }) => {
    await page.goto("/growth-plan");
    await pick(page, "businessType", 0);
    await expect(page.locator(`label:has(input[name="businessType"])`).first()).toHaveClass(/checked/);
    await page.getByRole("button", { name: "Continue to my goal" }).click();
    await pick(page, "mainGoal", 0);
    await page.getByRole("button", { name: "Continue to my setup" }).click();
    await pick(page, "existingSetup", 0);
    await page.getByRole("button", { name: "Continue to the last step" }).click();
    await expect(page.getByRole("heading", { name: "How would you like to work together?" })).toBeVisible();
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id))).toBe("[]");
  });

  test("no serious or critical accessibility violations (generated plan)", async ({ page }) => {
    await fillToPlan(page);
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id))).toBe("[]");
  });
});

test.describe("growth plan — the review-request follow-up", () => {
  test("a valid submission never fakes success when delivery is unconfigured", async ({ page }) => {
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY); // clear the server anti-bot timing gate
    await page.getByRole("button", { name: "Send my plan for review" }).click();
    await expect(page.getByText(/your plan was sent to our team/i)).toHaveCount(0);
    const notice = page.locator('[role="alert"], [role="status"]').first();
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(new RegExp(SUPPORT_EMAIL.replace(".", "\\.")));
    // The plan itself stays on screen throughout.
    await expect(page.getByTestId("growth-plan-result")).toBeVisible();
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), "delivery-unavailable a11y").toBe("[]");
  });

  test("a mocked delivered response shows the truthful review-sent panel", async ({ page }) => {
    await page.route("**/api/forms/growth-plan", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.getByRole("button", { name: "Send my plan for review" }).click();
    const status = page.locator('[role="status"]');
    await expect(status).toBeVisible();
    await expect(status).toContainText("Thanks, your plan was sent to our team.");
    await expect(status).toContainText("A real person will review it");
    // Truthful: it never claims the plan itself was emailed to the visitor.
    await expect(page.getByText(/your plan is on its way/i)).toHaveCount(0);
    await expect(page.getByText(/we've sent this plan to your email/i)).toHaveCount(0);
    expect(JSON.stringify((await axeSerious(page)).map((v) => v.id)), "success a11y").toBe("[]");
  });

  test("a mocked generic failure shows a truthful alert, not success", async ({ page }) => {
    await page.route("**/api/forms/growth-plan", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ ok: false, code: "error", message: "Something went wrong. Please try again, or email us directly." }) }),
    );
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.getByRole("button", { name: "Send my plan for review" }).click();
    await expect(page.getByText(/your plan was sent to our team/i)).toHaveCount(0);
    await expect(page.locator('[role="alert"]').first()).toContainText(/something went wrong/i);
  });

  test("a mocked rate-limit response stays truthful", async ({ page }) => {
    await page.route("**/api/forms/growth-plan", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, code: "rate-limited", message: "Please wait a moment before trying again." }) }),
    );
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.getByRole("button", { name: "Send my plan for review" }).click();
    await expect(page.locator('[role="alert"]').first()).toContainText(/wait a moment/i);
  });

  test("a mocked turnstile-failed response stays truthful", async ({ page }) => {
    await page.route("**/api/forms/growth-plan", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ ok: false, code: "turnstile-failed", message: "We couldn't verify you're human. Please try again." }) }),
    );
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.getByRole("button", { name: "Send my plan for review" }).click();
    await expect(page.locator('[role="alert"]').first()).toContainText(/verify you're human/i);
  });

  test("the submit button disables while submitting", async ({ page }) => {
    await page.route("**/api/forms/growth-plan", async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await fillReviewRequest(page);
    await page.waitForTimeout(HUMAN_DELAY);
    // Locate by the stable submit selector: the Button's accessible name changes to "Sending…"
    // (its loading contract) once clicked, so a name locator would no longer resolve.
    const submit = page.locator('button[type="submit"]');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(page.locator('[role="status"]')).toContainText("Thanks, your plan was sent to our team.");
  });
});

test.describe("growth plan — without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the hero, first question + options, plan-includes and final CTA all render from the server", async ({ page }) => {
    await page.goto("/growth-plan");
    const main = page.getByRole("main");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("growth plan");
    await expect(main).toContainText("No account needed");
    await expect(page.getByRole("heading", { name: "What best describes your business?" })).toBeVisible();

    // The first-step options render server-side — exact values + order — from the real dataset.
    const values = await page
      .locator('input[name="businessType"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
    expect(values).toEqual(businessTypes.filter(renderable).map((b) => b.slug));

    // The what-your-plan-includes content and the final CTA + contact fallback.
    for (const item of growthPlanIncludes) {
      await expect(main, item.title).toContainText(item.title);
      await expect(main, item.body).toContainText(item.body);
    }
    await expect(page.getByRole("heading", { name: "Ready to find your first step?" })).toBeVisible();
    expect(await page.locator('[id="get-started"] a[href="/contact"]').count()).toBeGreaterThan(0);

    for (const id of SECTION_FRAGMENTS) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
    }
  });
});

test.describe("growth plan — fragment clearance", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("the builder fragment clears the sticky header", async ({ page }) => {
    await page.goto("about:blank");
    await page.goto("/growth-plan#builder");
    await expectFragmentTargetClearsStickyHeader(page, '[id="builder"]', "growth-plan #builder");
  });
});

test.describe("growth plan — responsive & zoom", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.goto("/growth-plan");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `growth-plan @ ${width}px`);
    });
  }

  test("the generated plan holds its width across mobile and desktop", async ({ page }) => {
    await fillToPlan(page);
    for (const width of [360, 390, 768, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `growth-plan result @ ${width}px`);
    }
  });

  test("renders with one H1 and no overflow under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/growth-plan");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `growth-plan reduced-motion @ ${width}px`);
    }
  });

  test("holds its width with the root text scaled to 200%", async ({ page }) => {
    await page.goto("/growth-plan");
    await page.addStyleTag({ content: ":root{font-size:200%!important;}" });
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `growth-plan @200% text @ ${width}px`);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
