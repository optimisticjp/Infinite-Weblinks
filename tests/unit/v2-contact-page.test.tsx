import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2O — the migrated /contact route + form/API invariants. Source-level guards (the page is an
 * async Server Component): metadata / canonical / ContactPage JSON-LD preserved, the V2 composition
 * and fragment order, no cosmic/legacy construct, the goal-prefill + option contract, the ContactForm
 * behaviour contract, and an API-safety guard that the production form pipeline is unchanged.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const PAGE = "../../src/app/(convert)/contact/page.tsx";

describe("/contact route — preservation + V2 composition", () => {
  const page = read(PAGE);
  const code = readCode(PAGE);

  it("preserves the title, meta description, canonical and the single ContactPage JSON-LD node", () => {
    expect(page).toMatch(/title:\s*"Contact us"/);
    expect(page).toContain("Contact Infinite Weblinks, a Digital Growth Partner");
    expect(page).toMatch(/path:\s*"\/contact"/);
    expect((code.match(/contactPageJsonLd\(/g) ?? []).length, "exactly one ContactPage node").toBe(1);
    // No BreadcrumbList was introduced (none in the current contract).
    expect(code).not.toContain("breadcrumbJsonLd");
  });

  it("uses the V2 building blocks and renders the fragments in source order", () => {
    for (const used of ["PageHeader", "ContactFormSection", "ProcessStepList", "ContactPathCard", "FinalCtaSection"]) {
      expect(code, `uses ${used}`).toContain(used);
    }
    const ids = [...code.matchAll(/id="([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(["contact-hero", "what-happens-next", "other-ways", "get-started"]);
  });

  it("uses explicit light/alt surfaces with exactly one dark FinalCtaSection", () => {
    const surfaces = [...code.matchAll(/surface="(\w+)"/g)].map((m) => m[1]);
    expect(surfaces.length, "every SectionShell/PageHeader names its surface").toBeGreaterThan(0);
    expect(surfaces.every((s) => s === "light" || s === "alt"), "no night surface in the page itself").toBe(true);
    expect((code.match(/<FinalCtaSection/g) ?? []).length).toBe(1);
  });

  it("carries no cosmic / legacy construct or gradient word", () => {
    for (const banned of [
      "CosmicPageHero",
      "CosmicBackground",
      "GlobeArc",
      "InfinityMark",
      "NodeOrb",
      "GlowButton",
      'variant="glass"',
      'background="horizon"',
      "iw-gradient-word",
    ]) {
      expect(code, `no ${banned}`).not.toContain(banned);
    }
  });
});

describe("/contact — goal prefill and option integrity", () => {
  const code = readCode(PAGE);

  it("prefills only a valid goal slug and ignores the legacy subject param", () => {
    expect(code).toMatch(/goals\.some\(\(g\) => g\.slug === params\.goal\) \? params\.goal : undefined/);
    // The legacy `subject` query is declared in the type but never read.
    expect(code).not.toMatch(/params\.subject/);
  });

  it("builds the three option sets from the content getters, preserving source order", () => {
    expect(code).toContain("getBusinessTypes");
    expect(code).toContain("getStages");
    expect(code).toContain("getGoals");
    expect(code).toMatch(/businessTypes\.map\(\(b\) => \(\{ value: b\.slug, label: b\.name \}\)\)/);
    expect(code).toMatch(/stages\.map\(\(s\) => \(\{ value: s\.slug, label: s\.name \}\)\)/);
    expect(code).toMatch(/goals\.map\(\(g\) => \(\{ value: g\.slug, label: g\.title \}\)\)/);
  });
});

describe("ContactForm behaviour contract (unchanged)", () => {
  const form = read("../../src/components/forms/ContactForm.tsx");

  it("keeps the field order, ids, labels and hints", () => {
    expect(form).toContain('const FIELD_ORDER = ["name", "email", "company", "website", "message"] as const');
    for (const id of ["contact-name", "contact-email", "contact-company", "contact-website", "contact-business-type", "contact-current-stage", "contact-main-goal", "contact-message"]) {
      expect(form, `field ${id}`).toContain(`id="${id}"`);
    }
    // The form's own id is the fragment target error links + e2e depend on.
    expect(form).toContain('id="contact-form"');
    expect(form).toContain("initialGoal");
  });

  it("posts the parsed payload to /api/forms/contact and never fakes success", () => {
    expect(form).toContain('fetch("/api/forms/contact"');
    expect(form).toContain("JSON.stringify(parsed.data)");
    // Success is set ONLY when the server says data.ok; delivery problems surface a truthful notice.
    expect(form).toMatch(/if \(data\.ok\) \{\s*setStatus\("success"\)/);
    // Delivery/infra failures surface a truthful "email us" notice — never presented as success.
    expect(form).toContain('data.code === "delivery-unavailable"');
    expect(form).toContain('data.code === "delivery-failed"');
    // Phase 3A: a fail-closed security-check outage is handled the same truthful way.
    expect(form).toContain('data.code === "security-unavailable"');
    expect(form).toContain("contactSchema.safeParse");
  });
});

describe("API safety — the production form pipeline is unchanged", () => {
  const route = read("../../src/app/api/forms/contact/route.ts");

  it("keeps the defence-in-depth flow and response codes in order", () => {
    // bounded read → schema → honeypot → timing → rate limit → turnstile → delivery config → forward → fail → ok.
    const order = [
      "readJsonBody(req)",
      "contactSchema.safeParse(read.data)",
      "values._gotcha",
      "values.elapsedMs < MIN_HUMAN_MS",
      "rateLimit(`contact:${ip}`)",
      "verifyTurnstile(values.turnstileToken",
      'deliveryEnabled("contact")',
      'forwardToFormspree("contact"',
      "delivery.delivered",
    ];
    let pos = 0;
    for (const marker of order) {
      const i = route.indexOf(marker, pos);
      expect(i, `flow step "${marker}" in order`).toBeGreaterThanOrEqual(0);
      pos = i + marker.length;
    }
    for (const code of [
      "unsupported-media-type",
      "payload-too-large",
      "invalid-json",
      "validation-error",
      "rate-limited",
      "rate-limit-unavailable",
      "turnstile-failed",
      "security-unavailable",
      "delivery-unavailable",
      "delivery-failed",
    ]) {
      expect(route, `code ${code}`).toContain(code);
    }
    // The security gates fail closed: an unavailable human-check or limiter is a distinct 503, not a 400.
    expect(route).toContain('turnstile.disposition === "unavailable"');
    expect(route).toContain('rate.disposition === "unavailable"');
    expect(route).toContain('"Retry-After": String(rate.retryAfterSeconds)');
    // Every response carries a request id, and the direct req.json() is gone.
    expect(route).toContain('"X-Request-ID": requestId');
    expect(route).not.toContain("req.json()");
  });

  it("the schema, config, formspree, rate-limit and turnstile modules still expose their contract", () => {
    expect(read("../../src/lib/validation/forms.ts")).toContain("export const contactSchema");
    expect(read("../../src/lib/forms/config.public.ts")).toContain('export const supportEmail = "support@infiniteweblinks.com"');
    expect(read("../../src/lib/forms/formspree.ts")).toContain("forwardToFormspree");
    expect(read("../../src/lib/forms/rate-limit.ts")).toContain("clientIpFromHeaders");
    expect(read("../../src/lib/forms/turnstile.ts")).toContain("verifyTurnstile");
    expect(read("../../src/components/forms/Turnstile.tsx")).toContain("TurnstileField");
  });
});
