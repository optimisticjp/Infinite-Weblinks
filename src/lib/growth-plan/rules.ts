import type { RuleSet } from "./types";

/**
 * Reviewed, rule-based Growth Plan logic — seeded from the Growth Guide's goal table
 * (p.5), starting-point table (p.4) and roadmaps (pp.20–21). Stored as data so editing
 * a recommendation is content work, not a code change. Outcomes describe the *kind* of
 * result the work is built to produce — never a promised number.
 *
 * Slugs below are the CANONICAL content slugs. `businessType` matches a business-type
 * slug, `mainGoal` a goal slug and `currentStage` a growth-stage slug — the exact values
 * the builder's dropdowns emit, because those dropdowns are populated from the same
 * content getters (getBusinessTypes / getGoals / getStages). `existingSetup` matches one
 * of the fixed EXISTING_SETUP_OPTIONS strings. Keep this file and the data slugs in lock-step.
 */

const OWNERSHIP = "You own your accounts, data and tools throughout — nothing is locked to us.";

export const growthPlanRuleSet: RuleSet = {
  version: "2026-07-seed",
  status: "approved",
  rules: [
    // ---------------------------------------------------------------- Ecommerce
    {
      id: "ecom-launch-store",
      when: { businessType: "ecommerce", mainGoal: "launch-professional-store" },
      then: {
        startHere: ["Foundation", "Shopify / WooCommerce store build", "GA4 & tracking setup"],
        connectNext: ["Get Discovered — SEO & paid ads", "Email flows (welcome, abandoned cart)"],
        addLater: ["Loyalty & reviews", "Subscriptions & fulfilment automation"],
        capabilities: ["Store build", "Payments & checkout", "Clean tracking from day one"],
        exampleTools: ["Shopify", "Klaviyo", "GA4"],
        expectedOutcomes: [
          "A store that's ready to take orders and measure them",
          "A foundation you can grow on without re-platforming",
        ],
        howWeHelp: `We build the store in-house (We Do the Work) and set up your tools so they talk to each other. ${OWNERSHIP}`,
      },
      priority: 10,
    },
    {
      id: "ecom-traffic-no-sales",
      when: { businessType: "ecommerce", mainGoal: "turn-visitors-into-buyers" },
      then: {
        startHere: ["Build Trust", "Conversion rate optimisation", "Reviews & proof"],
        connectNext: ["Email & SMS flows", "Cart recovery"],
        addLater: ["Loyalty programme", "Retargeting refinement"],
        capabilities: ["Conversion work on pages & funnel", "Reviews and proof", "Lifecycle email"],
        exampleTools: ["Hotjar", "VWO", "Klaviyo"],
        expectedOutcomes: [
          "A higher share of visitors taking action",
          "More repeat orders over time",
        ],
        howWeHelp: `We handle CRO in-house (We Do the Work) and set up your email tools for you to run (You Run It After). ${OWNERSHIP}`,
      },
      priority: 10,
    },
    {
      id: "ecom-bring-back",
      when: { businessType: "ecommerce", mainGoal: "bring-customers-back" },
      then: {
        startHere: ["Retain", "Email & SMS lifecycle", "Loyalty setup"],
        connectNext: ["Subscriptions", "Reviews & referrals"],
        addLater: ["Advocacy & partnerships"],
        capabilities: ["Email, SMS & loyalty", "Retention strategy"],
        exampleTools: ["Klaviyo", "Postscript", "Smile.io"],
        expectedOutcomes: ["More repeat orders", "Higher value from each customer over time"],
        howWeHelp: `We manage email and set up loyalty (We Run It End to End where useful). ${OWNERSHIP}`,
      },
      priority: 9,
    },
    // ---------------------------------------------------------------- Creators
    {
      id: "creator-course",
      when: { businessType: "creators", mainGoal: "sell-course-membership" },
      then: {
        startHere: ["Convert", "Course or membership platform setup", "Sales page & checkout"],
        connectNext: ["Email launch sequence", "Owned newsletter to warm the audience"],
        addLater: ["Affiliate / referral systems", "A second product tier"],
        capabilities: ["Course/membership setup", "Sales page & funnel", "Email you own"],
        exampleTools: ["Kajabi", "Beehiiv", "Stripe"],
        expectedOutcomes: [
          "A product you can sell without depending on one platform",
          "A repeatable launch you understand",
        ],
        howWeHelp: `We set up the platform and hand you the keys (You Run It After), with the funnel built in-house. ${OWNERSHIP}`,
      },
      priority: 10,
    },
    {
      id: "creator-audience",
      when: { businessType: "creators" },
      then: {
        startHere: ["Foundation", "Personal brand & simple site", "Email capture"],
        connectNext: ["Grow one main platform", "Start a newsletter you own"],
        addLater: ["Course or membership launch", "Affiliate / sponsorship systems"],
        capabilities: ["Content & growth plan", "Email you own", "Course/membership setup"],
        exampleTools: ["Beehiiv", "Metricool", "Kajabi"],
        expectedOutcomes: [
          "Genuine audience growth, not vanity spikes",
          "Income that doesn't depend on one platform",
        ],
        howWeHelp: `We set up the platform and hand you the keys (You Run It After), with strategy in-house. ${OWNERSHIP}`,
      },
      priority: 6,
    },
    // ---------------------------------------------------------------- Local & service
    {
      id: "local-bookings",
      when: { businessType: "local-service", mainGoal: "get-leads-and-bookings" },
      then: {
        startHere: ["Foundation", "Local SEO & Google Business Profile", "Booking / lead form + CRM"],
        connectNext: ["Lead-gen funnel & local ads", "Email/SMS reminders & nurture"],
        addLater: ["Reviews & reputation", "Follow-up automation"],
        capabilities: ["Local SEO", "Bookings & lead capture", "Nurture automation"],
        exampleTools: ["Google Business Profile", "GoHighLevel", "BrightLocal"],
        expectedOutcomes: ["A steadier flow of enquiries and bookings", "Clear reporting on cost per lead"],
        howWeHelp: `We build the site and set up the CRM for you to run (You Run It After); ads and SEO managed by us. ${OWNERSHIP}`,
      },
      priority: 10,
    },
    {
      id: "local-leads",
      when: { businessType: "local-service" },
      then: {
        startHere: ["Foundation", "Site with local SEO & Google Business Profile", "Lead form + CRM"],
        connectNext: ["Lead-gen funnel & ads", "Email/SMS nurture"],
        addLater: ["Reviews & reputation", "Follow-up automation"],
        capabilities: ["Local SEO", "Lead capture & CRM", "Nurture automation"],
        exampleTools: ["Google Business Profile", "GoHighLevel", "BrightLocal"],
        expectedOutcomes: ["A steadier flow of enquiries", "Clear reporting on cost per lead"],
        howWeHelp: `We build the site and set up the CRM for you to run (You Run It After); ads and SEO managed by us. ${OWNERSHIP}`,
      },
      priority: 6,
    },
    // ---------------------------------------------------------------- B2B & software
    {
      id: "b2b-leads",
      when: { businessType: "b2b" },
      then: {
        startHere: ["Discovery & Plan", "Positioning & a clear site", "Lead capture + CRM & tracking"],
        connectNext: ["Content & SEO for the problems you solve", "Lead nurture and a simple sales funnel"],
        addLater: ["Paid search for high-intent terms", "Reporting dashboards for pipeline"],
        capabilities: ["Positioning & site", "Lead capture & CRM", "Content & SEO"],
        exampleTools: ["HubSpot", "Search Console", "Looker Studio"],
        expectedOutcomes: ["A steadier flow of qualified enquiries", "Visibility of what's driving pipeline"],
        howWeHelp: `We build the site and set up the CRM for your team to run (You Run It After); content and SEO managed by us. ${OWNERSHIP}`,
      },
      priority: 6,
    },
    {
      id: "software-growth",
      when: { businessType: "software" },
      then: {
        startHere: ["Foundation", "Marketing site & clear positioning", "Product analytics & tracking"],
        connectNext: ["SEO & content for your use-cases", "Onboarding email & lifecycle flows"],
        addLater: ["Paid acquisition once payback is clear", "Retention & expansion campaigns"],
        capabilities: ["Marketing site", "Analytics & tracking", "Lifecycle email"],
        exampleTools: ["GA4", "Customer.io", "Search Console"],
        expectedOutcomes: ["A site that explains and converts", "Decisions based on real product data"],
        howWeHelp: `We build the marketing site and set up analytics in-house, then hand day-to-day flows to your team (You Run It After). ${OWNERSHIP}`,
      },
      priority: 6,
    },
    // ---------------------------------------------------------------- Established / scaling
    {
      id: "established-scale",
      when: { businessType: "established" },
      then: {
        startHere: ["Discovery & Plan", "Audit & clean tracking", "Dashboards"],
        connectNext: ["Conversion & retention work", "Advocacy & referrals"],
        addLater: ["Automation & AI where stable", "New markets & marketplaces"],
        capabilities: ["Audit & analytics", "CRO & retention", "Automation"],
        exampleTools: ["GA4", "Looker Studio", "Triple Whale"],
        expectedOutcomes: [
          "Decisions based on trustworthy numbers",
          "Each new sale costing less to win over time",
        ],
        howWeHelp: `We run the audit and analytics in-house, then layer automation where the process is stable (We Run It End to End). ${OWNERSHIP}`,
      },
      priority: 6,
    },
    // ---------------------------------------------------------------- Just starting
    {
      id: "beginner-start",
      when: { businessType: "beginner" },
      then: {
        startHere: ["Discovery & Plan", "Brand basics", "A simple site or store + tracking + legal"],
        connectNext: ["Pick one channel (SEO or ads)", "Lead capture & a basic funnel"],
        addLater: ["Read the data & fix the weakest step", "Add a second channel once the first works"],
        capabilities: ["Validate the offer", "Foundation build", "One-channel start"],
        exampleTools: ["Shopify", "GA4", "Klaviyo"],
        expectedOutcomes: [
          "A solid, measurable starting point",
          "A clear next step instead of a giant to-do list",
        ],
        howWeHelp: `We build the foundation in-house and point you to the smallest next step that moves the needle. ${OWNERSHIP}`,
      },
      priority: 6,
    },
    // ---------------------------------------------------------------- Goal-driven (any business type)
    {
      id: "make-ads-profitable",
      when: { mainGoal: "make-ads-profitable" },
      then: {
        startHere: ["Discovery & Plan", "Ads & measurement audit", "Server-side tracking"],
        connectNext: ["Fix the funnel & offer", "Cart recovery / lead nurture"],
        addLater: ["Rebuild campaigns", "Judge on payback, not just ROAS"],
        capabilities: ["Clean tracking", "Funnel & offer work", "Campaign rebuild"],
        exampleTools: ["GA4", "Stape", "VWO"],
        expectedOutcomes: ["Clearer payback and less wasted spend", "Decisions based on real data"],
        howWeHelp: `We audit and fix measurement first, then the funnel, before spending more — managed by us. ${OWNERSHIP}`,
      },
      priority: 8,
    },
    {
      id: "save-time-automation",
      when: { mainGoal: "save-time-with-automation" },
      then: {
        startHere: ["Map the repetitive work", "Pick the right tools (CRM, Zapier/Make)"],
        connectNext: ["Build automations with human checks", "Lead routing, email & SMS, chatbots"],
        addLater: ["Layer in AI for support & reporting", "Monitor that it stays accurate"],
        capabilities: ["Workflow automation", "AI customer automation", "Monitoring"],
        exampleTools: ["Zapier", "Make", "Chatbase"],
        expectedOutcomes: ["Hours back each week", "Fewer dropped balls"],
        howWeHelp: `We set up or manage the automations (You Run It After or We Run It End to End). ${OWNERSHIP}`,
      },
      priority: 7,
    },
    {
      id: "get-found",
      when: { mainGoal: "get-found-on-google" },
      then: {
        startHere: ["Get Discovered", "SEO audit & on-page", "Content plan"],
        connectNext: ["Paid ads for faster reach", "AI/answer-engine optimisation"],
        addLater: ["Link building & digital PR", "Local & marketplace visibility"],
        capabilities: ["SEO & content", "Paid ads", "GEO/AEO"],
        exampleTools: ["Ahrefs", "Surfer", "Search Console"],
        expectedOutcomes: ["Steady organic traffic that builds over time", "Reaching people already searching"],
        howWeHelp: `SEO runs through our vetted specialist network (We Bring In an Expert) with ecommerce SEO in-house. ${OWNERSHIP}`,
      },
      priority: 7,
    },
    {
      id: "grow-social",
      when: { mainGoal: "grow-social-following" },
      then: {
        startHere: ["Get Discovered", "Content & channel plan", "Consistent posting system"],
        connectNext: ["Short-form video & UGC", "Email capture so you own the audience"],
        addLater: ["Paid amplification of what works", "Community & advocacy"],
        capabilities: ["Social & content", "Video & UGC", "Email you own"],
        exampleTools: ["Metricool", "CapCut", "Beehiiv"],
        expectedOutcomes: ["Genuine following growth, not vanity spikes", "An audience you can reach directly"],
        howWeHelp: `Content and social managed by us, with video via our vetted network (We Bring In an Expert). ${OWNERSHIP}`,
      },
      priority: 7,
    },
    {
      id: "understand-data",
      when: { mainGoal: "understand-whats-working" },
      then: {
        startHere: ["Discovery & Plan", "Analytics & tracking audit", "Clean GA4 + events"],
        connectNext: ["Dashboards you'll actually read", "Fix the weakest step the data shows"],
        addLater: ["Attribution once volume supports it", "Regular reporting cadence"],
        capabilities: ["Analytics & tracking", "Dashboards", "Prioritisation"],
        exampleTools: ["GA4", "Google Tag Manager", "Looker Studio"],
        expectedOutcomes: ["Trustworthy numbers to decide with", "A clear view of what to fix first"],
        howWeHelp: `We set up clean tracking and dashboards in-house, then hand them over (You Run It After). ${OWNERSHIP}`,
      },
      priority: 7,
    },
    // ---------------------------------------------------------------- Situation-driven (existing setup)
    {
      id: "ads-running-setup",
      when: { existingSetup: "I'm running ads" },
      then: {
        startHere: ["Discovery & Plan", "Ads & measurement audit", "Server-side tracking"],
        connectNext: ["Fix the funnel & offer", "Cart recovery / lead nurture"],
        addLater: ["Rebuild campaigns", "Judge on payback, not just ROAS"],
        capabilities: ["Clean tracking", "Funnel & offer work", "Campaign rebuild"],
        exampleTools: ["GA4", "Stape", "VWO"],
        expectedOutcomes: ["Clearer payback and less wasted spend", "Decisions based on real data"],
        howWeHelp: `We audit and fix measurement first, then the funnel, before spending more — managed by us. ${OWNERSHIP}`,
      },
      priority: 5,
    },
    {
      id: "brand-new",
      when: { existingSetup: "Nothing built yet" },
      then: {
        startHere: ["Discovery & Plan", "Brand basics", "Simple site or store + tracking + legal"],
        connectNext: ["Pick one channel (SEO or ads)", "Lead capture & a basic funnel"],
        addLater: ["Read the data & fix the weakest step", "Add a second channel once the first works"],
        capabilities: ["Validate the offer", "Foundation build", "One-channel start"],
        exampleTools: ["Shopify", "GA4", "Klaviyo"],
        expectedOutcomes: [
          "A solid, measurable starting point",
          "A clear next step instead of a giant to-do list",
        ],
        howWeHelp: `We build the foundation in-house and point you to the smallest next step that moves the needle. ${OWNERSHIP}`,
      },
      priority: 5,
    },
    {
      id: "traffic-few-sales-setup",
      when: { existingSetup: "I have traffic but few sales" },
      then: {
        startHere: ["Build Trust", "Conversion rate optimisation", "Reviews & proof"],
        connectNext: ["Email & SMS flows", "Cart / lead recovery"],
        addLater: ["Loyalty programme", "Retargeting refinement"],
        capabilities: ["Conversion work", "Reviews and proof", "Lifecycle email"],
        exampleTools: ["Hotjar", "VWO", "Klaviyo"],
        expectedOutcomes: ["A higher share of visitors taking action", "Less traffic going to waste"],
        howWeHelp: `We handle CRO in-house (We Do the Work) and set up your email tools for you to run (You Run It After). ${OWNERSHIP}`,
      },
      priority: 5,
    },
    {
      id: "chaotic-ops-setup",
      when: { existingSetup: "I'm getting sales but it feels chaotic" },
      then: {
        startHere: ["Deliver & Operate", "Tidy fulfilment, returns & support", "Workflow automation"],
        connectNext: ["Connect your tools so data flows", "Clear dashboards & reporting"],
        addLater: ["AI for support & repetitive tasks", "Retention once operations are calm"],
        capabilities: ["Operations & automation", "Systems that connect", "Reporting"],
        exampleTools: ["Zapier", "Gorgias", "Looker Studio"],
        expectedOutcomes: ["Orders and enquiries handled without manual chaos", "Time back to work on growth"],
        howWeHelp: `We set up and connect the systems (You Run It After), managing the more complex automations for you. ${OWNERSHIP}`,
      },
      priority: 5,
    },
  ],
  fallback: {
    id: "fallback-discuss",
    startHere: ["Discovery & Plan", "A short, plain-English look at where you are"],
    connectNext: ["A connected plan for your stage", "The smallest next step that moves the needle"],
    addLater: ["Additional channels and systems as you grow"],
    capabilities: ["Understand what you need", "Connect the right parts", "Start where it counts"],
    exampleTools: [],
    expectedOutcomes: [
      "A clear picture of what your business may need and in what order",
      "A next step you actually understand",
    ],
    howWeHelp: `Tell us your goals and we'll map a connected plan — no pressure and no jargon. ${OWNERSHIP} If you'd rather, email support@infiniteweblinks.com.`,
  },
};
