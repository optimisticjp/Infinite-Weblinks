import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { seedChrome, seedHero } from "@/lib/content/seed";

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

  it("every platform-rail logo maps to a real, locally-stored brand asset (no invented marks)", () => {
    expect(seedHero.platforms.length).toBeGreaterThan(0);
    // Real platform logos are allowed for the illustrative "works with" rail, but each
    // must resolve to an accurately-sourced SVG stored locally in public/brand-logos — so
    // a platform can never be added without shipping its genuine (non-invented) mark.
    for (const p of seedHero.platforms) {
      expect(p.name.trim().length, "platform name is non-empty").toBeGreaterThan(0);
      expect(/^[a-z0-9-]+$/.test(p.slug), `"${p.slug}" is a clean slug`).toBe(true);
      const asset = fileURLToPath(new URL(`../../public/brand-logos/${p.slug}.svg`, import.meta.url));
      expect(existsSync(asset), `missing local logo asset for "${p.name}" (${p.slug}.svg)`).toBe(true);
    }
  });

  it("primary CTA is email-led (Build my growth plan → /growth-plan)", () => {
    expect(seedHero.primaryCta.label).toBe("Build my growth plan");
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
