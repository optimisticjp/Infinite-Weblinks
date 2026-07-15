import type { ToolCategory } from "@/lib/content/types";

/**
 * Tool groups (Growth Guide p.18 "The right stack"). We're not tied to any one
 * platform; we pick tools that fit size, budget, and goals, then set them up
 * properly. Whatever we set up, the accounts and billing sit in the client's name.
 */
export const toolCategories: ToolCategory[] = [
  {
    status: "verified",
    slug: "websites-hosting-performance",
    name: "Websites, Hosting & Performance",
    intro: "The platform your site or store runs on, and the hosting that keeps it fast and online.",
    order: 1,
    icon: "monitor",
    color: "var(--blue)",
  },
  {
    status: "verified",
    slug: "ecommerce-operations",
    name: "Ecommerce & Operations",
    intro: "The systems behind the storefront: inventory, fulfilment, shipping, and support.",
    order: 2,
    icon: "shopping-bag",
    color: "var(--lime)",
  },
  {
    status: "verified",
    slug: "email-sms-crm",
    name: "Email, SMS & CRM",
    intro: "Where your contacts and customer relationships actually live and get followed up.",
    order: 3,
    icon: "mail",
    color: "var(--blue)",
  },
  {
    status: "verified",
    slug: "funnels-landing-pages",
    name: "Funnels & Landing Pages",
    intro: "Purpose-built pages and paths for a specific offer or campaign.",
    order: 4,
    icon: "layers",
    color: "var(--orange)",
  },
  {
    status: "verified",
    slug: "courses-memberships-community",
    name: "Courses, Memberships & Community",
    intro: "Platforms for hosting paid content, lessons, and member communities.",
    order: 5,
    icon: "book-open",
    color: "var(--violet)",
  },
  {
    status: "verified",
    slug: "loyalty-reviews-referrals",
    name: "Loyalty, Reviews & Referrals",
    intro: "Tools that keep customers coming back and turn them into advocates.",
    order: 6,
    icon: "star",
    color: "var(--violet-bright)",
  },
  {
    status: "verified",
    slug: "seo-content",
    name: "SEO & Content",
    intro: "Research, writing, and technical tools behind organic visibility.",
    order: 7,
    icon: "search",
    color: "var(--cyan)",
  },
  {
    status: "verified",
    slug: "analytics-tracking",
    name: "Analytics & Tracking",
    intro: "Where the numbers actually live, so decisions are based on evidence.",
    order: 8,
    icon: "bar-chart-3",
    color: "var(--cyan)",
  },
  {
    status: "verified",
    slug: "automation-ai",
    name: "Automation & AI",
    intro: "Connecting tools and applying AI where it removes real repetitive work.",
    order: 9,
    icon: "zap",
    color: "var(--pink)",
  },
  {
    status: "verified",
    slug: "support-security-legal",
    name: "Support, Security & Legal",
    intro: "Keeping the site, its data, and its customers looked after and compliant.",
    order: 10,
    icon: "shield",
    color: "var(--blue)",
  },
];
