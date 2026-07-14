import { describe, it, expect } from "vitest";
import { matches, rankCandidates, resolve, specificity } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";
import {
  ENGAGEMENT_OPTIONS,
  type GrowthPlanInput,
  type RuleSet,
} from "@/lib/growth-plan/types";

const RS = growthPlanRuleSet;

describe("growth-plan engine — matching & specificity", () => {
  it("treats an omitted `when` key as a wildcard", () => {
    expect(matches({}, {})).toBe(true);
    expect(matches({ businessType: "ecommerce" }, { businessType: "ecommerce" })).toBe(true);
    expect(matches({ businessType: "ecommerce" }, { businessType: "creators" })).toBe(false);
    expect(matches({ businessType: "ecommerce" }, {})).toBe(false);
  });

  it("counts constrained keys as specificity", () => {
    expect(specificity({})).toBe(0);
    expect(specificity({ businessType: "ecommerce" })).toBe(1);
    expect(specificity({ businessType: "ecommerce", mainGoal: "launch-professional-store" })).toBe(2);
  });

  it("ranks a more specific rule above a broader one that also matches", () => {
    const input: GrowthPlanInput = { businessType: "ecommerce", mainGoal: "turn-visitors-into-buyers" };
    const ranked = rankCandidates(RS.rules, input);
    expect(ranked[0].id).toBe("ecom-traffic-no-sales"); // 2 keys beats any 1-key match
  });
});

describe("growth-plan engine — resolve()", () => {
  it("returns the matched rule's structured result", () => {
    const r = resolve({ businessType: "ecommerce", mainGoal: "launch-professional-store" }, RS);
    expect(r.matchedRuleId).toBe("ecom-launch-store");
    expect(r.startHere.length).toBeGreaterThan(0);
    expect(r.howWeHelp).toMatch(/own your accounts/i); // ownership line always present
  });

  it("falls back safely when nothing matches", () => {
    const r = resolve({ businessType: "nonexistent-type" }, RS);
    expect(r.matchedRuleId).toBe("fallback-discuss");
    expect(r.startHere.length).toBeGreaterThan(0);
    expect(r.howWeHelp).toContain("support@infiniteweblinks.com");
  });

  it("never throws and never returns an empty core for ANY input combination", () => {
    const businessTypes = [undefined, "ecommerce", "creators", "local-service", "b2b", "software", "established", "beginner", "x"];
    const goals = [undefined, "launch-professional-store", "turn-visitors-into-buyers", "get-found-on-google", "save-time-with-automation", "grow-social-following", "y"];
    const setups = [undefined, "Nothing built yet", "I'm running ads", "I'm established and want to scale"] as const;
    for (const businessType of businessTypes)
      for (const mainGoal of goals)
        for (const existingSetup of setups) {
          const r = resolve({ businessType, mainGoal, existingSetup } as GrowthPlanInput, RS);
          expect(r.startHere.length).toBeGreaterThan(0);
          expect(r.connectNext.length).toBeGreaterThan(0);
          expect(r.relevantCapabilities.length).toBeGreaterThan(0);
          expect(typeof r.howWeHelp).toBe("string");
          expect(r.howWeHelp.length).toBeGreaterThan(10);
        }
  });

  it("is deterministic (same input → identical output)", () => {
    const input: GrowthPlanInput = { businessType: "ecommerce", mainGoal: "bring-back" };
    expect(resolve(input, RS)).toEqual(resolve(input, RS));
  });
});

describe("growth-plan — guardrails", () => {
  it("engagement options are neutral and currency-free", () => {
    const joined = ENGAGEMENT_OPTIONS.join(" | ");
    expect(joined).not.toMatch(/[$£€]|\bbudget\b|\bcheap\b|\bafford\b/i);
    expect(ENGAGEMENT_OPTIONS).toContain("Prefer to discuss by email");
  });

  it("no rule promises a specific number or a booking call", () => {
    const json = JSON.stringify(RS).toLowerCase();
    expect(json).not.toMatch(/book a call|calendar|guaranteed|\b\d+%|\bx\d+\b/);
  });

  it("every rule's outcomes describe a kind of result, present and non-empty", () => {
    for (const rule of RS.rules) {
      expect(rule.then.expectedOutcomes.length).toBeGreaterThan(0);
      expect(rule.then.howWeHelp.length).toBeGreaterThan(10);
    }
  });
});

// Type-only guard so the RuleSet shape stays stable.
const _typecheck: RuleSet = RS;
void _typecheck;
