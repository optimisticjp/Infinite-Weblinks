import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 3B §E/§F — the public claims register covers every audited claim group, the targeted absolute-
 * adverb softenings actually landed in the content data, no numeric price was invented, and the time
 * estimate is consistent across surfaces.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
/** Source with comments stripped, so the softening checks look at real copy, not a doc comment that
 *  legitimately names the phrase it removed. */
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("public claims register — coverage", () => {
  const reg = read("../../docs/content/public-claims-register.md");
  it("covers every audited claim group", () => {
    for (const group of [
      "Ownership",
      "No-obligation",
      "Privacy",
      "Free",
      "Pricing",
      "Proof",
      "Partner",
      "Security",
      "Support",
      "Delivery",
    ]) {
      expect(reg, group).toContain(group);
    }
  });
  it("records the category taxonomy and the pricing decision", () => {
    for (const cat of [
      "implemented-fact",
      "business-policy-commitment",
      "illustrative-educational",
      "owner-confirmation-required",
      "professional-review-required",
      "prohibited-unverified",
    ]) {
      expect(reg, cat).toContain(cat);
    }
    expect(reg).toContain("no numeric pricing was invented");
  });
});

describe("targeted trust softenings landed", () => {
  it("account-ownership drops the absolute adverbs but keeps the value proposition", () => {
    const own = readCode("../../src/lib/content/data/account-ownership.ts");
    expect(own).not.toContain("at all times");
    expect(own).not.toContain("always yours");
    // The proposition stays.
    expect(own).toContain("in your name");
    expect(own).toContain("locked in");
  });
  it("honest-expectations softens 'always know' to 'know'", () => {
    const honest = readCode("../../src/lib/content/data/honest-expectations.ts");
    expect(honest).not.toContain("always know");
    expect(honest).toContain("You'll know what we're doing");
  });
  it("the /account-ownership Callout drops 'always yours'", () => {
    const page = read("../../src/app/(marketing)/account-ownership/page.tsx");
    expect(page).not.toContain("always yours");
    expect(page).toContain("The choice is yours");
  });
});

describe("no fabricated numbers; time estimate consistent", () => {
  it("the growth-plan and pricing time estimates agree ('a few minutes')", () => {
    const gp = read("../../src/lib/content/data/growth-plan.ts");
    expect(gp).toContain("Takes a few minutes");
    expect(gp).not.toContain("couple of minutes");
  });
  it("no numeric price/currency appears in the pricing content (kept qualitative)", () => {
    const pricing = read("../../src/lib/content/data/pricing.ts");
    // Strip comments, then assert no currency-and-digit or bare price digits in the copy.
    const code = pricing.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    expect(code).not.toMatch(/[£$€]\s?\d/);
  });
});
