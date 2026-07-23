/**
 * Growth-plan presentation content — the repeated, server-safe route-level data for /growth-plan.
 *
 * These were route-local constants in app/(convert)/growth-plan/page.tsx. Moved here so the route and
 * the design preview read one typed source. Icons are shared string names (resolved by the `Icon`
 * primitive); `tone` carries a legacy wayfinding token mapped to an accessible V2 ink at presentation.
 *
 * This module holds ONLY route presentation data. STEP_META, validation messages, state-machine
 * labels, rule data, API messages and the generated result content stay with the builder / engine /
 * API — they are behaviour-bound, not repeated presentation.
 *
 * Truthfulness: the plan lives only in React state — it is not stored, downloaded or emailed to the
 * visitor — so no "yours to keep", download or email-copy claim appears here.
 */

export type PlanIncludeItem = {
  title: string;
  body: string;
  /** Shared icon name (see primitives/Icon). */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  tone: string;
};

/** Three approved hero reassurances (feed the PageHeader trust note). */
export const growthPlanHeroTrustPoints: string[] = [
  "Takes a couple of minutes",
  "No sign-up, no cost",
  "Honest advice, not a sales pitch",
];

/** What the plan will contain — the hero/plan-preview list (five items, source order). */
export const growthPlanPreviewItems: string[] = [
  "A recommended starting point",
  "A connected roadmap in phases",
  "The services and ways we can deliver them",
  "The right tools for your setup",
  "An honest note on how we'd help",
];

/**
 * What a plan can include — six items in source order. The exact recommendation depends on the
 * visitor's answers, so not every plan contains all six.
 */
export const growthPlanIncludes: PlanIncludeItem[] = [
  {
    title: "A starting point",
    body: "The stage that fits you now, and why it's the sensible place to begin.",
    icon: "compass",
    tone: "var(--domain-strategy)",
  },
  {
    title: "A connected roadmap",
    body: "What to do first, what to connect next, and what can wait, in order.",
    icon: "git-branch",
    tone: "var(--domain-discover)",
  },
  {
    title: "Relevant services",
    body: "The services that move you forward, and the delivery model options for each.",
    icon: "layers",
    tone: "var(--domain-convert)",
  },
  {
    title: "The right tools",
    body: "Real tools that fit your setup, chosen to work together, never a random list.",
    icon: "wrench",
    tone: "var(--domain-build)",
  },
  {
    title: "Priorities for later",
    body: "What to add once the first steps are working, so effort compounds.",
    icon: "gauge",
    tone: "var(--domain-operate)",
  },
  {
    title: "How we'd help",
    body: "A plain note on where we'd do the work and where you'd keep control.",
    icon: "users",
    tone: "var(--domain-retain)",
  },
];
