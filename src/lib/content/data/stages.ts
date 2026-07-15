import type { GrowthStage } from "@/lib/content/types";

/**
 * The 8-stage Online Growth Journey (Growth Guide p.3). Names are locked exactly —
 * do not rename. Every business moves through the same order, even if a project
 * only touches one or two stages at a time.
 */
export const stages: GrowthStage[] = [
  {
    status: "verified",
    order: 1,
    slug: "discovery-plan",
    name: "Discovery & Plan",
    summary:
      "Working out the goal, auditing what's already in place, and turning it into a clear roadmap and budget.",
    whatHappens:
      "We learn your business, goals, and current setup, then turn that into a written plan with a realistic budget and sequence of work.",
    outcome: "A clear roadmap that tells you what to do first, and why.",
    color: "var(--violet)",
    icon: "compass",
    serviceSlugs: [
      "discovery-requirements-workshop",
      "website-technical-audit",
      "seo-audit",
      "analytics-tracking-audit",
    ],
  },
  {
    status: "verified",
    order: 2,
    slug: "foundation",
    name: "Foundation",
    summary: "Brand, website or store, hosting, tracking, and the legal basics. The base everything else sits on.",
    whatHappens:
      "We build or tidy up the brand, the site or store itself, hosting, analytics, and the legal pages every business needs before it markets itself.",
    outcome: "A working, trackable base that's ready to have traffic sent to it.",
    color: "var(--blue)",
    icon: "layout",
    serviceSlugs: [
      "website-design-development",
      "shopify-woocommerce-store-builds",
      "brand-strategy-positioning",
      "brand-identity-logo-design",
      "ga4-google-tag-manager-setup",
      "privacy-policy-cookie-consent",
    ],
  },
  {
    status: "verified",
    order: 3,
    slug: "get-discovered",
    name: "Get Discovered",
    summary: "SEO, content, social, video, ads, and marketplaces, so the right people can actually find you.",
    whatHappens:
      "We put you in front of people already looking for what you offer, through search, content, social, video, ads, and marketplaces.",
    outcome: "A steady, growing stream of the right kind of visitor.",
    color: "var(--cyan)",
    icon: "search",
    serviceSlugs: [
      "technical-seo",
      "on-page-seo",
      "local-seo",
      "ecommerce-seo",
      "google-ads-search-shopping",
      "social-media-management",
      "geo-generative-engine-optimization",
    ],
  },
  {
    status: "verified",
    order: 4,
    slug: "build-trust",
    name: "Build Trust",
    summary: "Proof, reviews, comparisons, FAQs, and lead capture that help a visitor feel confident choosing you.",
    whatHappens:
      "We add the proof and reassurance a new visitor needs, reviews, clear answers to common questions, and comparisons that help them choose confidently.",
    outcome: "Visitors who feel confident enough to take the next step.",
    color: "var(--lime)",
    icon: "shield",
    serviceSlugs: [
      "ugc-content-production",
      "review-generation",
      "design-assets-marketing-collateral",
      "accessibility-compliance-wcag",
      "pr-media-relations",
    ],
  },
  {
    status: "verified",
    order: 5,
    slug: "convert",
    name: "Convert",
    summary: "Funnels, checkout, booking, and conversion work that turn interest into sales, calls, or sign-ups.",
    whatHappens:
      "We build and refine the funnels, checkout, and booking flow that turn an interested visitor into a sale, a call, or a sign-up.",
    outcome: "A higher share of visitors actually taking action.",
    color: "var(--orange)",
    icon: "target",
    serviceSlugs: [
      "landing-page-design-build",
      "cro-conversion-rate-optimization",
      "lead-gen-funnel-strategy-build",
      "sales-funnel-design-development",
      "ab-testing-experimentation",
      "social-commerce",
    ],
  },
  {
    status: "verified",
    order: 6,
    slug: "deliver-operate",
    name: "Deliver & Operate",
    summary: "Fulfilment, returns, subscriptions, and support systems that keep customers happy after they buy.",
    whatHappens:
      "We set up the operational systems, fulfilment, returns, subscriptions, and support, that keep a customer happy once they've bought.",
    outcome: "Orders and enquiries handled smoothly, without manual chaos behind the scenes.",
    color: "var(--pink)",
    icon: "workflow",
    serviceSlugs: [
      "inventory-management-setup",
      "order-management",
      "shipping-integration",
      "customer-support-systems",
      "workflow-automation",
      "website-maintenance-updates",
    ],
  },
  {
    status: "verified",
    order: 7,
    slug: "retain",
    name: "Retain",
    summary: "Email, SMS, loyalty, and lifecycle work that brings people back and grows what each customer is worth.",
    whatHappens:
      "We build the email, SMS, and loyalty systems that bring customers back and grow what each one is worth over time.",
    outcome: "More repeat orders, and a higher value from each customer relationship.",
    color: "var(--violet-bright)",
    icon: "heart",
    serviceSlugs: [
      "email-marketing-automation",
      "sms-marketing",
      "retention-lifecycle-strategy",
      "loyalty-program-setup",
      "custom-dashboards-reporting",
    ],
  },
  {
    status: "verified",
    order: 8,
    slug: "advocacy-growth",
    name: "Advocacy & Growth",
    summary: "Referrals, affiliates, reviews, and partnerships that turn happy customers into a growth channel.",
    whatHappens:
      "We turn happy customers into a growth channel of their own, through referrals, affiliates, reviews, and partnerships.",
    outcome: "New customers who arrive already trusting you, at a lower cost than paid channels alone.",
    color: "var(--violet-deep)",
    icon: "megaphone",
    serviceSlugs: [
      "referral-affiliate-program-setup",
      "review-generation",
      "pr-media-relations",
      "custom-dashboards-reporting",
    ],
  },
];
