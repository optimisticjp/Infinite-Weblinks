import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  setViewportAndWaitForStableLayout,
  expectNoHorizontalOverflow,
  expectFragmentTargetClearsStickyHeader,
} from "./helpers/layout";
import {
  contactTrustPoints,
  contactProcessSteps,
  contactAlternativePaths,
} from "../../src/lib/content/data/contact";
import { businessTypes } from "../../src/lib/content/data/business-types";
import { stages } from "../../src/lib/content/data/stages";
import { goals } from "../../src/lib/content/data/goals";

/** Same public-status gate the content getters apply, so the expected options match what renders. */
const renderable = <T extends { status: string }>(x: T) => x.status === "verified" || x.status === "readyToPublish";

/**
 * /contact — the V2 contact experience. Structure, responsive/zoom/no-JS behaviour, accessibility,
 * and the full client form flow. The e2e server runs with NO Formspree id, so a real valid submission
 * must surface the truthful "delivery-unavailable" notice (never a fake success). The success /
 * generic-failure / rate-limit / turnstile-failed branches are exercised by MOCKING the API response
 * (page.route), so no external Formspree/Cloudflare call is ever made.
 */

const SUPPORT_EMAIL = "support@infiniteweblinks.com";
const SECTION_FRAGMENTS = ["contact-hero", "what-happens-next", "other-ways", "get-started"];
const MID_FRAGMENTS = ["contact-form", "what-happens-next", "other-ways", "get-started"];
const WIDTHS = [320, 360, 390, 768, 1024, 1160, 1280, 1440];

// The server's human-timing check silently accepts (ok:true) submissions faster than 1.5s. A real
// person is always slower; tests must wait past it to exercise the genuine delivery path. This is a
// behavioural requirement, not a layout-stabilisation sleep.
const HUMAN_DELAY = 1700;

/** Navigate and wait for React hydration before interacting (the character counter is state-driven,
 *  so its update is a reliable hydration signal). */
async function gotoHydrated(page: Page, url = "/contact") {
  await page.goto(url);
  const message = page.getByLabel("Your message");
  await message.fill("x");
  await expect(page.getByText("1 / 1000")).toBeVisible();
  await message.fill("");
}

async function fillValid(page: Page) {
  await page.getByLabel("Your name").fill("Jordan Rivers");
  await page.getByLabel("Email").fill("jordan@example.com");
  await page
    .getByLabel("Your message")
    .fill("We'd like help joining up our website and email tools — not sure where to start.");
}

test.describe("contact page — structure & accessibility", () => {
  test("one H1, breadcrumb, all fields labelled, mailto visible, no canvas, no rail, logical headings", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status(), "/contact should not error").toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Let's plan your next connected step.");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    for (const label of ["Your name", "Email", "Business name", "Website", "Business type", "Where you are now", "Your main goal", "Your message"]) {
      await expect(page.getByLabel(label), label).toBeVisible();
    }
    await expect(page.locator(`a[href="mailto:${SUPPORT_EMAIL}"]`).first()).toBeVisible();

    expect(await page.locator("canvas").count(), "no canvas").toBe(0);
    const railed = await page.locator("main ul, main nav").evaluateAll((els) =>
      els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX)).length,
    );
    expect(railed, "no horizontally-scrolling rail").toBe(0);

    const levels = await page.locator("main :is(h1,h2,h3,h4,h5,h6)").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `no jump before ${levels[i]}`).toBeLessThanOrEqual(1);
  });

  test("useful input types and autocomplete are wired up", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(page.getByLabel("Your name")).toHaveAttribute("autocomplete", "name");
    await expect(page.getByLabel("Business name")).toHaveAttribute("autocomplete", "organization");
    await expect(page.getByLabel("Website")).toHaveAttribute("type", "url");
  });

  test("all four section fragments plus #contact-form resolve exactly once", async ({ page }) => {
    await page.goto("/contact");
    for (const id of [...SECTION_FRAGMENTS, "contact-form"]) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id}`).toBe(1);
    }
  });

  test("the submit button and inputs meet the 44px target and show a visible focus ring", async ({ page }) => {
    await gotoHydrated(page);
    const submit = page.locator("#contact-form button[type=submit]");
    const box = await submit.boundingBox();
    expect(box!.height, "submit >= 44px").toBeGreaterThanOrEqual(44);
    await page.getByLabel("Your name").focus();
    const ring = await page.getByLabel("Your name").evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.outlineStyle !== "none" || cs.boxShadow !== "none";
    });
    expect(ring, "visible focus ring on the field").toBe(true);
  });

  test("no serious or critical accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
});

test.describe("contact page — mobile layout", () => {
  test.use({ viewport: { width: 390, height: 900 } });
  test("the form leads on mobile, is not sticky, and the page has no overflow", async ({ page }) => {
    await page.goto("/contact");
    await setViewportAndWaitForStableLayout(page, 390);
    // The form appears before the "what happens next" section (form-first order).
    const formTop = await page.locator("#contact-form").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const nextTop = await page.locator('[id="what-happens-next"]').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(formTop, "form is above the process section").toBeLessThan(nextTop);
    // Neither the form nor its wrapping card is sticky/fixed.
    const sticky = await page.locator("#contact-form").evaluate((el) => {
      for (let n: HTMLElement | null = el as HTMLElement; n && n !== document.body; n = n.parentElement) {
        const p = getComputedStyle(n).position;
        if (p === "sticky" || p === "fixed") return true;
      }
      return false;
    });
    expect(sticky, "form is not inside a sticky/fixed card").toBe(false);
    await expectNoHorizontalOverflow(page, "contact @ 390px");
  });
});

test.describe("contact page — fragment clearance", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test("every mid-page fragment clears the sticky header", async ({ page }) => {
    for (const id of MID_FRAGMENTS) {
      await page.goto("about:blank");
      await page.goto(`/contact#${id}`);
      await expectFragmentTargetClearsStickyHeader(page, `[id="${id}"]`, `contact #${id}`);
    }
  });
});

test.describe("contact form — flow", () => {
  test("an empty submission surfaces an ordered accessible error summary, moves focus, links focus the field", async ({ page }) => {
    await gotoHydrated(page);
    await page.locator("#contact-form button[type=submit]").click();
    const alert = page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/fix the following/i);
    await expect(alert).toBeFocused();
    await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
    // The first summary link focuses its exact field.
    await alert.getByRole("link").first().click();
    await expect(page.getByLabel("Your name")).toBeFocused();
  });

  test("a valid submission never fakes success when delivery is unconfigured", async ({ page }) => {
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.getByText("your message is on its way")).toHaveCount(0);
    const notice = page.locator('[role="alert"], [role="status"]').first();
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(new RegExp(SUPPORT_EMAIL.replace(".", "\\.")));
  });

  test("a mocked delivered response shows the success panel and keeps the email fallback", async ({ page }) => {
    await page.route("**/api/forms/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    const status = page.locator('[role="status"]');
    await expect(status).toBeVisible();
    await expect(status).toContainText("your message is on its way");
    await expect(page.locator(`a[href="mailto:${SUPPORT_EMAIL}"]`).first()).toBeVisible();
  });

  test("a mocked generic failure shows a truthful alert, not success", async ({ page }) => {
    await page.route("**/api/forms/contact", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ ok: false, code: "error", message: "Something went wrong. Please try again, or email us directly." }) }),
    );
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.getByText("your message is on its way")).toHaveCount(0);
    await expect(page.locator('[role="alert"]').first()).toContainText(/something went wrong/i);
  });

  test("a mocked rate-limit response stays truthful", async ({ page }) => {
    await page.route("**/api/forms/contact", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, code: "rate-limited", message: "Please wait a moment before trying again." }) }),
    );
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.getByText("your message is on its way")).toHaveCount(0);
    await expect(page.locator('[role="alert"]').first()).toContainText(/wait a moment/i);
  });

  test("a mocked turnstile-failed response stays truthful", async ({ page }) => {
    await page.route("**/api/forms/contact", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ ok: false, code: "turnstile-failed", message: "We couldn't verify you're human. Please try again." }) }),
    );
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.getByText("your message is on its way")).toHaveCount(0);
    await expect(page.locator('[role="alert"]').first()).toContainText(/verify you're human/i);
  });

  test("the submit button disables while submitting", async ({ page }) => {
    await page.route("**/api/forms/contact", async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await gotoHydrated(page);
    await fillValid(page);
    await page.waitForTimeout(HUMAN_DELAY);
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#contact-form button[type=submit]")).toBeDisabled();
    await expect(page.locator('[role="status"]')).toContainText("your message is on its way");
  });

  test("prefills a valid goal, ignores an invalid goal and a legacy subject", async ({ page }) => {
    await page.goto("/contact?goal=get-found-on-google");
    await expect(page.getByLabel("Your main goal")).toHaveValue("get-found-on-google");
    await page.goto("/contact?goal=not-a-real-goal");
    await expect(page.getByLabel("Your main goal")).toHaveValue("");
    await page.goto("/contact?subject=legacy-value");
    await expect(page.getByLabel("Your main goal")).toHaveValue("");
  });
});

test.describe("contact page — without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the complete page content, form, options, privacy link and mailto render from the server", async ({ page }) => {
    await page.goto("/contact");
    const main = page.getByRole("main");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Let's plan your next connected step.");
    await expect(main).toContainText("A real person reads every message and replies by email with one practical next step.");
    expect(await page.locator('[id="contact-hero"] a[href="#contact-form"]').count()).toBeGreaterThan(0);
    expect(await page.locator(`[id="contact-hero"] a[href="mailto:${SUPPORT_EMAIL}"]`).count()).toBeGreaterThan(0);

    // Every field + a required and an optional hint.
    for (const label of ["Your name", "Email", "Business name", "Website", "Business type", "Where you are now", "Your main goal", "Your message"]) {
      await expect(page.getByLabel(label), label).toBeVisible();
    }
    // Every option in all three selects renders server-side — exact value + label + order, including
    // the leading "Select an option" placeholder — compared against the real source datasets.
    const expectSelect = async (selector: string, items: { value: string; label: string }[]) => {
      const opts = await page
        .locator(`${selector} option`)
        .evaluateAll((els) => els.map((e) => ({ value: (e as HTMLOptionElement).value, label: (e.textContent ?? "").trim() })));
      expect(opts, selector).toEqual([{ value: "", label: "Select an option" }, ...items]);
    };
    await expectSelect("#contact-business-type", businessTypes.filter(renderable).map((b) => ({ value: b.slug, label: b.name })));
    await expectSelect("#contact-current-stage", stages.filter(renderable).map((s) => ({ value: s.slug, label: s.name })));
    await expectSelect("#contact-main-goal", goals.filter(renderable).map((g) => ({ value: g.slug, label: g.title })));

    await expect(main).toContainText("are required");
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
    await expect(page.locator(`a[href="mailto:${SUPPORT_EMAIL}"]`).first()).toBeVisible();

    // The centralised content — four trust points, three steps, both alternative paths, final CTA.
    for (const t of contactTrustPoints) await expect(main, t.label).toContainText(t.label);
    for (const s of contactProcessSteps) {
      await expect(main, s.title).toContainText(s.title);
      await expect(main, s.body).toContainText(s.body);
    }
    for (const p of contactAlternativePaths) {
      await expect(main, p.title).toContainText(p.title);
      await expect(main, p.body).toContainText(p.body);
    }
    for (const id of [...SECTION_FRAGMENTS, "contact-form"]) {
      expect(await page.locator(`[id="${id}"]`).count(), `#${id} (no JS)`).toBe(1);
    }
    // Both final-CTA destinations, including the mailto secondary.
    expect(await page.locator('[id="get-started"] a[href="#contact-form"]').count()).toBeGreaterThan(0);
    expect(await page.locator(`[id="get-started"] a[href="mailto:${SUPPORT_EMAIL}"]`).count()).toBeGreaterThan(0);
  });
});

test.describe("contact page — responsive & zoom", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow @ ${width}px`, async ({ page }) => {
      await page.goto("/contact");
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `contact @ ${width}px`);
    });
  }

  test("renders with one H1 and no overflow under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `contact reduced-motion @ ${width}px`);
    }
  });

  test("holds its width with the root text scaled to 200%", async ({ page }) => {
    await page.goto("/contact");
    await page.addStyleTag({ content: ":root{font-size:200%!important;}" });
    for (const width of [390, 1280]) {
      await setViewportAndWaitForStableLayout(page, width);
      await expectNoHorizontalOverflow(page, `contact @200% text @ ${width}px`);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
