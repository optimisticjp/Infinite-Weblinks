import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2Q — the contained Phase 2P corrections (source contracts):
 *  1. the unmeasured "server H1 = LCP" claim is corrected to a likely-candidate, not-measured wording;
 *  2. the unused decorative five-line hero preview list is removed and its retirement recorded;
 *  3. the design-preview PlanReveal result is engine-derived (resolve + growthPlanRuleSet), not a
 *     hand-authored object literal cast to GrowthPlanResult;
 *  7. the OptionCards colour comment no longer claims a palette cycle.
 * (The growth-plan no-JS / fragment-geometry / follow-up error-axe corrections are covered in
 * tests/e2e/growth-plan.spec.ts.)
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const report = read("../../docs/design/phase-2p-implementation-report.md");
const growthPage = read("../../src/app/(convert)/growth-plan/page.tsx");
const growthData = read("../../src/lib/content/data/growth-plan.ts");
const dataBarrel = read("../../src/lib/content/data/index.ts");
const preview = read("../../src/app/design-preview/page.tsx");
const optionCards = read("../../src/components/primitives/OptionCards.tsx");
/** Collapse comment line-wrapping (strip the `\n   *  ` continuation markers, then collapse
 *  whitespace) so phrase checks aren't broken by JSDoc formatting. */
const squish = (s: string) => s.replace(/\n\s*\*\s?/g, " ").replace(/\s+/g, " ");

describe("1 · LCP wording is accurate (not a measured claim)", () => {
  it("the Phase 2P report no longer equates the H1 with a measured LCP", () => {
    expect(report).not.toMatch(/server H1 = LCP/);
    expect(report).toMatch(/likely LCP candidate/i);
    expect(report).toMatch(/not a measured LCP/i);
  });
  it("the growth-plan page comment no longer equates the H1 with a measured LCP", () => {
    expect(growthPage).not.toMatch(/server H1 = LCP/);
    expect(growthPage).toMatch(/likely LCP candidate/i);
  });
});

describe("2 · the unused preview list is removed and its retirement recorded", () => {
  it("growth-plan.ts no longer declares growthPlanPreviewItems", () => {
    expect(growthData).not.toMatch(/export const growthPlanPreviewItems/);
  });
  it("the data barrel no longer re-exports it", () => {
    expect(dataBarrel).not.toMatch(/growthPlanPreviewItems/);
  });
  it("the content module records the retirement and points at growthPlanIncludes", () => {
    expect(growthData).toMatch(/retired/i);
    expect(growthData).toMatch(/growthPlanIncludes/);
  });
});

describe("3 · the design-preview PlanReveal result is engine-derived", () => {
  it("computes the fixture through resolve + growthPlanRuleSet", () => {
    expect(preview).toContain('import { resolve } from "@/lib/growth-plan/engine"');
    expect(preview).toContain('import { growthPlanRuleSet } from "@/lib/growth-plan/rules"');
    expect(preview).toMatch(/PLAN_REVEAL_PREVIEW[^\n]*=\s*resolve\(/);
    expect(preview).toMatch(/growthPlanRuleSet,?\s*\)/);
  });
  it("is not a hand-authored object literal cast to GrowthPlanResult", () => {
    expect(preview).not.toMatch(/PLAN_REVEAL_PREVIEW:\s*GrowthPlanResult\s*=\s*\{/);
    expect(preview).not.toContain('matchedRuleId: "preview-fixture"');
  });
});

describe("7 · the OptionCards colour comment no longer claims a palette cycle", () => {
  it("documents domainInk mapping + one fallback ink, no cycle", () => {
    // The old affirmative "falls back to a cycled hue" claim must be gone; negated statements
    // ("no palette cycle") are fine and expected. Compare against the whitespace-collapsed source
    // so comment line-wrapping doesn't break the phrase checks.
    const src = squish(optionCards);
    expect(src).not.toMatch(/cycled hue|falls back to a cycled/i);
    expect(src).toMatch(/mapped to an accessible V2 ink through `domainInk`/);
    expect(src).toMatch(/no palette cycle/i);
  });
});
