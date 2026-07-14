import type { Roadmap } from "@/lib/content/types";

/**
 * Suggested roadmaps (Growth Guide pp.20-21). Rough sequences we'd follow for
 * common situations. Every plan gets tailored during discovery; this shows the
 * shape and order we'd work in.
 */
export const roadmaps: Roadmap[] = [
  {
    status: "verified",
    slug: "ecommerce",
    name: "Ecommerce Brand Roadmap",
    forBusinessTypeSlug: "ecommerce",
    intro: "The rough shape we'd follow for a product seller or D2C brand, tailored to your specifics during discovery.",
    phases: [
      {
        title: "Build the foundation",
        summary: "Store build or redesign, checkout, GA4 and pixels, and your core email flows.",
        stageSlug: "foundation",
        serviceSlugs: ["shopify-woocommerce-store-builds", "ga4-google-tag-manager-setup", "email-marketing-automation"],
        goalSlugs: ["launch-professional-store"],
      },
      {
        title: "Bring in and convert traffic",
        summary: "Paid ads and SEO to bring traffic, plus reviews, UGC, and retargeting to convert it.",
        stageSlug: "get-discovered",
        serviceSlugs: ["google-ads-search-shopping", "ecommerce-seo", "review-generation", "ugc-content-production", "retargeting-remarketing"],
        goalSlugs: ["make-ads-profitable", "get-found-on-google", "turn-visitors-into-buyers"],
      },
      {
        title: "Operate and retain",
        summary: "Fulfilment, returns, and support systems, then loyalty, SMS, and subscriptions to retain.",
        stageSlug: "deliver-operate",
        serviceSlugs: ["order-management", "shipping-integration", "customer-support-systems", "loyalty-program-setup", "sms-marketing"],
        goalSlugs: ["bring-customers-back"],
      },
      {
        title: "Scale with data and automation",
        summary: "Attribution, ongoing CRO, marketplaces, and automation as you scale.",
        stageSlug: "advocacy-growth",
        serviceSlugs: ["custom-dashboards-reporting", "cro-conversion-rate-optimization", "amazon-marketplace-management", "workflow-automation"],
        goalSlugs: ["understand-whats-working", "save-time-with-automation"],
      },
    ],
  },
  {
    status: "verified",
    slug: "creator",
    name: "Creator Roadmap",
    forBusinessTypeSlug: "creators",
    intro: "The rough shape we'd follow for an audience-first brand building toward monetisation.",
    phases: [
      {
        title: "Build the base",
        summary: "Personal brand, a simple site with email capture, and a repeatable content engine.",
        stageSlug: "foundation",
        serviceSlugs: ["brand-strategy-positioning", "website-design-development", "content-calendar-planning"],
        goalSlugs: ["grow-social-following"],
      },
      {
        title: "Grow one platform",
        summary: "Grow one main platform, add a lead magnet, and start a newsletter you own.",
        stageSlug: "get-discovered",
        serviceSlugs: ["social-media-growth-audit-strategy", "lead-magnet-design-creation", "newsletter-strategy-setup"],
        goalSlugs: ["grow-social-following"],
      },
      {
        title: "Monetise",
        summary: "Monetise with a course or membership, a launch funnel, and affiliate or sponsorship systems.",
        stageSlug: "convert",
        serviceSlugs: ["course-platform-setup", "digital-product-sales-page-design", "referral-affiliate-program-setup"],
        goalSlugs: ["sell-course-membership"],
      },
    ],
  },
  {
    status: "verified",
    slug: "service-local",
    name: "Service or Local Business Roadmap",
    forBusinessTypeSlug: "local-service",
    intro: "The rough shape we'd follow for a business built on leads and bookings, whether local, service-based, or B2B.",
    phases: [
      {
        title: "Get found locally",
        summary: "Site with local SEO and Google Business Profile, a lead form, and a CRM to catch enquiries.",
        stageSlug: "get-discovered",
        serviceSlugs: ["local-seo", "google-business-profile-setup", "crm-setup-integration"],
        goalSlugs: ["get-found-on-google", "get-leads-and-bookings"],
      },
      {
        title: "Turn enquiries into bookings",
        summary: "Lead-gen funnel and ads, online booking, and email or SMS nurture for new enquiries.",
        stageSlug: "convert",
        serviceSlugs: ["lead-gen-funnel-strategy-build", "google-ads-search-shopping", "email-marketing-automation"],
        goalSlugs: ["get-leads-and-bookings"],
      },
      {
        title: "Build reputation and efficiency",
        summary: "Reviews and reputation, automation for follow-up, and clear reporting on cost per lead.",
        stageSlug: "build-trust",
        serviceSlugs: ["review-generation", "workflow-automation", "custom-dashboards-reporting"],
        goalSlugs: ["understand-whats-working"],
      },
    ],
  },
  {
    status: "verified",
    slug: "established",
    name: "Established Brand Roadmap",
    forBusinessTypeSlug: "established",
    intro: "The rough shape we'd follow for an already-profitable brand ready to scale further.",
    phases: [
      {
        title: "Trust the numbers",
        summary: "Audit, clean tracking, and dashboards so decisions are based on trustworthy numbers.",
        stageSlug: "discovery-plan",
        serviceSlugs: ["analytics-tracking-audit", "ga4-google-tag-manager-setup", "custom-dashboards-reporting"],
        goalSlugs: ["understand-whats-working"],
      },
      {
        title: "Convert and retain harder",
        summary: "Conversion work and retention (loyalty, lifecycle), plus advocacy through referrals and partnerships.",
        stageSlug: "retain",
        serviceSlugs: ["cro-conversion-rate-optimization", "loyalty-program-setup", "retention-lifecycle-strategy", "referral-affiliate-program-setup"],
        goalSlugs: ["bring-customers-back"],
      },
      {
        title: "Automate and expand",
        summary: "Automation and AI where the process is stable, then new markets and marketplaces.",
        stageSlug: "advocacy-growth",
        serviceSlugs: ["workflow-automation", "ai-chatbots-customer-automation", "amazon-marketplace-management"],
        goalSlugs: ["save-time-with-automation"],
      },
    ],
  },
  {
    status: "verified",
    slug: "ads-not-profitable",
    name: "Fix the Leaks First Roadmap",
    forBusinessTypeSlug: "ecommerce",
    intro: "The rough shape we'd follow for a brand running ads that aren't paying back.",
    phases: [
      {
        title: "Fix the measurement",
        summary: "Audit the ads and fix measurement (GA4, server-side tracking, pixels) so the data is real.",
        stageSlug: "discovery-plan",
        serviceSlugs: ["analytics-tracking-audit", "ga4-google-tag-manager-setup"],
        goalSlugs: ["understand-whats-working"],
      },
      {
        title: "Fix the funnel and offer",
        summary: "Fix the funnel and offer: landing pages, conversion work, and cart recovery.",
        stageSlug: "convert",
        serviceSlugs: ["landing-page-design-build", "cro-conversion-rate-optimization"],
        goalSlugs: ["turn-visitors-into-buyers"],
      },
      {
        title: "Rebuild campaigns properly",
        summary: "Rebuild campaigns and retargeting, and judge success on payback and margin, not just ROAS.",
        stageSlug: "get-discovered",
        serviceSlugs: ["google-ads-search-shopping", "retargeting-remarketing"],
        goalSlugs: ["make-ads-profitable"],
      },
    ],
  },
  {
    status: "verified",
    slug: "needs-automation",
    name: "Save Time, Drop Fewer Balls Roadmap",
    forBusinessTypeSlug: "established",
    intro: "The rough shape we'd follow for a brand that needs to automate repetitive work.",
    phases: [
      {
        title: "Map the repetitive work",
        summary: "Map the repetitive work and pick the right tools (CRM, Zapier or Make).",
        stageSlug: "discovery-plan",
        serviceSlugs: ["crm-setup-integration"],
        goalSlugs: ["save-time-with-automation"],
      },
      {
        title: "Build the automations",
        summary: "Build the automations (lead routing, email and SMS, chatbots) with human checks in place.",
        stageSlug: "deliver-operate",
        serviceSlugs: ["workflow-automation", "ai-chatbots-customer-automation", "email-marketing-automation"],
        goalSlugs: ["save-time-with-automation"],
      },
      {
        title: "Layer in AI carefully",
        summary: "Layer in AI for support, content, and reporting, and monitor that it stays accurate.",
        stageSlug: "retain",
        serviceSlugs: ["ai-chatbots-customer-automation", "custom-dashboards-reporting"],
        goalSlugs: ["save-time-with-automation"],
      },
    ],
  },
  {
    status: "verified",
    slug: "brand-new",
    name: "From Zero Roadmap",
    forBusinessTypeSlug: "beginner",
    intro: "The rough shape we'd follow for a brand new business that's still just an idea.",
    phases: [
      {
        title: "Validate and launch",
        summary: "Validate the offer, sort brand basics, and launch a simple site or store with tracking and legal pages.",
        stageSlug: "foundation",
        serviceSlugs: ["brand-strategy-positioning", "website-design-development", "ga4-google-tag-manager-setup", "privacy-policy-cookie-consent"],
        goalSlugs: ["launch-professional-store"],
      },
      {
        title: "Pick one channel",
        summary: "Pick one channel to start (SEO or ads), add lead capture and a basic funnel.",
        stageSlug: "get-discovered",
        serviceSlugs: ["ecommerce-seo", "google-ads-search-shopping", "lead-magnet-design-creation"],
        goalSlugs: ["get-found-on-google", "make-ads-profitable"],
      },
      {
        title: "Read the data and add a second channel",
        summary: "Read the data, fix the weakest step, then add a second channel once the first works.",
        stageSlug: "convert",
        serviceSlugs: ["analytics-tracking-audit", "cro-conversion-rate-optimization"],
        goalSlugs: ["understand-whats-working"],
      },
    ],
  },
];
