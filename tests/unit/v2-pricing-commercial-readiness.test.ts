import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { pricingFaqs, pricingEngagementShapes } from "@/lib/content/data/pricing";

/**
 * Phase 3B §F — pricing/commercial readiness. The qualitative "quoted to scope" model is retained,
 * no numeric price/range/retainer/minimum/deposit was invented, the visible FAQ list and the FAQPage
 * JSON-LD share ONE source (so they can't drift), and /pricing ↔ /refunds don't contradict.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("pricing FAQ ⇄ FAQPage JSON-LD share one source", () => {
  const page = read("../../src/app/(marketing)/pricing/page.tsx");
  it("the page feeds the SAME pricingFaqs array to the visible list and the schema", () => {
    expect(page).toContain("faqJsonLd(pricingFaqs)");
    expect(page).toContain("<PricingFaqList faqs={pricingFaqs}");
    // No second/hand-authored FAQ array is passed to faqJsonLd (would let content and schema drift).
    expect(page).not.toMatch(/faqJsonLd\(\s*\[/);
  });
});

describe("no invented numeric pricing (qualitative model retained)", () => {
  const pricing = strip(read("../../src/lib/content/data/pricing.ts"));
  it("contains no currency+digit and no numeric rate/duration figure in the copy", () => {
    expect(pricing).not.toMatch(/[£$€]\s?\d/);
    // No "/month", "per month", "x,xxx", hourly rate, or percentage figure smuggled in.
    expect(pricing).not.toMatch(/\d+\s*(?:\/\s*(?:mo|month|hr|hour)|%)/i);
    expect(pricing).not.toMatch(/\bper (?:month|hour)\b/i);
  });
  it("engagement-shape notes stay the fixed, figure-free union", () => {
    for (const s of pricingEngagementShapes) {
      expect(["Quoted to scope", "Monthly, quoted to scope"]).toContain(s.note);
    }
  });
  it("keeps the honest commercial commitments (free, few minutes, written quote, no lock-in)", () => {
    const all = pricingFaqs.map((f) => `${f.question} ${f.answer}`).join(" ");
    expect(all).toMatch(/free/i);
    expect(all).toMatch(/few minutes/i);
    expect(all).toMatch(/written quote/i);
    expect(all).toMatch(/locked in|Nothing is locked/i);
  });
});

describe("/pricing and /refunds do not contradict", () => {
  const refunds = read("../../src/lib/content/data/legal.ts");
  it("refunds says no payment on this site + the free plan + a separate agreement, with no figures", () => {
    expect(refunds).toContain("There is no checkout or payment on this website");
    expect(refunds).toContain("free to use");
    expect(refunds).toContain("separate agreement");
    // The refunds copy invents no numeric refund/deposit term.
    const refundsSection = refunds.slice(
      refunds.indexOf('slug: "refunds"'),
      refunds.indexOf('slug: "accessibility"'),
    );
    expect(refundsSection).not.toMatch(/[£$€]\s?\d/);
  });
});
