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
      {
        label: "How It Works",
        href: "/how-it-works",
        megaMenu: {
          title: "How It Works",
          columns: [
            {
              heading: "The growth journey",
              items: [
                { label: "The 8-stage journey", href: "/how-it-works", description: "One connected path, start to scale" },
                { label: "Discovery & Plan", href: "/how-it-works#discovery-plan" },
                { label: "Foundation", href: "/how-it-works#foundation" },
                { label: "Get Discovered", href: "/how-it-works#get-discovered" },
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
                { label: "We Do the Work", href: "/how-it-works#delivery" },
                { label: "We Bring In an Expert", href: "/how-it-works#delivery" },
                { label: "We Run It End to End", href: "/how-it-works#delivery" },
                { label: "You Run It After", href: "/how-it-works#delivery" },
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
      {
        label: "Solutions",
        href: "/solutions",
        megaMenu: {
          title: "Solutions",
          columns: [
            {
              heading: "By goal",
              items: [
                { label: "Launch a professional store", href: "/solutions" },
                { label: "Get found on Google", href: "/solutions" },
                { label: "Turn visitors into buyers", href: "/solutions" },
                { label: "Bring customers back", href: "/solutions" },
              ],
            },
            {
              heading: "By business type",
              items: [
                { label: "Ecommerce brands", href: "/business-types/ecommerce" },
                { label: "Creators", href: "/business-types/creators" },
                { label: "Local & service businesses", href: "/business-types/local-service" },
                { label: "B2B & software", href: "/business-types/b2b" },
              ],
            },
            {
              heading: "By where you are",
              items: [
                { label: "Just starting out", href: "/starting-points/nothing-built-yet" },
                { label: "Have a site, need traffic", href: "/starting-points/website-no-traffic" },
                { label: "Traffic, but few sales", href: "/starting-points/traffic-few-sales" },
                { label: "Established & scaling", href: "/starting-points/established-want-to-scale" },
              ],
            },
          ],
        },
      },
      {
        label: "Services",
        href: "/services",
        megaMenu: {
          title: "Services",
          columns: [
            {
              heading: "Build",
              items: [
                { label: "Websites & Development", href: "/services" },
                { label: "Shopify / WooCommerce", href: "/services" },
                { label: "Branding & Design", href: "/services" },
                { label: "Funnels & Conversion", href: "/services" },
              ],
            },
            {
              heading: "Grow",
              items: [
                { label: "SEO & Content", href: "/services" },
                { label: "Paid Ads", href: "/services" },
                { label: "Social & Video", href: "/services" },
                { label: "Email, SMS & CRM", href: "/services" },
              ],
            },
            {
              heading: "Operate",
              items: [
                { label: "Analytics & Data", href: "/services" },
                { label: "AI & Automation", href: "/services" },
                { label: "Ecommerce Ops", href: "/services" },
                { label: "Security & Maintenance", href: "/services" },
              ],
            },
          ],
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
        heading: "Explore",
        links: [
          { label: "How It Works", href: "/how-it-works" },
          { label: "Solutions", href: "/solutions" },
          { label: "Services", href: "/services" },
          { label: "Resources", href: "/resources" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Build My Growth Plan", href: "/growth-plan" },
          { label: "Contact", href: "/contact" },
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
  areas: [
    { key: "website", label: "Website or Store", color: "var(--domain-website)", icon: "monitor" },
    { key: "search", label: "Search & Advertising", color: "var(--domain-search)", icon: "megaphone" },
    { key: "social", label: "Social & Content", color: "var(--domain-social)", icon: "share" },
    { key: "customer", label: "Customer Tools", color: "var(--domain-customer)", icon: "users" },
    { key: "analytics", label: "Analytics", color: "var(--domain-analytics)", icon: "trending" },
    { key: "automation", label: "Automation & AI", color: "var(--domain-automation)", icon: "sparkles" },
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
