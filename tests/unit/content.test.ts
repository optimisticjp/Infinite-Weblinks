import { describe, it, expect } from "vitest";
import { seedChrome, seedHero } from "@/lib/content/seed";
import { goals } from "@/lib/content/data/goals";
import { services } from "@/lib/content/data/services";
import { tools } from "@/lib/content/data/tools";

/**
 * Guardrail invariants on the shipped content — these encode the locked brief so a
 * future edit can't quietly reintroduce a booking flow, a phone number, or a
 * non-approved CTA.
 */
describe("content guardrails", () => {
  it("the hero has exactly five primary connected domains", () => {
    expect(seedHero.areas).toHaveLength(5);
    expect(seedHero.areas.map((a) => a.label)).toEqual([
      "Website",
      "Marketing",
      "Customer Tools",
      "Automation",
      "Analytics",
    ]);
  });

  it("every platform-rail name is an approved example tool from the content (no fabricated proof)", () => {
    expect(seedHero.platforms.length).toBeGreaterThan(0);
    // The rail must only name tools that already appear in the approved exampleTools
    // data — so it can never introduce an invented or off-brand platform name.
    const approved = new Set(
      [...goals, ...services, ...tools].flatMap((item) => item.exampleTools ?? []),
    );
    for (const name of seedHero.platforms) {
      expect(approved.has(name), `"${name}" is not in any approved exampleTools list`).toBe(true);
    }
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
