import { supportEmail } from "@/lib/forms/config";

/**
 * Contact presentation content — the repeated, server-safe data for /contact.
 *
 * These were route-local constants (TRUST / STEPS and the two alternative paths) in
 * app/(convert)/contact/page.tsx. Moved here VERBATIM (no copy changed) so the page framing and the
 * design preview read from one typed source. Icons are string names (resolved by the shared `Icon`
 * primitive) so the data is reusable by Server Components; `tone` carries a legacy wayfinding token
 * mapped to an accessible V2 ink at presentation time (never a raw colour).
 *
 * This module holds ONLY presentation data. Field labels, validation copy, API messages and the
 * form's success/failure state copy stay with the form contract (ContactForm / the API route) — they
 * are behaviour-bound, not repeated presentation. The decorative globe pins/hub of the old hero have
 * no V2 replacement and are intentionally not carried over.
 */

export type ContactTrustPoint = {
  /** The exact trust line. */
  label: string;
  /** Shared icon name (see primitives/Icon). */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  tone: string;
};

export type ContactProcessStep = {
  order: number;
  title: string;
  body: string;
  icon: string;
};

export type ContactAlternativePath = {
  title: string;
  body: string;
  /** Destination — an internal path or a mailto: URL. */
  href: string;
  icon: string;
  tone: string;
  /** True for an off-site / mailto destination. */
  external?: boolean;
};

/** Four trust points, in source order (a small domain spectrum). */
export const contactTrustPoints: ContactTrustPoint[] = [
  { label: "Clear, practical advice, not a sales pitch", icon: "message-square", tone: "var(--domain-strategy)" },
  { label: "A real person reads every message", icon: "users", tone: "var(--domain-discover)" },
  { label: "Your details stay private, never sold", icon: "shield", tone: "var(--domain-operate)" },
  { label: "No pressure and no obligation", icon: "heart", tone: "var(--domain-retain)" },
];

/** What happens after you send — three steps, in source order. */
export const contactProcessSteps: ContactProcessStep[] = [
  {
    order: 1,
    title: "You send a few details",
    body: "Your situation and what you'd like to achieve, in as much or as little detail as you like.",
    icon: "pen-tool",
  },
  {
    order: 2,
    title: "A person reviews it",
    body: "Someone here reads your message properly and looks at what you've described. Not a bot, not an auto-responder.",
    icon: "search",
  },
  {
    order: 3,
    title: "You get a practical reply",
    body: "One clear next step for your situation, by email. If we're not the right fit, we'll say so and point you somewhere better.",
    icon: "mail",
  },
];

/** Preferred alternative ways to start — email (derived from supportEmail) and the growth plan. */
export const contactAlternativePaths: ContactAlternativePath[] = [
  {
    title: "Email us directly",
    body: "Prefer your own inbox? Write to us and the same real person will reply.",
    href: `mailto:${supportEmail}`,
    icon: "mail",
    tone: "var(--domain-operate)",
    external: true,
  },
  {
    title: "Build a growth plan",
    body: "Answer a few guided questions and get a structured starting point: what to do first, and what can wait.",
    href: "/growth-plan",
    icon: "compass",
    tone: "var(--domain-strategy)",
  },
];

/** The closing, exploratory-conversation reassurance (verbatim). */
export const contactClosingNote =
  "The first conversation is exploratory. It's there to help you understand your options, not to sign you up to anything.";
