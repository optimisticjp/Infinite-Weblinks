import type { DeliveryModelKey } from "@/lib/content/types";

/**
 * Pricing content — the single source of truth for the /pricing route.
 *
 * These constants were previously route-local in app/(marketing)/pricing/page.tsx and are moved
 * here VERBATIM (no copy changed) so the visible page and the FAQPage JSON-LD read from one typed
 * array, and so the content can be unit-tested for counts, order and the "no invented price" rule.
 *
 * Honest-pricing rules encoded in the types:
 *  • `pricingDeliveryCostNotes` is an EXHAUSTIVE `Record<DeliveryModelKey, string>` — every one of
 *    the four canonical delivery keys is required, an absent key is a typecheck error, and there is
 *    NO silent fallback to a model's own description. Each note describes the cost *shape*, never a
 *    figure.
 *  • engagement-shape notes are a fixed union ("Quoted to scope" / "Monthly, quoted to scope"), so
 *    a stray price string cannot be introduced by accident.
 *  • no currency figure, price, range, minimum, retainer, hourly rate, discount, duration, ranking
 *    or "popular/recommended" marker appears anywhere below (asserted by the integrity test).
 *
 * `tone` carries a legacy wayfinding token (e.g. "var(--domain-build)"); it is mapped to an
 * accessible V2 ink/tint through the domain-colour bridge at presentation time — it is never used
 * as a raw colour in CSS. Server-safe: plain data, no DOM, no Sanity wiring.
 */

export type PricingFactor = {
  title: string;
  blurb: string;
  icon: string;
  tone: string;
};

export type EngagementShapeNote = "Quoted to scope" | "Monthly, quoted to scope";

export type PricingEngagementShape = {
  title: string;
  blurb: string;
  icon: string;
  tone: string;
  note: EngagementShapeNote;
};

export type PricingQuoteStep = {
  title: string;
  blurb: string;
};

export type PricingFaq = {
  question: string;
  answer: string;
};

/** What actually moves a quote up or down. Plain factors, no numbers. */
export const pricingFactors: PricingFactor[] = [
  {
    title: "The scope of the work",
    blurb: "How much there is to build or set up, and how much of it is new versus tidying what you already have.",
    icon: "layers",
    tone: "var(--domain-build)",
  },
  {
    title: "The goal behind it",
    blurb: "A quick fix to unblock one thing costs less than building a system meant to grow with you for years.",
    icon: "target",
    tone: "var(--domain-strategy)",
  },
  {
    title: "The way we work together",
    blurb: "Whether our team does it, we bring in a specialist, we run it for you, or we hand it over changes the cost.",
    icon: "workflow",
    tone: "var(--domain-operate)",
  },
  {
    title: "How much connects",
    blurb: "Joining a few tools cleanly is more involved than a single standalone page, and it shows in the quote.",
    icon: "git-branch",
    tone: "var(--domain-discover)",
  },
  {
    title: "One-off or ongoing",
    blurb: "Some work is a single project. Some is a monthly arrangement where we keep improving what is live.",
    icon: "gauge",
    tone: "var(--domain-retain)",
  },
  {
    title: "How soon you need it",
    blurb: "A comfortable timeline keeps costs steady. Compressing the work to hit a hard date can add to it.",
    icon: "compass",
    tone: "var(--domain-ai)",
  },
];

/**
 * How each delivery model shapes what you pay. Honest cost shapes, never invented prices. Exhaustive
 * over the four canonical delivery keys — an absent key fails typecheck, and there is no fallback to
 * the model's own description.
 */
export const pricingDeliveryCostNotes: Record<DeliveryModelKey, string> = {
  "we-do":
    "A project fee for one-off builds, or a monthly amount when it is ongoing. Priced to the scope we agree up front.",
  "we-expert":
    "The specialist's rate for their part, plus our time to brief and manage them. Expert work without hiring in-house.",
  "we-run":
    "Usually a recurring fee, since we keep the platform running for you. It scales with how much we manage day to day.",
  "you-run":
    "Set-up is a one-off. After we hand over, the running cost is the tools' own subscriptions, paid by you, in your name.",
};

/** Indicative engagement shapes. Descriptive, not a price list, so each is "quoted to scope". */
export const pricingEngagementShapes: PricingEngagementShape[] = [
  {
    title: "A focused fix",
    blurb: "One clear job: a specific page, a broken step in a funnel, or a single integration that is holding you up.",
    icon: "check",
    tone: "var(--domain-strategy)",
    note: "Quoted to scope",
  },
  {
    title: "A build project",
    blurb: "A website, store, or connected set of tools built and configured, then handed to you or run on your behalf.",
    icon: "layout",
    tone: "var(--domain-build)",
    note: "Quoted to scope",
  },
  {
    title: "An ongoing partnership",
    blurb: "We plan, build and connect in stages, and keep improving what is live as your goals move on.",
    icon: "trending-up",
    tone: "var(--domain-retain)",
    note: "Monthly, quoted to scope",
  },
];

/** The path to a written price. */
export const pricingQuoteSteps: PricingQuoteStep[] = [
  {
    title: "Build a plan",
    blurb: "Use the growth plan builder. It is free, takes a few minutes, and gives you a prioritised list of steps.",
  },
  {
    title: "We scope it with you",
    blurb: "A short conversation to confirm what matters now, and what is fine to leave for a later step.",
  },
  {
    title: "You get a written quote",
    blurb: "Clear scope and a clear price for the agreed work, in writing, before anything starts.",
  },
  {
    title: "We start on the first step",
    blurb: "The smallest step that moves you forward, done and working, then on to the next one.",
  },
];

/** Short, honest answers. Rendered on the page, so a FAQPage node is emitted to match this array. */
export const pricingFaqs: PricingFaq[] = [
  {
    question: "Do you have a fixed price list?",
    answer:
      "No. What things cost depends on the scope, the goal, and the way we work together, so we quote each piece of work after we understand it rather than publishing set prices that would rarely fit.",
  },
  {
    question: "How do I get a price?",
    answer:
      "Build a growth plan or get in touch. We scope the work with you and send a written quote with clear scope and price before any work begins.",
  },
  {
    question: "Does the growth plan cost anything?",
    answer:
      "No. Building a plan on this site is free and takes a few minutes. It gives you a prioritised list of steps. A quote for any work follows once we have scoped it with you.",
  },
  {
    question: "Is it a one-off cost or ongoing?",
    answer:
      "It can be either. Some work is a single project with a project fee. Some is a monthly arrangement where we keep running or improving what is live. The way of working you choose decides which.",
  },
  {
    question: "Will I be locked in?",
    answer:
      "No. Whichever way we work, your accounts, data and tools stay in your name. Nothing is locked to Infinite Weblinks, and you can take your work with you.",
  },
];
