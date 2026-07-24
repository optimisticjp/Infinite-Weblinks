import type { AccountOwnership } from "@/lib/content/types";

/**
 * "Your digital world, owned by you" (ref 13). The load-bearing ownership promise: we build and
 * connect everything in your name, with clear access and documentation, so you aren't locked in.
 * These are BUSINESS-POLICY COMMITMENTS that require owner confirmation before launch (see the public
 * claims register + the release blockers) — NOT repo-verifiable facts, and not merely a "brand
 * principle" that exempts them from review. Absolute adverbs ("at all times", "always") were softened
 * to accurate non-absolute wording; the core proposition (built in your name, no lock-in) is retained.
 * "Agency" appears only as the thing we are NOT (brief: never use the word for ourselves).
 */
export const accountOwnership: AccountOwnership = {
  eyebrow: "Your digital world, owned by you",
  heading: {
    pre: "Your business should never be ",
    accent: "locked in",
    post: ".",
  },
  body: "We build and connect your digital systems in your name, with clear access, documented ownership and a setup your business can keep using.",
  vaultLabel: "Your business",
  assets: [
    { label: "Brand", icon: "star" },
    { label: "Website", icon: "monitor" },
    { label: "Customer data", icon: "users" },
    { label: "Analytics", icon: "bar-chart-3" },
    { label: "Content", icon: "folder" },
    { label: "Accounts", icon: "shield" },
    { label: "Automations", icon: "settings" },
    { label: "Documentation", icon: "book-open" },
  ],
  flow: [
    { label: "Plan", icon: "target", color: "var(--violet)" },
    { label: "Build", icon: "layout", color: "var(--blue)" },
    { label: "Connect", icon: "git-branch", color: "var(--pink)" },
    { label: "Support", icon: "heart", color: "var(--orange)" },
  ],
  guarantees: [
    {
      title: "Your accounts",
      body: "Everything is created in your business name, from the website to the ad accounts.",
      icon: "shield",
      color: "var(--cyan)",
    },
    {
      title: "Your data",
      body: "Your customer information and analytics stay under your control.",
      icon: "database",
      color: "var(--violet)",
    },
    {
      title: "Your future",
      body: "Continue with us, bring the work in-house, or move on. The choice is yours.",
      icon: "compass",
      color: "var(--orange)",
    },
  ],
  closing: {
    pre: "We help build the system. ",
    accent: "You keep control",
    post: " of it.",
  },
  primaryCta: { label: "Build my growth plan", route: "/growth-plan", style: "primary" },
  secondaryCta: { label: "See How We Work Together", route: "/how-it-works", style: "secondary" },
};
