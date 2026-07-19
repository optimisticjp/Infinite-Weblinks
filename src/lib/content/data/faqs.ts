import type { Faq } from "@/lib/content/types";

/**
 * Common questions (Growth Guide p.25), adapted to the locked email-led
 * conversion model — no "book a call" language. Replaced with the Growth Plan
 * builder and email as the ways to get started. Grouped by category so the FAQ
 * page can section them (Getting started, How we work, Pricing, Timelines,
 * Ownership); the answers themselves are unchanged.
 */
export const faqs: Faq[] = [
  {
    status: "verified",
    slug: "need-everything-on-site",
    question: "Do I need everything on this site?",
    answer:
      "No. Most clients start with one area and grow from there. Think of it as a menu, not a checklist, we'll help you pick the smallest next step that moves you forward.",
    category: "Getting started",
  },
  {
    status: "verified",
    slug: "only-need-one-thing",
    question: "What if I only need one thing?",
    answer:
      "That's fine. Plenty of clients come for a single project, like a store build or a funnel. There's no obligation to take on the whole system.",
    category: "Getting started",
  },
  {
    status: "verified",
    slug: "how-to-get-started",
    question: "How do we get started?",
    answer:
      "Build your Growth Plan through a short guided form, or send us your goals by email. We'll look at where you are, tell you honestly where the gap is, and send a tailored roadmap. No pressure, no jargon.",
    category: "Getting started",
  },
  {
    status: "verified",
    slug: "do-work-or-hand-tools",
    question: "Do you do the work, or just hand me tools?",
    answer:
      "Both, depending on the service. Some things we do fully in-house, some we run for you, and some we set up and hand over. Every service is tagged clearly so you know which before you commit.",
    category: "How we work",
  },
  {
    status: "verified",
    slug: "already-have-website",
    question: "What if I already have a website?",
    answer:
      "That's fine. We'll look honestly at what's there and improve it rather than rebuild for the sake of it. Sometimes a redesign makes sense, sometimes a few fixes do the job, we'll tell you which.",
    category: "How we work",
  },
  {
    status: "verified",
    slug: "work-within-budget",
    question: "Will you work within my budget?",
    answer:
      "Yes. We scope the plan to your budget rather than forcing a fixed package. If something isn't worth doing yet, we'll say so and suggest a better order.",
    category: "Pricing",
  },
  {
    status: "verified",
    slug: "how-long-until-results",
    question: "How long until I see results?",
    answer:
      "It depends on the work. Ads can show signal in weeks, SEO usually takes months, and retention builds over time. We'll give you a realistic range for your specific plan, not a fantasy figure.",
    category: "Timelines",
  },
  {
    status: "verified",
    slug: "who-owns-accounts",
    question: "Who owns the accounts and tools?",
    answer: "You do, always. Everything we set up is in your name, with billing under your control. Nothing is locked to us.",
    category: "Ownership",
  },
];
