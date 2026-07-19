import type { CaseScenario } from "@/lib/content/types";

/**
 * Worked example scenarios for /case-studies. These are ILLUSTRATIVE, not real clients:
 * every one is labelled an example in the UI, and none carries a client name, logo,
 * testimonial, or invented numeric result. Outcomes are described qualitatively only. They
 * exist to show how a connected system fits together for a kind of business, and to give the
 * case-study template real structure until verified client stories are ready to publish
 * (those use the status-gated CaseStudy type and render unlabelled alongside these).
 */
export const caseScenarios: CaseScenario[] = [
  {
    slug: "ecommerce-turn-browsers-into-buyers",
    title: "Turning browsers into buyers",
    forWho: "An online store getting visitors but not enough sales",
    summary:
      "When the store, the tracking and the follow-up are fixed together, more of the people who already arrive complete a purchase.",
    hue: "var(--domain-convert)",
    challenge:
      "The store gets a steady trickle of visitors, but most leave without buying. Nobody can see where they drop off, and there's nothing bringing them back once they've gone. Spending more on ads just sends more people into the same leaky funnel.",
    approach: [
      {
        label: "A store built to convert",
        detail: "Fix the checkout, product pages and speed so the path to buy is clear on every device.",
        hue: "var(--domain-build)",
        icon: "monitor",
      },
      {
        label: "Tracking you can trust",
        detail: "Set up analytics properly so every step from arrival to purchase is measured, not guessed.",
        hue: "var(--domain-ai)",
        icon: "bar-chart-3",
      },
      {
        label: "Follow-up that brings people back",
        detail: "Automated email for abandoned carts and past buyers, so a near-miss becomes a sale later.",
        hue: "var(--domain-retain)",
        icon: "mail",
      },
    ],
    work: [
      "Rebuild the product and checkout pages around the one action that matters, buying.",
      "Add clean tracking so drop-off points are visible instead of a mystery.",
      "Set up cart-recovery and post-purchase email flows in the store owner's own account.",
    ],
    outcome:
      "The same traffic does more, because fewer people fall through the gaps and more of the ones who leave come back to finish.",
    result: { label: "Checkout completion", value: "Improving" },
    categorySlugs: ["websites-development", "funnels-conversion", "analytics-data", "email-sms-crm"],
  },
  {
    slug: "local-service-steady-enquiries",
    title: "From a quiet site to steady enquiries",
    forWho: "A local service business that relies on word of mouth",
    summary:
      "Getting found locally and catching every enquiry in one place turns an invisible website into a dependable source of work.",
    hue: "var(--domain-discover)",
    challenge:
      "Work comes almost entirely from referrals, so it's feast or famine. The website barely shows up when people search locally, and the enquiries that do come in get lost between an inbox, a phone and a notepad.",
    approach: [
      {
        label: "Get found locally",
        detail: "Local SEO and a complete Google Business Profile so nearby customers actually find you.",
        hue: "var(--domain-discover)",
        icon: "search",
      },
      {
        label: "A page built to capture enquiries",
        detail: "A focused page with a simple form, so an interested visitor becomes a lead in one step.",
        hue: "var(--domain-convert)",
        icon: "layout",
      },
      {
        label: "One place for every lead",
        detail: "A CRM so no enquiry slips through, and follow-up happens without relying on memory.",
        hue: "var(--domain-retain)",
        icon: "users",
      },
    ],
    work: [
      "Fix the local search basics and claim and complete the business profile.",
      "Build a clear enquiry page that works well on a phone.",
      "Set up a simple CRM so every lead is captured and followed up.",
    ],
    outcome:
      "Enquiries stop depending on who happens to refer you this month, and become a steadier flow you can plan around.",
    result: { label: "Enquiries", value: "Steadier" },
    categorySlugs: ["seo-content", "marketplaces-more", "funnels-conversion", "email-sms-crm"],
  },
  {
    slug: "creator-audience-into-income",
    title: "Turning an audience into income",
    forWho: "A creator with a following but little revenue",
    summary:
      "An owned email list and a product to sell turn attention that lives on someone else's platform into income you control.",
    hue: "var(--domain-convert)",
    challenge:
      "There's a real audience, but it lives entirely on platforms that can change the rules overnight. Attention isn't turning into income, and there's no list or product that belongs to the creator.",
    approach: [
      {
        label: "A content engine",
        detail: "A realistic posting rhythm and plan so the audience keeps growing without burning out.",
        hue: "var(--domain-discover)",
        icon: "megaphone",
      },
      {
        label: "An audience you own",
        detail: "A simple site with email capture, so followers become a list a platform change can't erase.",
        hue: "var(--domain-retain)",
        icon: "mail",
      },
      {
        label: "Something to sell",
        detail: "A course or membership set up and launched, so the audience has a way to pay for what you offer.",
        hue: "var(--domain-convert)",
        icon: "book-open",
      },
    ],
    work: [
      "Set up a content calendar the creator can actually keep up with.",
      "Build a lightweight site with email capture in the creator's own name.",
      "Configure and launch a course or membership on a platform they control.",
    ],
    outcome:
      "The following becomes an owned audience with a way to buy, so attention finally has somewhere to convert into income.",
    result: { label: "Owned audience", value: "Growing" },
    categorySlugs: ["social-growth", "websites-development", "courses-memberships", "email-sms-crm"],
  },
  {
    slug: "b2b-qualified-leads",
    title: "Bringing in qualified leads",
    forWho: "A B2B business with an unpredictable pipeline",
    summary:
      "Ads pointed at a focused page, feeding a CRM with proper tracking, turns a patchy pipeline into a measurable one.",
    hue: "var(--domain-discover)",
    challenge:
      "Leads arrive in bursts and nobody's sure which effort produced them. Ad clicks land on a general homepage, enquiries aren't tracked, and the sales team can't tell good leads from tyre-kickers.",
    approach: [
      {
        label: "Ads aimed at intent",
        detail: "Search campaigns built around what buyers actually type when they're ready to talk.",
        hue: "var(--domain-discover)",
        icon: "target",
      },
      {
        label: "Landing pages that qualify",
        detail: "Focused pages that answer the real question and ask for the right details up front.",
        hue: "var(--domain-build)",
        icon: "layout",
      },
      {
        label: "A CRM and follow-up",
        detail: "Every lead captured, scored and followed up, so none go cold while the team is busy.",
        hue: "var(--domain-retain)",
        icon: "workflow",
      },
      {
        label: "Measurement end to end",
        detail: "Tracking that ties a closed deal back to the campaign that started it.",
        hue: "var(--domain-ai)",
        icon: "bar-chart-3",
      },
    ],
    work: [
      "Build tightly-themed search campaigns matched to buyer intent.",
      "Create landing pages that qualify enquiries instead of just collecting them.",
      "Connect a CRM with follow-up automation and closed-loop tracking.",
    ],
    outcome:
      "The pipeline becomes something you can see and steer, with spend pointed at the campaigns that produce real conversations.",
    result: { label: "Lead quality", value: "Higher" },
    categorySlugs: ["paid-ads", "funnels-conversion", "email-sms-crm", "analytics-data"],
  },
  {
    slug: "established-earn-more-per-customer",
    title: "Earning more from each customer",
    forWho: "An established brand whose growth has stalled",
    summary:
      "Retention, loyalty and automation make each existing customer worth more, so growth stops depending on constantly finding new ones.",
    hue: "var(--domain-retain)",
    challenge:
      "Growth has flattened, and every gain feels like it takes more ad spend than the last. Plenty of customers buy once and are never heard from again, and there's nothing set up to bring them back.",
    approach: [
      {
        label: "A retention plan",
        detail: "Map what a customer hears after they buy, so keeping them is deliberate, not the odd newsletter.",
        hue: "var(--domain-retain)",
        icon: "heart",
      },
      {
        label: "Messages that bring people back",
        detail: "Automated email and SMS that reach the right customer at the right moment.",
        hue: "var(--domain-convert)",
        icon: "mail",
      },
      {
        label: "Loyalty and referrals",
        detail: "Rewards and review requests that turn happy customers into repeat buyers and advocates.",
        hue: "var(--domain-retain)",
        icon: "star",
      },
      {
        label: "Automation behind it",
        detail: "The routine parts trigger themselves, so retention runs without adding daily work.",
        hue: "var(--domain-ai)",
        icon: "workflow",
      },
    ],
    work: [
      "Design a lifecycle plan for what happens after the first purchase.",
      "Set up automated win-back, loyalty and review flows in the brand's own tools.",
      "Connect the pieces so they run without constant hands-on effort.",
    ],
    outcome:
      "Each first sale is worth more over time, and growth leans on the customers you already have rather than only on new ones.",
    result: { label: "Repeat orders", value: "Compounding" },
    categorySlugs: ["retention-loyalty-advocacy", "email-sms-crm", "ai-automation", "analytics-data"],
  },
];
