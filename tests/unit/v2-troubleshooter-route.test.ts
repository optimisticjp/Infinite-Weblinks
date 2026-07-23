import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2Q — the /troubleshooter route contract. The page is now a server-rendered PageHeader + the
 * GrowthTroubleshooter client component + one reserved-night FinalCtaSection. Metadata, canonical and
 * robots are preserved; the cosmic hero, GlobeArc and decorative journey are gone; there is exactly
 * one final CTA and one dark section.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const page = read("../../src/app/(convert)/troubleshooter/page.tsx");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");
const code = stripComments(page);

describe("metadata + SEO preserved", () => {
  it("keeps the exact title and description", () => {
    expect(page).toContain('title: "Growth Troubleshooter — find where to look first"');
    expect(page).toContain(
      "Tell us what is not working and we'll show you where to look first — a plain explanation, useful checks and a sensible next step. No email required.",
    );
  });
  it("keeps the self-canonical and noindex,follow", () => {
    expect(page).toContain('canonical("/troubleshooter")');
    expect(page).toContain("robots: { index: false, follow: true }");
  });
  it("adds no JSON-LD / schema (none existed)", () => {
    expect(code).not.toMatch(/application\/ld\+json|HowTo|FAQPage|MedicalWebPage|AggregateRating/);
  });
});

describe("PageHeader migration + section composition", () => {
  it("opens with the PageHeader (id, breadcrumb, plain H1, both CTAs, trust note)", () => {
    expect(code).toMatch(/<PageHeader\b/);
    expect(code).toContain('id="troubleshooter-hero"');
    expect(code).toContain('surface="light"');
    expect(code).toContain("Tell us what is not working. We'll show you where to look first.");
    expect(code).toContain('href="#diagnose"');
    expect(code).toContain('href="/growth-plan"');
    expect(code).toMatch(/not a guaranteed diagnosis/);
  });

  it("renders GrowthTroubleshooter then exactly one FinalCtaSection", () => {
    const th = code.indexOf("<GrowthTroubleshooter");
    const cta = code.indexOf("<FinalCtaSection");
    expect(th).toBeGreaterThan(-1);
    expect(cta).toBeGreaterThan(th);
    expect((code.match(/<FinalCtaSection\b/g) ?? []).length, "exactly one final CTA").toBe(1);
    expect(code).toContain('id="get-started"');
    expect(code).toContain('href: "/contact"');
  });

  it("removes the cosmic hero, GlobeArc, the JOURNEY diagram and any gradient accent word", () => {
    expect(code).not.toMatch(/GlobeArc/);
    expect(code).not.toMatch(/\bJOURNEY\b/);
    expect(code).not.toMatch(/theme-dark|theme-cosmic|iw-gradient-word|heroAccent/);
    expect(code).not.toMatch(/Finding the break/);
  });

  it("keeps at most one dark section (the final CTA owns the only night surface)", () => {
    // The page delegates the night surface to FinalCtaSection; it declares no theme-night/dark itself.
    expect(code).not.toMatch(/theme-night/);
  });
});
