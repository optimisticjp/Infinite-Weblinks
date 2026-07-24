import type { CaseStudy, Example, Testimonial } from "@/lib/content/types";

/**
 * Proof content. DOUBLE-gated and hidden by BOTH gates:
 *  1. status is deliberately "placeholder" on every item (fails the render gate,
 *     RENDERABLE_STATUSES in types.ts); and
 *  2. no item carries `verification` metadata, so it also fails `isPublishableProof`
 *     (consent + identity + claims + owner approval + evidence reference).
 * So even if a status were flipped to "verified" by mistake, the item still stays hidden until
 * genuine publication-verification metadata is added. Text is obviously non-real by design — no
 * fabricated client names, quotes, or numbers.
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
    quote:
      "Placeholder testimonial — not yet published. This is not a real quote from a real client.",
    attribution: "Placeholder — not a real client",
  },
  {
    status: "placeholder",
    quote:
      "Placeholder testimonial — not yet published. Structural example only, used to test layout and content length.",
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
