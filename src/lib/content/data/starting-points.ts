import type { StartingPoint } from "@/lib/content/types";

/**
 * "Where are you right now?" rows (Growth Guide p.4). Most brands sit in more
 * than one row, and that's normal. Guide's original CTA ("that's what the
 * discovery call is for") is superseded by the locked, email-led primary CTA.
 */
const BUILD_PLAN_CTA = { label: "Build My Digital Growth Plan", route: "/growth-plan", style: "primary" as const };

export const startingPoints: StartingPoint[] = [
  {
    status: "verified",
    slug: "nothing-built-yet",
    label: "Just starting, nothing built yet",
    situation: "You have an idea but haven't built or launched anything.",
    recommendation: "Begin at Discovery & Plan and Foundation. We validate the idea, then build the brand, site, and tracking.",
    recommendedStageSlug: "discovery-plan",
    cta: BUILD_PLAN_CTA,
    icon: "compass",
    color: "var(--violet)",
  },
  {
    status: "verified",
    slug: "idea-no-website",
    label: "I have an idea but no website",
    situation: "The idea is clear, but nothing is built yet.",
    recommendation: "Start at Foundation. A site or store, hosting, and tracking, ready to sell and measure.",
    recommendedStageSlug: "foundation",
    cta: BUILD_PLAN_CTA,
    icon: "layout",
    color: "var(--blue)",
  },
  {
    status: "verified",
    slug: "website-no-traffic",
    label: "I have a website but no traffic",
    situation: "The site is live, but almost nobody is finding it.",
    recommendation: "Move to Get Discovered. SEO, content, social, or ads to bring the right people in.",
    recommendedStageSlug: "get-discovered",
    cta: BUILD_PLAN_CTA,
    icon: "search",
    color: "var(--cyan)",
  },
  {
    status: "verified",
    slug: "traffic-few-sales",
    label: "I have traffic but few sales",
    situation: "Visitors are arriving, but not many are buying or enquiring.",
    recommendation: "Focus on Build Trust & Convert. Proof, better pages, funnels, and conversion work.",
    recommendedStageSlug: "build-trust",
    cta: BUILD_PLAN_CTA,
    icon: "shield",
    color: "var(--lime)",
  },
  {
    status: "verified",
    slug: "sales-but-chaotic",
    label: "I'm getting sales but it's chaotic",
    situation: "Orders are coming in, but fulfilment, support, and follow-up feel unmanaged.",
    recommendation: "Time for Deliver & Retain. Ops systems, support, email, SMS, and loyalty.",
    recommendedStageSlug: "deliver-operate",
    cta: BUILD_PLAN_CTA,
    icon: "workflow",
    color: "var(--pink)",
  },
  {
    status: "verified",
    slug: "running-ads-unprofitable",
    label: "I run ads but they're not profitable",
    situation: "Spend is going out, but the return doesn't add up.",
    recommendation: "Start with an audit and clean tracking, then fix the funnel and offer before spending more.",
    recommendedStageSlug: "convert",
    cta: BUILD_PLAN_CTA,
    icon: "gauge",
    color: "var(--orange)",
  },
  {
    status: "verified",
    slug: "established-want-to-scale",
    label: "I'm established and want to scale",
    situation: "The business already works, and you want to push further.",
    recommendation: "Push on Retention, Advocacy, Automation, and Data, plus new channels and markets.",
    recommendedStageSlug: "retain",
    cta: BUILD_PLAN_CTA,
    icon: "heart",
    color: "var(--violet-bright)",
  },
  {
    status: "verified",
    slug: "want-to-automate",
    label: "I want to automate and save time",
    situation: "The process works, but too much of it is manual and repetitive.",
    recommendation: "Head to AI & Automation, once the process behind it is stable enough to automate.",
    recommendedStageSlug: "deliver-operate",
    cta: BUILD_PLAN_CTA,
    icon: "zap",
    color: "var(--violet-deep)",
  },
];
