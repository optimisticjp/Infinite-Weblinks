import type { ConnectedExample } from "@/lib/content/types";

/**
 * "See what works together" (ref 16) — simple, honest combinations built around a clear
 * business goal. No results, percentages or client names: these describe *what connects*,
 * not what it delivered. The service chips are plain-text areas we can connect, never
 * presented as products, partners or clients (brief §14, §23).
 */
export const connectedExamples: ConnectedExample[] = [
  {
    slug: "turn-visitors-into-customers",
    title: "Turn visitors into customers",
    summary:
      "Improve the store, the tracking and the advertising together, so more of the people who arrive actually complete a purchase.",
    goalHint: "Sell more products",
    services: ["Store & checkout", "Conversion", "Paid ads"],
    color: "var(--pink)",
    theme: "dark",
    featured: true,
  },
  {
    slug: "know-which-marketing-works",
    title: "Know which marketing works",
    summary:
      "Connect your website, analytics and advertising into one clear view, so you can see what earns money and what to stop.",
    goalHint: "Understand what works",
    services: ["Analytics", "Tracking setup", "Reporting"],
    color: "var(--cyan)",
    theme: "dark",
  },
  {
    slug: "bring-in-qualified-leads",
    title: "Bring in qualified leads",
    summary:
      "Advertising sends interested people to a focused page built to capture enquiries and pass them straight to your team.",
    goalHint: "Get more enquiries",
    services: ["Search ads", "Landing pages", "CRM"],
    color: "var(--violet)",
    theme: "band",
  },
  {
    slug: "build-repeat-sales",
    title: "Build repeat sales",
    summary:
      "Automated email, messaging and loyalty bring previous customers back, so each first sale is worth more over time.",
    goalHint: "Bring customers back",
    services: ["Email & SMS", "Loyalty", "Automation"],
    color: "var(--orange)",
    theme: "band",
  },
  {
    slug: "grow-through-short-form",
    title: "Grow through short-form content",
    summary:
      "Regular short videos and paid promotion help the right people find your brand and remember it.",
    goalHint: "Reach more people",
    services: ["Short-form video", "Content", "Social ads"],
    color: "var(--blue)",
    theme: "band",
  },
  {
    slug: "save-time-on-repetitive-work",
    title: "Save time on repetitive work",
    summary:
      "Automation and AI handle the routine steps, so your team spends its time on the work that actually needs a person.",
    goalHint: "Save time",
    services: ["Workflow automation", "CRM", "AI assistance"],
    color: "var(--lime)",
    theme: "dark",
  },
];
