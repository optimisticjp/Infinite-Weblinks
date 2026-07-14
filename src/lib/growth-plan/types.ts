/**
 * Growth Plan Builder — types and locked option sets.
 * The builder is a guided form backed by a deterministic, reviewed rule set
 * (contracts/growth-plan-rules.md) — never free/unrestricted AI.
 */

/** Neutral engagement ranges (no currency, no aggressive budget qualification). */
export const ENGAGEMENT_OPTIONS = [
  "Small initial project",
  "Focused growth project",
  "Multi-service growth plan",
  "Larger ongoing programme",
  "Not sure yet",
  "Prefer to discuss by email",
] as const;
export type Engagement = (typeof ENGAGEMENT_OPTIONS)[number];

export const TIMELINE_OPTIONS = [
  "As soon as possible",
  "In the next 1–3 months",
  "In 3–6 months",
  "Just exploring for now",
] as const;
export type Timeline = (typeof TIMELINE_OPTIONS)[number];

export const EXISTING_SETUP_OPTIONS = [
  "Nothing built yet",
  "I have a website or store",
  "I have traffic but few sales",
  "I'm getting sales but it feels chaotic",
  "I'm running ads",
  "I'm established and want to scale",
] as const;
export type ExistingSetup = (typeof EXISTING_SETUP_OPTIONS)[number];

/** Inputs collected by the guided form. Every field optional so partial states resolve. */
export interface GrowthPlanInput {
  businessType?: string; // businessType slug
  currentStage?: string; // growth-stage slug
  mainGoal?: string; // goal slug
  existingSetup?: ExistingSetup;
  engagement?: Engagement;
  timeline?: Timeline;
}

/** The structured recommendation (brief §15) — the only thing shown to the visitor. */
export interface GrowthPlanResult {
  matchedRuleId: string;
  startHere: string[];
  connectNext: string[];
  addLater: string[];
  relevantCapabilities: string[];
  exampleTools: string[];
  expectedOutcomes: string[];
  howWeHelp: string;
}

export interface RuleWhen {
  businessType?: string;
  currentStage?: string;
  mainGoal?: string;
  existingSetup?: ExistingSetup;
}

export interface RuleThen {
  startHere: string[];
  connectNext: string[];
  addLater: string[];
  capabilities: string[];
  exampleTools: string[];
  expectedOutcomes: string[];
  howWeHelp: string;
}

export interface Rule {
  id: string;
  when: RuleWhen;
  then: RuleThen;
  /** Tie-breaker within the same specificity (higher wins). Default 0. */
  priority?: number;
}

export interface RuleSet {
  version: string;
  status: "draft" | "approved";
  rules: Rule[];
  fallback: RuleThen & { id: string };
}
