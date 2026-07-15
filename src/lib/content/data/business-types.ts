import type { BusinessType } from "@/lib/content/types";

/**
 * Business types / audiences (Growth Guide p.2 "who this guide is for", plus the
 * roadmap situations on pp.20-21). Each links to the roadmap we'd default to
 * suggesting, though every plan is tailored during discovery.
 */
export const businessTypes: BusinessType[] = [
  {
    status: "verified",
    slug: "ecommerce",
    name: "Ecommerce Brands",
    summary: "Selling products online, or moving from a marketplace to your own store.",
    description:
      "You care about traffic, conversion, fulfilment, and repeat orders. Whether you're launching a first store or already selling, the work tends to follow the same order: a solid store, then traffic, then conversion, then retention.",
    goalSlugs: [
      "launch-professional-store",
      "get-found-on-google",
      "make-ads-profitable",
      "turn-visitors-into-buyers",
      "bring-customers-back",
    ],
    roadmapSlug: "ecommerce",
    icon: "shopping-bag",
    color: "var(--lime)",
  },
  {
    status: "verified",
    slug: "creators",
    name: "Creators",
    summary: "Building an audience and turning it into income.",
    description:
      "Through content, email, courses, memberships, and sponsorships. The path usually starts with a simple site and one platform, then adds a newsletter you actually own before monetising further.",
    goalSlugs: ["grow-social-following", "sell-course-membership", "bring-customers-back"],
    roadmapSlug: "creator",
    icon: "play",
    color: "var(--pink)",
  },
  {
    status: "verified",
    slug: "local-service",
    name: "Local & Service Businesses",
    summary: "Local or service businesses that need leads and bookings.",
    description:
      "A site that earns its keep, local search visibility, a lead form, and a CRM that catches every enquiry, then a way to turn them into bookings without things slipping through the cracks.",
    goalSlugs: ["get-leads-and-bookings", "get-found-on-google", "understand-whats-working"],
    roadmapSlug: "service-local",
    icon: "users",
    color: "var(--orange)",
  },
  {
    status: "verified",
    slug: "b2b",
    name: "B2B Businesses",
    summary: "Businesses selling to other businesses, where leads and a proper CRM matter most.",
    description:
      "Longer sales cycles and fewer, higher-value leads change what's worth doing first. The work usually centres on a site that earns its keep, a CRM that tracks the pipeline properly, and lead generation that doesn't waste the sales team's time.",
    goalSlugs: ["get-leads-and-bookings", "understand-whats-working", "save-time-with-automation"],
    roadmapSlug: "service-local",
    icon: "layers",
    color: "var(--blue)",
  },
  {
    status: "verified",
    slug: "software",
    name: "Software Companies",
    summary: "Software and product companies that need a site, a pipeline, and repeatable processes.",
    description:
      "A site and funnel that explain the product clearly, a CRM that tracks trials and accounts properly, and automation that keeps the repetitive parts of onboarding and support from eating the team's time.",
    goalSlugs: ["get-leads-and-bookings", "save-time-with-automation", "understand-whats-working"],
    roadmapSlug: "service-local",
    icon: "git-branch",
    color: "var(--violet)",
  },
  {
    status: "verified",
    slug: "established",
    name: "Established Brands Ready to Scale",
    summary: "Already profitable, and ready to push further.",
    description:
      "The foundations work. The next gains usually come from trustworthy data, tighter retention and advocacy, and automation applied where the process is already stable, plus new channels once those are solid.",
    goalSlugs: ["understand-whats-working", "bring-customers-back", "make-ads-profitable", "save-time-with-automation"],
    roadmapSlug: "established",
    icon: "trending-up",
    color: "var(--violet-deep)",
  },
  {
    status: "verified",
    slug: "beginner",
    name: "Brand New, Still an Idea",
    summary: "Nothing built yet, just an idea you want to get right.",
    description:
      "Validate the offer, sort the brand basics, and launch something simple with tracking and the legal pages in place, before picking a single channel to prove the idea works.",
    goalSlugs: ["launch-professional-store", "get-found-on-google", "get-leads-and-bookings"],
    roadmapSlug: "brand-new",
    icon: "rocket",
    color: "var(--cyan)",
  },
];
