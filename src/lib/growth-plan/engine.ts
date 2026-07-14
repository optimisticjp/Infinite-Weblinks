import type { GrowthPlanInput, GrowthPlanResult, Rule, RuleSet, RuleWhen } from "./types";

/**
 * Pure, deterministic Growth Plan resolver. Same input + same rule set → same output.
 * No randomness, no network, no AI at decision time (contracts/growth-plan-rules.md).
 */

/** Number of constrained keys in a rule's `when` — more specific wins. */
export function specificity(when: RuleWhen): number {
  return [when.businessType, when.currentStage, when.mainGoal, when.existingSetup].filter(Boolean)
    .length;
}

/** A `when` matches when every *present* key equals the input; omitted keys are wildcards. */
export function matches(when: RuleWhen, input: GrowthPlanInput): boolean {
  if (when.businessType && when.businessType !== input.businessType) return false;
  if (when.currentStage && when.currentStage !== input.currentStage) return false;
  if (when.mainGoal && when.mainGoal !== input.mainGoal) return false;
  if (when.existingSetup && when.existingSetup !== input.existingSetup) return false;
  return true;
}

/** Order candidates: most specific first, then explicit priority (stable for equal keys). */
export function rankCandidates(rules: Rule[], input: GrowthPlanInput): Rule[] {
  return rules
    .filter((r) => matches(r.when, input))
    .map((r, index) => ({ r, index }))
    .sort((a, b) => {
      const s = specificity(b.r.when) - specificity(a.r.when);
      if (s !== 0) return s;
      const p = (b.r.priority ?? 0) - (a.r.priority ?? 0);
      if (p !== 0) return p;
      return a.index - b.index; // stable
    })
    .map((x) => x.r);
}

/**
 * Resolve an input against a rule set. Always returns a well-formed, non-empty result:
 * the best-matching rule, or the fallback (safe "let's talk by email" path) when none match.
 */
export function resolve(input: GrowthPlanInput, ruleSet: RuleSet): GrowthPlanResult {
  const chosen = rankCandidates(ruleSet.rules, input)[0];
  const then = chosen ? chosen.then : ruleSet.fallback;
  const id = chosen ? chosen.id : ruleSet.fallback.id;
  return {
    matchedRuleId: id,
    startHere: [...then.startHere],
    connectNext: [...then.connectNext],
    addLater: [...then.addLater],
    relevantCapabilities: [...then.capabilities],
    exampleTools: [...then.exampleTools],
    expectedOutcomes: [...then.expectedOutcomes],
    howWeHelp: then.howWeHelp,
  };
}
