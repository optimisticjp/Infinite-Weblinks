/**
 * Service-domain page configs. Each entry turns a service category into a Constellation
 * "domain" page via the reusable ServiceDomainTemplate: one hue used everywhere, a plain
 * definition, the growth-journey stage it owns, honest outcomes, the full service list
 * grouped into bento clusters, the downstream stages it feeds, who it's for, and the next
 * domain in the journey. Adding a new domain page is a config entry here, nothing more.
 *
 * Services are referenced by slug; the template pulls the live service data (name, delivery
 * model, tools) from content and applies the rewritten one-line copy below. Any service in
 * the category that isn't placed in a cluster falls into a "more in this domain" cluster, so
 * a config can never silently drop a service.
 */

export type DomainCluster = {
  key: string;
  heading: string;
  intro: string;
  /** Service slugs in this cluster, in display order. The first is shown as the featured tile. */
  serviceSlugs: string[];
};

export type DomainOutcome = { title: string; body: string; icon: string };

export type DomainConfig = {
  /** Service category slug this domain maps to. */
  slug: string;
  /** The single domain hue, e.g. "var(--domain-strategy)". Everything on the page uses it. */
  hue: string;
  /** Plain one-line definition of what this domain does (hero subhead). */
  definition: string;
  /** The growth-journey stage slug this domain owns (lights up in the StageMarker). */
  stageSlug: string;
  /** Two or three honest outcome lines. */
  outcomes: DomainOutcome[];
  /** Bento clusters that group the full service list. */
  clusters: DomainCluster[];
  /** Optional short one-line rewrite per service slug (kept accurate). */
  serviceCopy?: Record<string, string>;
  /** Downstream steps this domain feeds, for the "how this connects" strip. */
  connectsTo: { label: string; body: string; hue: string; icon: string }[];
  /** Who it's for. */
  forWho: string;
  /** Situations where this domain is the priority. */
  when: string[];
  /** The next domain in the journey, rendered in its own hue. */
  next: { slug: string; name: string; hue: string };
};

const STRATEGY: DomainConfig = {
  slug: "strategy-discovery",
  hue: "var(--domain-strategy)",
  definition:
    "Work out what you actually need before anything gets built, and check what you already have, so the plan that follows is grounded in reality.",
  stageSlug: "discovery-plan",
  outcomes: [
    {
      title: "A plan you understand",
      body: "You'll know what to do first, what to connect next, and why, in plain English.",
      icon: "compass",
    },
    {
      title: "Effort spent on the right things",
      body: "No building the wrong thing first. We start from facts about your setup, not assumptions.",
      icon: "target",
    },
    {
      title: "A base for clean decisions",
      body: "Trustworthy numbers and a clear picture, so every choice after this is easier to make.",
      icon: "bar-chart-3",
    },
  ],
  clusters: [
    {
      key: "direction",
      heading: "Set the direction",
      intro: "Decide what to build and in what order, before spending on anything.",
      serviceSlugs: ["discovery-requirements-workshop"],
    },
    {
      key: "audit",
      heading: "Check what you already have",
      intro: "Honest audits of your current setup, so the plan builds on facts rather than guesses.",
      serviceSlugs: ["website-technical-audit", "seo-audit", "analytics-tracking-audit"],
    },
  ],
  serviceCopy: {
    "discovery-requirements-workshop":
      "A working session that maps your goals, audience and current setup, so the plan is built on what you actually need.",
    "website-technical-audit":
      "A full technical read of your current site or store: speed, structure, mobile, and anything quietly holding it back.",
    "seo-audit":
      "A clear picture of how you show up in search today, what's missing, and where the easiest wins are.",
    "analytics-tracking-audit":
      "A check of what's really being tracked, so you know the numbers can be trusted before you plan on top of them.",
  },
  connectsTo: [
    {
      label: "Build and launch",
      body: "The plan tells the build what to make first.",
      hue: "var(--domain-build)",
      icon: "monitor",
    },
    {
      label: "Get discovered",
      body: "It points the traffic work at the right people.",
      hue: "var(--domain-discover)",
      icon: "search",
    },
    {
      label: "Everything after",
      body: "Convert, deliver and retain all follow the same plan.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
  ],
  forWho:
    "Every kind of business, from someone just starting out to an established brand that wants an unbiased read of where they really are.",
  when: [
    "You're about to invest in a website, ads or new tools and want to spend on the right things.",
    "Something online isn't working and you want an honest read of why.",
    "You've grown past guesswork and need numbers you can actually trust.",
  ],
  next: { slug: "websites-development", name: "Websites & Development", hue: "var(--domain-build)" },
};

const CONFIGS: Record<string, DomainConfig> = {
  [STRATEGY.slug]: STRATEGY,
};

/** The domain-page config for a category slug, or undefined if it hasn't been set up yet. */
export function getServiceDomainConfig(slug: string): DomainConfig | undefined {
  return CONFIGS[slug];
}
