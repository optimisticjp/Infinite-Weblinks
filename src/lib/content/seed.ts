import type { EditorialSection, HeroContent, SiteChrome } from "./types";

/**
 * Seed content for the homepage opening. This is the *approved* copy from the locked
 * brief (§8, §9, §23) and Growth Guide, rendered from local data until a Sanity
 * project is provisioned. Official stage/system/model names and CTA routes are used
 * exactly. No unverified metrics, testimonials, client names or phone numbers.
 */

const BUILD_PLAN = { label: "Build My Digital Growth Plan", route: "/growth-plan", style: "primary" as const };
const SEE_HOW = { label: "See How It All Works", route: "/how-it-works", style: "secondary" as const };

export const seedChrome: SiteChrome = {
  nav: {
    primary: [
      // Thesis first (Phase 3): the brand is built around your goals, so the goals
      // router leads the nav. A plain link — the /goals page is itself the router, so
      // there's no dropdown to duplicate its three facets.
      { label: "Your goal", href: "/goals" },
      {
        label: "How It Works",
        href: "/how-it-works",
        megaMenu: {
          title: "How It Works",
          columns: [
            {
              heading: "The growth journey",
              items: [
                // The label promises eight stages, so list all eight — each renders an
                // anchor on /how-it-works — with the hub itself as the overview.
                { label: "The 8-stage journey", href: "/how-it-works", description: "One connected path, start to scale" },
                { label: "Discovery & Plan", href: "/how-it-works#discovery-plan" },
                { label: "Foundation", href: "/how-it-works#foundation" },
                { label: "Get Discovered", href: "/how-it-works#get-discovered" },
                { label: "Build Trust", href: "/how-it-works#build-trust" },
                { label: "Convert", href: "/how-it-works#convert" },
                { label: "Deliver & Operate", href: "/how-it-works#deliver-operate" },
                { label: "Retain", href: "/how-it-works#retain" },
                { label: "Advocacy & Growth", href: "/how-it-works#advocacy-growth" },
              ],
            },
            {
              heading: "Runs across everything",
              items: [
                { label: "AI & Automation", href: "/how-it-works#ai-automation" },
                { label: "Analytics & Data", href: "/how-it-works#analytics-data" },
                { label: "Maintenance & Scale", href: "/how-it-works#maintenance-scale" },
              ],
            },
            {
              heading: "How we deliver",
              items: [
                // Each delivery-model card on /how-it-works carries id=delivery-<key>, so
                // each link lands on its own card instead of all four sharing #delivery.
                { label: "We Do the Work", href: "/how-it-works#delivery-we-do" },
                { label: "We Bring In an Expert", href: "/how-it-works#delivery-we-expert" },
                { label: "We Run It End to End", href: "/how-it-works#delivery-we-run" },
                { label: "You Run It After", href: "/how-it-works#delivery-you-run" },
              ],
            },
          ],
          promo: {
            heading: "Not sure where to start?",
            body: "Answer a few questions and we'll map the smallest next step that moves you forward.",
            cta: BUILD_PLAN,
          },
        },
      },
      // Solutions retired (Phase 2): the /solutions hub was indistinguishable from
      // /services and the homepage goal explorer does outcome-slicing better. Its
      // destinations all stay — by goal lives on the homepage goal router (→ /goals/<slug>),
      // and by business type / by where you are move into Resources → Plan below, pointing
      // straight at their real index pages instead of a redundant hub.
      {
        label: "Services",
        href: "/services",
        megaMenu: {
          title: "Services",
          // The 16 real service categories on /services, each an anchor (id={category.slug}),
          // grouped into the four growth phases from the reference mega-menu (ref 03):
          // Build your foundation / Get discovered / Convert & retain / Operate & scale.
          // Icons are decorative; every href resolves to a real category page.
          columns: [
            {
              heading: "Build your foundation",
              items: [
                { label: "Strategy & Discovery", href: "/services/strategy-discovery", icon: "compass" },
                { label: "Branding & Design", href: "/services/branding-design", icon: "pen-tool" },
                { label: "Websites & Development", href: "/services/websites-development", icon: "monitor" },
                { label: "Funnels & Conversion", href: "/services/funnels-conversion", icon: "git-branch" },
              ],
            },
            {
              heading: "Get discovered",
              items: [
                { label: "SEO & Content", href: "/services/seo-content", icon: "search" },
                { label: "Paid Ads", href: "/services/paid-ads", icon: "megaphone" },
                { label: "Social Media", href: "/services/social-media", icon: "share-2" },
                { label: "Social Growth", href: "/services/social-growth", icon: "trending-up" },
              ],
            },
            {
              heading: "Convert & retain",
              items: [
                { label: "Email, SMS & CRM", href: "/services/email-sms-crm", icon: "mail" },
                { label: "Retention, Loyalty & Advocacy", href: "/services/retention-loyalty-advocacy", icon: "heart" },
                { label: "Courses & Memberships", href: "/services/courses-memberships", icon: "book-open" },
                { label: "Marketplaces & More", href: "/services/marketplaces-more", icon: "shopping-bag" },
              ],
            },
            {
              heading: "Operate & scale",
              items: [
                { label: "Ecommerce Ops & Delivery", href: "/services/ecommerce-ops-delivery", icon: "settings" },
                { label: "AI & Automation", href: "/services/ai-automation", icon: "zap" },
                { label: "Analytics & Data", href: "/services/analytics-data", icon: "bar-chart-3" },
                { label: "Security, Maintenance & Compliance", href: "/services/security-maintenance-compliance", icon: "shield" },
              ],
            },
          ],
          promo: {
            heading: "Everything works better when it's connected",
            body: "Pick one service or connect them all around your goals — we plan the order so each part strengthens the next.",
            cta: BUILD_PLAN,
          },
        },
      },
      {
        label: "Resources",
        href: "/resources",
        megaMenu: {
          title: "Resources",
          columns: [
            {
              heading: "Learn",
              items: [
                { label: "Guides & articles", href: "/learn" },
                { label: "How everything connects", href: "/how-it-works" },
              ],
            },
            {
              heading: "Plan",
              items: [
                { label: "Business roadmaps", href: "/roadmaps" },
                { label: "Tool Universe", href: "/tools" },
                // "By business type" / "By where you are" are now facets of the goals
                // router — reached from the "Your goal" nav item, not duplicated here.
              ],
            },
            {
              heading: "Answers",
              items: [{ label: "FAQ", href: "/faq" }],
            },
          ],
        },
      },
      { label: "About Us", href: "/about" },
    ],
    ctas: [SEE_HOW, BUILD_PLAN],
  },
  footer: {
    supportEmail: "support@infiniteweblinks.com",
    tagline: "Digital growth, built around your goals.",
    columns: [
      {
        heading: "Start here",
        links: [
          { label: "How It Works", href: "/how-it-works" },
          { label: "Explore by goal", href: "/goals" },
          { label: "Build My Growth Plan", href: "/growth-plan" },
          { label: "Growth Troubleshooter", href: "/troubleshooter" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        heading: "Services",
        links: [
          { label: "Websites & Development", href: "/services/websites-development" },
          { label: "SEO & Content", href: "/services/seo-content" },
          { label: "Paid Ads", href: "/services/paid-ads" },
          { label: "AI & Automation", href: "/services/ai-automation" },
          { label: "All services", href: "/services" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "Guides & articles", href: "/learn" },
          { label: "Business roadmaps", href: "/roadmaps" },
          { label: "Tool Universe", href: "/tools" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Resources hub", href: "/resources" },
          { label: "Accessibility", href: "/accessibility" },
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
    // Hidden until a valid URL exists (brief §23) — none rendered at launch.
    social: [
      { platform: "Facebook" },
      { platform: "Instagram" },
      { platform: "YouTube" },
      { platform: "Pinterest" },
    ],
  },
};

export const seedHero: HeroContent = {
  eyebrow: "Digital Growth Partner",
  slogan: "Digital growth, built around your goals.",
  headline: {
    pre: "A smarter way to plan and ",
    accent: "grow",
    post: " your business online.",
  },
  support:
    "We help you choose the right digital tools and services, build what you need, and make everything work together around your goals.",
  reassurance: "Start from where you are. We will help you understand what comes next.",
  primaryCta: BUILD_PLAN,
  secondaryCta: SEE_HOW,
  // Five primary connected domains. Search + social fold into "Marketing"; AI is a
  // secondary connection in the hero visual (a dim waypoint), never a sixth bright
  // node — the mark, not the count, carries the "everything connects" idea.
  areas: [
    { key: "website", label: "Website", color: "var(--domain-website)", icon: "monitor" },
    { key: "marketing", label: "Marketing", color: "var(--domain-social)", icon: "megaphone" },
    { key: "customer", label: "Customer Tools", color: "var(--domain-customer)", icon: "users" },
    { key: "automation", label: "Automation", color: "var(--domain-automation)", icon: "workflow" },
    { key: "analytics", label: "Analytics", color: "var(--domain-analytics)", icon: "trending" },
  ],
  // Real, named example tools drawn from the approved exampleTools in
  // src/lib/content/data/* — shown as plain text ("works with the tools you already
  // use"), not as logos, partners or clients. The repo ships no third-party marks.
  // Real brand logos for an illustrative "works with" rail (ref 07), stored locally in
  // public/brand-logos. A focused, famous, genuinely-relevant set: store, site, search,
  // ads/social, email and CRM — no endorsement or partnership implied.
  platforms: [
    { name: "Shopify", slug: "shopify" },
    { name: "WordPress", slug: "wordpress" },
    { name: "Google", slug: "google" },
    { name: "Meta", slug: "meta" },
    { name: "Mailchimp", slug: "mailchimp" },
    { name: "HubSpot", slug: "hubspot" },
  ],
};

export const seedEditorial: EditorialSection = {
  eyebrow: "The connected picture",
  heading: {
    pre: "The digital world keeps getting ",
    accent: "bigger",
    post: ".",
  },
  body: [
    "New tools, channels and tactics appear every month. It is easy to feel like you should be doing all of it, everywhere, at once.",
    "You don't. Growth online works as one connected system, where each part feeds the next — and the order usually matters more than the number of tools.",
    "Infinite Weblinks helps you see what you actually need, why it matters, how the pieces connect, what should come first, and what can wait.",
  ],
  points: [
    {
      title: "Understand first",
      body: "We explain the landscape in plain English before anyone talks about services.",
      color: "var(--violet-deep)",
      icon: "compass",
    },
    {
      title: "Connect the parts",
      body: "Website, marketing, customer tools, analytics and automation, joined around your goals.",
      color: "var(--pink)",
      icon: "link",
    },
    {
      title: "Start where it counts",
      body: "We point you to the smallest next step that moves the needle — not a giant to-do list.",
      color: "var(--orange)",
      icon: "target",
    },
  ],
};
