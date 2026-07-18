import type { TrustNarrative } from "@/lib/content/types";

/**
 * Interim trust layer (review §3/§5/§14; brief §P1-01, §P3-05).
 *
 * The business does not yet have client logos, testimonials, case studies or metrics it can
 * show honestly, so this section builds trust the only truthful way available before proof
 * exists: by being specific about method, ownership and standards. There is deliberately NO
 * fabricated client, quote, number, partnership or award anywhere in this file. The real
 * proof sections (case studies, testimonials) stay status-gated and appear below this one the
 * moment verified records exist — see docs/content-gating.md and data/proof.ts.
 */
export const trustNarrative: TrustNarrative = {
  eyebrow: "How we work",
  title: "How we work — and what you actually get",
  lead: "We're a newer partner, so we lead with method and ownership rather than a wall of logos. Here is how a project actually runs, and the standards we hold ourselves to.",
  steps: [
    {
      title: "Start with your goal",
      body: "Before any tool or service is named, we get clear on what you are trying to achieve and what a good result looks like.",
    },
    {
      title: "Map the connected system",
      body: "We show how your website, marketing, customer tools and data should fit together, so nothing is bought in isolation.",
    },
    {
      title: "Sequence the work",
      body: "You get a prioritised plan — what to do now, next and later — so spend follows impact instead of urgency.",
    },
    {
      title: "You keep the keys",
      body: "Everything is built in your name. If you ever move on, you take working systems and full access with you.",
    },
  ],
  standards: [
    {
      title: "Plain-English advice",
      body: "We explain what you need and why before anything is priced. No jargon, no pressure to buy the biggest package.",
      icon: "message-square",
      color: "var(--cyan)",
    },
    {
      title: "Accessible and fast by default",
      body: "Every build targets WCAG 2.1 AA and genuinely fast loading, rather than treating them as an afterthought.",
      icon: "gauge",
      color: "var(--lime)",
    },
    {
      title: "Secure and private",
      body: "Forms and data are protected, credentials stay server-side, and your information is never sold or shared.",
      icon: "shield",
      color: "var(--violet)",
    },
    {
      title: "Chosen for fit, not commission",
      body: "We recommend platforms that suit your size and budget, not whichever one pays the biggest referral fee.",
      icon: "compass",
      color: "var(--orange)",
    },
  ],
  reassurance:
    "When we have client results worth showing, they will appear here — verified, shared with permission, and never inflated.",
  cta: { label: "Build My Digital Growth Plan", href: "/growth-plan" },
  secondary: { label: "See how it all works", href: "/how-it-works" },
};
