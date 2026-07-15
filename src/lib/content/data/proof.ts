import type { CaseStudy, Example, Testimonial } from "@/lib/content/types";

/**
 * Proof content. Status is deliberately "placeholder" on every item here, which
 * keeps it hidden from public rendering (see RENDERABLE_STATUSES in types.ts).
 * Text is obviously non-real by design — no fabricated client names, quotes, or
 * numbers — so this never gets mistaken for genuine proof if the status gate
 * is ever bypassed accidentally during development.
 */

export const caseStudies: CaseStudy[] = [
  {
    status: "placeholder",
    slug: "placeholder-case-study-one",
    title: "Placeholder Case Study — Not Yet Published",
    summary:
      "Placeholder case study — not yet published. This slot will hold a real, verified client story once one is available and approved for publication. No client, results, or figures shown here are real.",
  },
  {
    status: "placeholder",
    slug: "placeholder-case-study-two",
    title: "Placeholder Case Study — Not Yet Published",
    summary:
      "Placeholder case study — not yet published. Structural example only, used to test layout and content length. No real client, results, or claims.",
  },
];

export const testimonials: Testimonial[] = [
  {
    status: "placeholder",
    quote: "Placeholder testimonial — not yet published. This is not a real quote from a real client.",
    attribution: "Placeholder — not a real client",
  },
  {
    status: "placeholder",
    quote: "Placeholder testimonial — not yet published. Structural example only, used to test layout and content length.",
    attribution: "Placeholder — not a real client",
  },
];

export const examples: Example[] = [
  {
    status: "placeholder",
    slug: "placeholder-example-one",
    title: "Placeholder Example — Not Yet Published",
    summary:
      "Placeholder example — not yet published. This slot will hold a real project example once one is approved for public display.",
  },
  {
    status: "placeholder",
    slug: "placeholder-example-two",
    title: "Placeholder Example — Not Yet Published",
    summary:
      "Placeholder example — not yet published. Structural example only, used to test layout and content length.",
  },
];
