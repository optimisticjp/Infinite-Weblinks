import { describe, it, expect } from "vitest";
import { seedChrome, seedHero } from "@/lib/content/seed";

/**
 * Guardrail invariants on the shipped content — these encode the locked brief so a
 * future edit can't quietly reintroduce a booking flow, a phone number, or a
 * non-approved CTA.
 */
describe("content guardrails", () => {
  it("the hero has exactly six connected areas", () => {
    expect(seedHero.areas).toHaveLength(6);
  });

  it("primary CTA is email-led (Build My Digital Growth Plan → /growth-plan)", () => {
    expect(seedHero.primaryCta.label).toBe("Build My Digital Growth Plan");
    expect(seedHero.primaryCta.route).toBe("/growth-plan");
  });

  it("no phone number and a visible support-email fallback in the footer", () => {
    expect(seedChrome.footer.supportEmail).toBe("support@infiniteweblinks.com");
    const json = JSON.stringify(seedChrome.footer);
    expect(json).not.toMatch(/tel:|phone|\+\d[\d\s()-]{6,}/i);
  });

  it("footer social links are hidden until a valid URL exists", () => {
    expect(seedChrome.footer.social.length).toBeGreaterThan(0);
    expect(seedChrome.footer.social.every((s) => !s.url)).toBe(true);
  });

  it("no booking / calendar / SaaS-login language anywhere in the chrome or hero", () => {
    const json = JSON.stringify({ seedChrome, seedHero }).toLowerCase();
    for (const banned of ["book a call", "calendar", "schedule a", "all-in-one platform", "sign in", "log in"]) {
      expect(json).not.toContain(banned);
    }
  });

  it("every header CTA route is one of the approved routes", () => {
    const approved = new Set(["/growth-plan", "/how-it-works", "/contact"]);
    for (const cta of seedChrome.nav.ctas) {
      expect(approved.has(cta.route)).toBe(true);
    }
  });
});
