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

const BRANDING_DESIGN: DomainConfig = {
  slug: "branding-design",
  hue: "var(--domain-build)",
  definition:
    "Decide what your brand stands for and give it a consistent look, voice, and set of assets that hold up everywhere it appears.",
  stageSlug: "foundation",
  outcomes: [
    {
      title: "A brand people recognise",
      body: "A look and voice that stays the same across your site, ads, and posts, so you're easier to remember.",
      icon: "sparkles",
    },
    {
      title: "One clear story",
      body: "Everyone working on your marketing points back to the same positioning and the same words.",
      icon: "compass",
    },
    {
      title: "Assets ready to use",
      body: "Logos, templates, and guidelines your team and ours can build from without starting over.",
      icon: "layers",
    },
  ],
  clusters: [
    {
      key: "positioning",
      heading: "Decide what you stand for",
      intro: "The positioning, name, and words that everything else points back to.",
      serviceSlugs: ["brand-strategy-positioning", "naming-domain-strategy", "messaging-copy-guidelines"],
    },
    {
      key: "identity",
      heading: "Give it a look",
      intro: "The visual identity and reusable system that keep every page and asset consistent.",
      serviceSlugs: ["brand-identity-logo-design", "design-system-ui-kit", "design-assets-marketing-collateral"],
    },
  ],
  connectsTo: [
    {
      label: "Websites and development",
      body: "The brand and design system feed straight into how your site looks and reads.",
      hue: "var(--domain-build)",
      icon: "monitor",
    },
    {
      label: "Get discovered",
      body: "Consistent assets keep your ads, content, and social on-brand.",
      hue: "var(--domain-discover)",
      icon: "megaphone",
    },
    {
      label: "Convert and sell",
      body: "Clear messaging gives landing pages and offers something solid to say.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
  ],
  forWho:
    "New businesses setting up for the first time, and established brands that have outgrown a look or message that no longer fits.",
  when: [
    "You're starting out and need a name, look, and voice before anything goes live.",
    "Your marketing looks different everywhere and no longer feels like one business.",
    "You're about to build or rebuild a site and want the design decided first.",
  ],
  next: { slug: "websites-development", name: "Websites & Development", hue: "var(--domain-build)" },
};

const WEBSITES_DEVELOPMENT: DomainConfig = {
  slug: "websites-development",
  hue: "var(--domain-build)",
  definition:
    "Design and build the site, store, or app your business runs on, then keep it fast, online, and converting.",
  stageSlug: "foundation",
  outcomes: [
    {
      title: "A site built to work",
      body: "Fast on every device, easy to act on, and set up to be found from day one.",
      icon: "monitor",
    },
    {
      title: "The right build for you",
      body: "A brochure site, an online store, or a full app, matched to what you actually sell.",
      icon: "layout",
    },
    {
      title: "Kept running after launch",
      body: "Hosting and upkeep so it stays fast and online instead of quietly decaying.",
      icon: "wrench",
    },
  ],
  clusters: [
    {
      key: "build",
      heading: "Build the site or store",
      intro: "Your main website, an ecommerce store, or a custom app, built on the right platform for your size.",
      serviceSlugs: ["website-design-development", "shopify-woocommerce-store-builds", "custom-web-app-development"],
    },
    {
      key: "convert",
      heading: "Pages that convert",
      intro: "Focused landing pages and ongoing testing so more of your traffic acts.",
      serviceSlugs: ["landing-page-design-build", "cro-conversion-rate-optimization"],
    },
    {
      key: "run",
      heading: "Keep it running",
      intro: "Hosting and maintenance so the site stays fast and online after launch.",
      serviceSlugs: ["web-hosting-maintenance"],
    },
  ],
  connectsTo: [
    {
      label: "Get discovered",
      body: "A fast, well-built site gives SEO and ads somewhere worth sending people.",
      hue: "var(--domain-discover)",
      icon: "search",
    },
    {
      label: "Convert and sell",
      body: "Landing pages and CRO turn that traffic into leads and sales.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Deliver and operate",
      body: "Hosting and maintenance keep everything running once it's live.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
  ],
  forWho:
    "Any business that needs a site, store, or app built properly, whether it's a first launch or a replacement for something holding you back.",
  when: [
    "You need a new site or store, or your current one is slow, dated, or hard to update.",
    "You're sending ad or email traffic to pages that weren't built to convert.",
    "You've launched and need someone reliable to keep the site fast and online.",
  ],
  next: { slug: "seo-content", name: "SEO & Content", hue: "var(--domain-discover)" },
};

const SEO_CONTENT: DomainConfig = {
  slug: "seo-content",
  hue: "var(--domain-discover)",
  definition:
    "Help the right people find you in search, by fixing what holds your site back and publishing content that answers what they look for.",
  stageSlug: "get-discovered",
  outcomes: [
    {
      title: "Found by people already looking",
      body: "You show up when someone searches for what you offer, not just when they already know your name.",
      icon: "search",
    },
    {
      title: "A site search engines can read",
      body: "The technical groundwork so your pages can actually be crawled and ranked.",
      icon: "wrench",
    },
    {
      title: "Traffic that builds over time",
      body: "Content that keeps bringing people in long after it's published.",
      icon: "trending-up",
    },
  ],
  clusters: [
    {
      key: "foundations",
      heading: "Get the groundwork right",
      intro: "Fix the technical issues and page-level details that decide whether you rank at all.",
      serviceSlugs: ["technical-seo", "on-page-seo"],
    },
    {
      key: "targeted",
      heading: "SEO for how you sell",
      intro: "Focused work for local businesses and online stores, aimed at how your customers actually search.",
      serviceSlugs: ["local-seo", "ecommerce-seo"],
    },
    {
      key: "content",
      heading: "Publish content that ranks",
      intro: "Useful, well-researched articles that answer real questions and pull in organic traffic.",
      serviceSlugs: ["content-marketing-blogging"],
    },
  ],
  connectsTo: [
    {
      label: "Convert and sell",
      body: "Search traffic needs pages and offers built to turn visitors into customers.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Paid ads",
      body: "What people actually search for tells your paid campaigns what's worth bidding on.",
      hue: "var(--domain-discover)",
      icon: "megaphone",
    },
    {
      label: "AI and automation",
      body: "The same structured content helps AI tools surface and cite you.",
      hue: "var(--domain-ai)",
      icon: "sparkles",
    },
  ],
  forWho:
    "Businesses that want steady, compounding traffic from search rather than paying for every visit, from local services to online stores.",
  when: [
    "You rely on word of mouth and want to be found by people who don't know you yet.",
    "You're paying for traffic that good search rankings could bring in without the ad spend.",
    "You have a site but it barely shows up when people search for what you do.",
  ],
  next: { slug: "paid-ads", name: "Paid Ads", hue: "var(--domain-discover)" },
};

const PAID_ADS: DomainConfig = {
  slug: "paid-ads",
  hue: "var(--domain-discover)",
  definition:
    "Reach the right people quickly through paid campaigns on Google and social, built and tracked so you can see what your spend brings back.",
  stageSlug: "get-discovered",
  outcomes: [
    {
      title: "Traffic you can turn on",
      body: "Reach the right people quickly instead of waiting for organic search to build.",
      icon: "zap",
    },
    {
      title: "Spend you can see",
      body: "Tracking set up properly, so you know what each campaign is bringing back.",
      icon: "bar-chart-3",
    },
    {
      title: "Warm leads followed up",
      body: "Retargeting keeps you in front of people who already showed interest.",
      icon: "target",
    },
  ],
  clusters: [
    {
      key: "channels",
      heading: "Campaigns where your buyers are",
      intro: "Search and Shopping on Google, plus paid social on Meta and TikTok, matched to where your customers spend time.",
      serviceSlugs: ["google-ads-search-shopping", "meta-ads-facebook-instagram", "tiktok-ads"],
    },
    {
      key: "performance",
      heading: "Make the spend work harder",
      intro: "Retargeting warm visitors and producing platform-native creative built to perform.",
      serviceSlugs: ["retargeting-remarketing", "ad-creative-production"],
    },
  ],
  connectsTo: [
    {
      label: "Convert and sell",
      body: "Ad clicks need landing pages and offers built to turn them into sales.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Social media",
      body: "Paid and organic social reinforce each other on the same platforms.",
      hue: "var(--domain-discover)",
      icon: "share-2",
    },
    {
      label: "Retain and grow",
      body: "Email and loyalty keep the customers your ads win coming back.",
      hue: "var(--domain-retain)",
      icon: "heart",
    },
  ],
  forWho:
    "Businesses that need results sooner than SEO alone can deliver, and stores or brands ready to scale what already works.",
  when: [
    "You need customers now and can't wait months for organic traffic to build.",
    "You have an offer that converts and want to put it in front of more people.",
    "You're getting visitors who leave without buying and want to bring them back.",
  ],
  next: { slug: "social-media", name: "Social Media", hue: "var(--domain-discover)" },
};

const SOCIAL_MEDIA: DomainConfig = {
  slug: "social-media",
  hue: "var(--domain-discover)",
  definition:
    "Show up in the feeds where your audience already spends time, with content and channels set up for how people actually discover businesses now.",
  stageSlug: "get-discovered",
  outcomes: [
    {
      title: "Content that gets seen",
      body: "Short vertical video and creator-made content built for the feeds where discovery actually happens now.",
      icon: "play",
    },
    {
      title: "A presence you can keep up",
      body: "Posting, scheduling and reporting set up so your team can run social without starting from a blank page.",
      icon: "megaphone",
    },
    {
      title: "A way to sell where people scroll",
      body: "Shops set up inside the apps, so someone can buy without leaving the feed they're already in.",
      icon: "shopping-bag",
    },
  ],
  clusters: [
    {
      key: "content",
      heading: "Content that gets you discovered",
      intro: "The video and creator content that earns attention in a fast-moving feed.",
      serviceSlugs: ["short-form-video-production", "ugc-content-production"],
    },
    {
      key: "run-and-sell",
      heading: "Run your channels and sell on them",
      intro: "The tools to post consistently, and the setup to sell without leaving the app.",
      serviceSlugs: ["social-media-management", "social-commerce"],
    },
  ],
  connectsTo: [
    {
      label: "Social growth",
      body: "Turn a presence into a real plan for growing the right followers.",
      hue: "var(--domain-discover)",
      icon: "trending-up",
    },
    {
      label: "Funnels and conversion",
      body: "Send the attention somewhere built to turn it into leads and sales.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Email, SMS and CRM",
      body: "Keep the audience you build coming back, not just scrolling past.",
      hue: "var(--domain-retain)",
      icon: "mail",
    },
  ],
  forWho:
    "Any business that needs to be present on social, and especially ecommerce brands and creators whose customers discover them in the feed.",
  when: [
    "You know you should be posting but never have time to keep it up.",
    "Discovery for your product is happening in short video and you're not there yet.",
    "You want to sell directly inside the apps your customers already use.",
  ],
  next: { slug: "social-growth", name: "Social Growth", hue: "var(--domain-discover)" },
};

const SOCIAL_GROWTH: DomainConfig = {
  slug: "social-growth",
  hue: "var(--domain-discover)",
  definition:
    "Turn scattered posting into a realistic plan for growing the right followers, on the platforms that matter for your business.",
  stageSlug: "get-discovered",
  outcomes: [
    {
      title: "A plan, not vanity targets",
      body: "An honest read of what's working across your accounts, turned into a growth plan you can actually follow.",
      icon: "compass",
    },
    {
      title: "Followers who engage",
      body: "Content and rhythm aimed at building a real, engaged audience rather than a bigger empty number.",
      icon: "users",
    },
    {
      title: "Posting that stays consistent",
      body: "A calendar and system so content keeps going out on schedule instead of in occasional bursts.",
      icon: "check",
    },
  ],
  clusters: [
    {
      key: "strategy",
      heading: "Set the growth strategy",
      intro: "An honest audit and a plan for what to post, where, and how often.",
      serviceSlugs: ["social-media-growth-audit-strategy", "content-calendar-planning"],
    },
    {
      key: "channel-sprints",
      heading: "Grow a specific channel",
      intro: "Focused pushes on the platforms where your audience actually is.",
      serviceSlugs: ["instagram-growth-sprint", "youtube-channel-growth-strategy"],
    },
  ],
  connectsTo: [
    {
      label: "Funnels and conversion",
      body: "Turn a growing audience into leads and sales, not just reach.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Social media",
      body: "Feed the plan with the video and content it needs to run.",
      hue: "var(--domain-discover)",
      icon: "play",
    },
    {
      label: "Email, SMS and CRM",
      body: "Move followers onto a list you own, so a platform change can't erase them.",
      hue: "var(--domain-retain)",
      icon: "mail",
    },
  ],
  forWho:
    "Creators and ecommerce brands with accounts already running who want steady, real growth rather than a viral gamble.",
  when: [
    "Your following has stalled and you're not sure what to change.",
    "You post when you remember to, and it shows.",
    "You want to grow a specific channel with a focused, time-boxed push.",
  ],
  next: { slug: "funnels-conversion", name: "Funnels & Conversion", hue: "var(--domain-convert)" },
};

const FUNNELS_CONVERSION: DomainConfig = {
  slug: "funnels-conversion",
  hue: "var(--domain-convert)",
  definition:
    "Build the path that turns an interested visitor into a captured lead or a paying customer, with each step designed to move them to the next.",
  stageSlug: "convert",
  outcomes: [
    {
      title: "A clear path to action",
      body: "A mapped route from first click to lead or sale, so people aren't left to find their own way.",
      icon: "git-branch",
    },
    {
      title: "More of your traffic converts",
      body: "Pages and offers built to turn the visitors you already have into leads and buyers.",
      icon: "target",
    },
    {
      title: "Follow-up that runs itself",
      body: "Automated sequences and a CRM so no lead goes cold while you're busy.",
      icon: "workflow",
    },
  ],
  clusters: [
    {
      key: "funnels",
      heading: "Build the funnel",
      intro: "The step-by-step path from interest to lead or purchase.",
      serviceSlugs: ["lead-gen-funnel-strategy-build", "sales-funnel-design-development"],
    },
    {
      key: "capture-follow-up",
      heading: "Capture leads and follow up",
      intro: "The offer that earns an email, and the system that follows up automatically.",
      serviceSlugs: ["lead-magnet-design-creation", "gohighlevel-setup-crm-automation"],
    },
  ],
  connectsTo: [
    {
      label: "Email, SMS and CRM",
      body: "Nurture captured leads until they're ready to buy.",
      hue: "var(--domain-retain)",
      icon: "mail",
    },
    {
      label: "Courses and memberships",
      body: "Put a specific offer at the end of the funnel to sell.",
      hue: "var(--domain-convert)",
      icon: "book-open",
    },
    {
      label: "Websites and development",
      body: "The landing and checkout pages the funnel runs on.",
      hue: "var(--domain-build)",
      icon: "layout",
    },
  ],
  forWho:
    "Service businesses, coaches and stores that get traffic but lose too much of it before it turns into a lead or sale.",
  when: [
    "You're getting visitors or clicks but not enough enquiries or orders.",
    "Leads come in and then go cold with no real follow-up.",
    "You have an offer but no clear path built to sell it.",
  ],
  next: { slug: "courses-memberships", name: "Courses & Memberships", hue: "var(--domain-convert)" },
};

const COURSES_MEMBERSHIPS: DomainConfig = {
  slug: "courses-memberships",
  hue: "var(--domain-convert)",
  definition:
    "Shape, build and sell a course, digital product or membership, from the first outline through to the page that actually sells it.",
  stageSlug: "convert",
  outcomes: [
    {
      title: "A course that's easy to finish",
      body: "Your knowledge shaped into a clear structure people can actually follow through to the end.",
      icon: "book-open",
    },
    {
      title: "A page built to sell it",
      body: "A sales page built around your specific offer, not a generic template, so more visitors buy.",
      icon: "layout",
    },
    {
      title: "Income that repeats",
      body: "A membership set up and launched, giving you revenue that comes back each month.",
      icon: "credit-card",
    },
  ],
  clusters: [
    {
      key: "build-course",
      heading: "Shape and build your course",
      intro: "Turn raw knowledge into a structured course on a platform you can run.",
      serviceSlugs: ["course-platform-setup", "online-course-creation-consulting"],
    },
    {
      key: "sell-and-membership",
      heading: "Sell it and run a membership",
      intro: "The page that sells your product, and a membership set up for recurring income.",
      serviceSlugs: ["digital-product-sales-page-design", "membership-site-setup-marketing"],
    },
  ],
  connectsTo: [
    {
      label: "Funnels and conversion",
      body: "A funnel that drives sign-ups to your course or membership.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "Email, SMS and CRM",
      body: "Launch emails and onboarding that turn buyers into active members.",
      hue: "var(--domain-retain)",
      icon: "mail",
    },
    {
      label: "Social media",
      body: "The audience you build content for is who you sell the course to.",
      hue: "var(--domain-discover)",
      icon: "users",
    },
  ],
  forWho:
    "Creators and experts ready to package what they know into a course, digital product or paid membership.",
  when: [
    "You have expertise people ask about and want to sell it as a course.",
    "You're launching a digital product and need a page that converts.",
    "You want recurring income from a membership, not just one-off sales.",
  ],
  next: { slug: "email-sms-crm", name: "Email, SMS & CRM", hue: "var(--domain-convert)" },
};

const EMAIL_SMS_CRM: DomainConfig = {
  slug: "email-sms-crm",
  hue: "var(--domain-convert)",
  definition:
    "Stay in touch with the people who already know you, so more of them come back and buy again instead of being a one-off sale.",
  stageSlug: "retain",
  outcomes: [
    {
      title: "More repeat business",
      body: "The customers you already have hear from you at the right moments, so more of them come back.",
      icon: "trending-up",
    },
    {
      title: "Messages that stay relevant",
      body: "People are sent things that fit where they are with you, not the same blast to everyone.",
      icon: "mail",
    },
    {
      title: "Everyone in one place",
      body: "Leads and customers live in one system, so nobody slips through inboxes and spreadsheets.",
      icon: "database",
    },
  ],
  clusters: [
    {
      key: "messaging",
      heading: "Messages that bring people back",
      intro: "Automated email and text that follow up and re-engage without you sending each one by hand.",
      serviceSlugs: ["email-marketing-automation", "sms-marketing"],
    },
    {
      key: "lifecycle",
      heading: "A deliberate plan for retention",
      intro: "Map what a customer hears at each stage, so keeping people is planned rather than the odd newsletter.",
      serviceSlugs: ["retention-lifecycle-strategy"],
    },
    {
      key: "foundation",
      heading: "One home for contacts and lists",
      intro: "The CRM and owned channels that hold your audience, so every message has somewhere solid to run from.",
      serviceSlugs: ["crm-setup-integration", "newsletter-strategy-setup"],
    },
  ],
  connectsTo: [
    {
      label: "Retention, loyalty and advocacy",
      body: "The same contacts power loyalty and referral programmes.",
      hue: "var(--domain-retain)",
      icon: "heart",
    },
    {
      label: "Ecommerce ops and delivery",
      body: "Order and support data feeds who gets messaged, and when.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
    {
      label: "AI and automation",
      body: "The flows can be automated further as they grow.",
      hue: "var(--domain-ai)",
      icon: "sparkles",
    },
  ],
  forWho:
    "Businesses with a base of customers or leads who want to earn more from them instead of always paying to find new ones.",
  when: [
    "You spend to win customers but do little to bring them back.",
    "Your leads and customers are scattered across different tools.",
    "Follow-ups only happen when someone remembers to send them.",
  ],
  next: { slug: "ecommerce-ops-delivery", name: "Ecommerce Ops & Delivery", hue: "var(--domain-operate)" },
};

const ECOMMERCE_OPS_DELIVERY: DomainConfig = {
  slug: "ecommerce-ops-delivery",
  hue: "var(--domain-operate)",
  definition:
    "Set up the systems behind the sale, so orders, stock, shipping and support run smoothly instead of eating your day.",
  stageSlug: "deliver-operate",
  outcomes: [
    {
      title: "Fewer things falling through",
      body: "Every order is tracked from checkout to delivery, so nothing gets lost between the sale and the shipment.",
      icon: "check",
    },
    {
      title: "Less repetitive manual work",
      body: "Steps you used to do by hand happen automatically, giving you your time back.",
      icon: "workflow",
    },
    {
      title: "Customers kept in the loop",
      body: "Stock, shipping and support are joined up, so people always know where their order stands.",
      icon: "message-square",
    },
  ],
  clusters: [
    {
      key: "fulfilment",
      heading: "Fulfil every order without the manual work",
      intro: "The connected systems that move an order from checkout, through stock, and out the door.",
      serviceSlugs: ["order-management", "inventory-management-setup", "shipping-integration"],
    },
    {
      key: "support",
      heading: "Support that keeps customers happy",
      intro: "A proper help desk, so questions get tracked and answered instead of buried in a shared inbox.",
      serviceSlugs: ["customer-support-systems"],
    },
  ],
  connectsTo: [
    {
      label: "Retention, loyalty and advocacy",
      body: "A smooth delivery is what earns the second order.",
      hue: "var(--domain-retain)",
      icon: "heart",
    },
    {
      label: "Email, SMS and CRM",
      body: "Order and support data shapes who you message next.",
      hue: "var(--domain-convert)",
      icon: "mail",
    },
    {
      label: "AI and automation",
      body: "Support and routine steps can be automated further.",
      hue: "var(--domain-ai)",
      icon: "sparkles",
    },
  ],
  forWho:
    "Growing stores where orders, stock and customer questions have outgrown being handled by hand.",
  when: [
    "Orders or stock updates are still copied between systems by hand.",
    "Customer questions get lost in a shared inbox.",
    "Fulfilment slows you down every time sales pick up.",
  ],
  next: { slug: "retention-loyalty-advocacy", name: "Retention, Loyalty & Advocacy", hue: "var(--domain-retain)" },
};

const RETENTION_LOYALTY_ADVOCACY: DomainConfig = {
  slug: "retention-loyalty-advocacy",
  hue: "var(--domain-retain)",
  definition:
    "Give the customers you already have reasons to stay, spend again, and bring other people with them.",
  stageSlug: "retain",
  outcomes: [
    {
      title: "Customers who stick around",
      body: "Repeat buyers get a reason to keep choosing you rather than quietly drifting off.",
      icon: "heart",
    },
    {
      title: "Growth from happy customers",
      body: "Referrals and affiliates turn the people who like you into a source of new ones.",
      icon: "share-2",
    },
    {
      title: "Proof new visitors can see",
      body: "Genuine reviews give people the reassurance they look for before they buy.",
      icon: "star",
    },
  ],
  clusters: [
    {
      key: "retain",
      heading: "Keep customers coming back",
      intro: "Rewards and a solid first experience that give people a reason to return.",
      serviceSlugs: ["loyalty-program-setup", "customer-success-onboarding"],
    },
    {
      key: "advocacy",
      heading: "Turn customers into advocates",
      intro: "Referral, affiliate and review programmes that let happy customers bring in more.",
      serviceSlugs: ["referral-affiliate-program-setup", "review-generation"],
    },
  ],
  connectsTo: [
    {
      label: "Email, SMS and CRM",
      body: "Loyalty and review asks run on your email and contact data.",
      hue: "var(--domain-convert)",
      icon: "mail",
    },
    {
      label: "AI and automation",
      body: "The requests and rewards can be triggered automatically.",
      hue: "var(--domain-ai)",
      icon: "sparkles",
    },
    {
      label: "Ecommerce ops and delivery",
      body: "Onboarding and support sit on the systems behind the sale.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
  ],
  forWho:
    "Established businesses with a steady flow of customers who want to earn more from each one and grow through word of mouth.",
  when: [
    "Customers buy once and you rarely hear from them again.",
    "You have happy customers but nothing set up to turn them into referrals.",
    "New visitors can't see much proof that others trust you.",
  ],
  next: { slug: "ai-automation", name: "AI & Automation", hue: "var(--domain-ai)" },
};

const AI_AUTOMATION: DomainConfig = {
  slug: "ai-automation",
  hue: "var(--domain-ai)",
  definition:
    "Put AI and automation to work across your whole setup, from being cited in AI answers to handling routine questions and connecting the tools you already use.",
  stageSlug: "deliver-operate",
  outcomes: [
    {
      title: "Found where people now ask",
      body: "When someone asks an AI tool about what you do, your business is more likely to be the answer it gives back.",
      icon: "sparkles",
    },
    {
      title: "Less time on repetitive work",
      body: "Routine questions and manual steps get handled for you, so your team spends its hours where they actually count.",
      icon: "workflow",
    },
    {
      title: "Tools that talk to each other",
      body: "The systems you already pay for start working together, instead of needing someone to copy data between them.",
      icon: "git-branch",
    },
  ],
  clusters: [
    {
      key: "ai-search",
      heading: "Get cited by AI search",
      intro: "Structure your content so AI tools quote you when people ask them questions, not just rank you in a list of links.",
      serviceSlugs: ["geo-generative-engine-optimization", "aeo-answer-engine-optimization"],
    },
    {
      key: "automation",
      heading: "Automate the repetitive work",
      intro: "Hand routine questions and manual steps to systems built to handle them, with a person kept in the loop where it matters.",
      serviceSlugs: ["ai-chatbots-customer-automation", "workflow-automation"],
    },
  ],
  connectsTo: [
    {
      label: "Get discovered",
      body: "AI search work sits right next to your SEO, so you show up in classic results and AI answers alike.",
      hue: "var(--domain-discover)",
      icon: "search",
    },
    {
      label: "Deliver and operate",
      body: "Chatbots and automation take routine load off the day-to-day of running things once you're live.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
    {
      label: "Analytics and data",
      body: "Measurement shows what's worth automating next, and whether it's really saving the time you hoped.",
      hue: "var(--domain-ai)",
      icon: "bar-chart-3",
    },
  ],
  forWho:
    "Businesses with routine questions or manual steps eating up time, and anyone who wants to be found as AI search becomes how people look things up.",
  when: [
    "Your team keeps answering the same customer questions by hand.",
    "You want to show up when people ask AI tools, not only search engines.",
    "The same data gets copied between tools every day and it's slowing you down.",
  ],
  next: { slug: "analytics-data", name: "Analytics & Data", hue: "var(--domain-ai)" },
};

const ANALYTICS_DATA: DomainConfig = {
  slug: "analytics-data",
  hue: "var(--domain-ai)",
  definition:
    "Set up honest measurement across your site and marketing, then turn the numbers into a clear picture you can actually make decisions from.",
  stageSlug: "discovery-plan",
  outcomes: [
    {
      title: "Numbers you can trust",
      body: "Tracking set up properly, so the figures you're looking at reflect what really happened on your site.",
      icon: "check",
    },
    {
      title: "One clear view",
      body: "Your key numbers pulled into one place and explained in plain English, not scattered across platforms.",
      icon: "gauge",
    },
    {
      title: "Decisions backed by evidence",
      body: "You'll know which changes actually made a difference, rather than guessing from a hunch.",
      icon: "line-chart",
    },
  ],
  clusters: [
    {
      key: "measure",
      heading: "Measure it properly",
      intro: "Get the tracking and reporting right first, so every number that follows can be trusted.",
      serviceSlugs: ["ga4-google-tag-manager-setup", "custom-dashboards-reporting"],
    },
    {
      key: "understand",
      heading: "See what's really happening",
      intro: "Test changes on real traffic and watch how people move through your site, so you know why the numbers move.",
      serviceSlugs: ["ab-testing-experimentation", "heatmaps-session-recordings"],
    },
  ],
  connectsTo: [
    {
      label: "Strategy and discovery",
      body: "Trustworthy numbers make every audit and plan sharper, so the next decision starts from facts.",
      hue: "var(--domain-strategy)",
      icon: "compass",
    },
    {
      label: "Convert",
      body: "Behaviour data and test results point your conversion work at the changes worth making.",
      hue: "var(--domain-convert)",
      icon: "target",
    },
    {
      label: "AI and automation",
      body: "Once you can see what's happening, it's clear what's worth automating and what to leave alone.",
      hue: "var(--domain-ai)",
      icon: "workflow",
    },
  ],
  forWho:
    "Any business past the guesswork stage that wants to know what's working from real numbers, whether you're just adding tracking or ready to test properly.",
  when: [
    "You're not sure the numbers in your reports can be trusted.",
    "You're about to change something and want proof it actually helps.",
    "Your data lives in five different platforms and no one has the full picture.",
  ],
  next: { slug: "security-maintenance-compliance", name: "Security, Maintenance & Compliance", hue: "var(--domain-ai)" },
};

const SECURITY_MAINTENANCE_COMPLIANCE: DomainConfig = {
  slug: "security-maintenance-compliance",
  hue: "var(--domain-ai)",
  definition:
    "Keep your site secure, up to date, and on the right side of privacy and accessibility rules, so it stays healthy long after launch.",
  stageSlug: "foundation",
  outcomes: [
    {
      title: "A site that stays healthy",
      body: "Regular updates and small fixes, so your site keeps working properly instead of quietly breaking over time.",
      icon: "wrench",
    },
    {
      title: "Protected against the obvious risks",
      body: "Monitoring and defences that catch a security problem early, before it takes the whole site down.",
      icon: "shield",
    },
    {
      title: "Covered on the basics",
      body: "Cookie consent, privacy structure, and accessibility handled, so you're not caught out on the essentials.",
      icon: "check",
    },
  ],
  clusters: [
    {
      key: "keep-running",
      heading: "Keep it safe and running",
      intro: "Ongoing protection and upkeep, so your site stays online, fast, and out of trouble after it launches.",
      serviceSlugs: ["security-malware-protection", "website-maintenance-updates"],
    },
    {
      key: "compliant",
      heading: "Stay on the right side of the rules",
      intro: "The privacy and accessibility basics, set up so your site meets the standards visitors and regulators expect.",
      serviceSlugs: ["privacy-policy-cookie-consent", "accessibility-compliance-wcag"],
    },
  ],
  connectsTo: [
    {
      label: "Websites and development",
      body: "The upkeep and protection here guard everything the build stage puts live.",
      hue: "var(--domain-build)",
      icon: "monitor",
    },
    {
      label: "Deliver and operate",
      body: "Maintenance and monitoring are part of the day-to-day of keeping a live site running well.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
    {
      label: "Convert",
      body: "A secure, accessible, and compliant site is one visitors trust enough to act on.",
      hue: "var(--domain-convert)",
      icon: "users",
    },
  ],
  forWho:
    "Any business with a live site or store that needs to stay secure, working, and compliant, from a new store owner to an established brand with obligations to meet.",
  when: [
    "Your site is live and you want it kept secure and up to date without thinking about it.",
    "You need cookie consent and a privacy policy in place before you go further.",
    "You want to be sure people using screen readers or keyboards can actually use your site.",
  ],
  next: { slug: "marketplaces-more", name: "Marketplaces & More", hue: "var(--domain-operate)" },
};

const MARKETPLACES_MORE: DomainConfig = {
  slug: "marketplaces-more",
  hue: "var(--domain-operate)",
  definition:
    "Get in front of customers beyond your own website, on the marketplaces, listings and press where they already spend time.",
  stageSlug: "get-discovered",
  outcomes: [
    {
      title: "More places to be found",
      body: "You show up where buyers already look, not only on a site they have to find first.",
      icon: "search",
    },
    {
      title: "Trust from outside your own site",
      body: "Press coverage and a complete profile give people reasons to believe you before they visit.",
      icon: "award",
    },
    {
      title: "Another route to sales",
      body: "Marketplaces put your products in front of people who were never going to land on your store.",
      icon: "shopping-bag",
    },
  ],
  clusters: [
    {
      key: "marketplace",
      heading: "Reach buyers on the biggest marketplace",
      intro: "Ongoing management of your Amazon presence, for brands selling there alongside their own store.",
      serviceSlugs: ["amazon-marketplace-management"],
    },
    {
      key: "visibility",
      heading: "Show up beyond your own channels",
      intro: "The press coverage and local profile that get you found before someone reaches your site.",
      serviceSlugs: ["pr-media-relations", "google-business-profile-setup"],
    },
  ],
  connectsTo: [
    {
      label: "Strategy and discovery",
      body: "A plan decides which of these channels are worth your time.",
      hue: "var(--domain-strategy)",
      icon: "compass",
    },
    {
      label: "Ecommerce ops and delivery",
      body: "Marketplace orders still need stock and fulfilment behind them.",
      hue: "var(--domain-operate)",
      icon: "settings",
    },
    {
      label: "Get discovered",
      body: "Listings and press strengthen how you show up in search.",
      hue: "var(--domain-discover)",
      icon: "search",
    },
  ],
  forWho:
    "Businesses ready to grow beyond their own site, whether that's selling on marketplaces, showing up locally, or earning press coverage.",
  when: [
    "Your own website is the only place people can find or buy from you.",
    "Customers search on Amazon before they search anywhere else.",
    "Local customers look you up on Google before visiting your site.",
  ],
  next: { slug: "strategy-discovery", name: "Strategy & Discovery", hue: "var(--domain-strategy)" },
};

const CONFIGS: Record<string, DomainConfig> = {
  [STRATEGY.slug]: STRATEGY,
  [BRANDING_DESIGN.slug]: BRANDING_DESIGN,
  [WEBSITES_DEVELOPMENT.slug]: WEBSITES_DEVELOPMENT,
  [SEO_CONTENT.slug]: SEO_CONTENT,
  [PAID_ADS.slug]: PAID_ADS,
  [SOCIAL_MEDIA.slug]: SOCIAL_MEDIA,
  [SOCIAL_GROWTH.slug]: SOCIAL_GROWTH,
  [FUNNELS_CONVERSION.slug]: FUNNELS_CONVERSION,
  [COURSES_MEMBERSHIPS.slug]: COURSES_MEMBERSHIPS,
  [EMAIL_SMS_CRM.slug]: EMAIL_SMS_CRM,
  [ECOMMERCE_OPS_DELIVERY.slug]: ECOMMERCE_OPS_DELIVERY,
  [RETENTION_LOYALTY_ADVOCACY.slug]: RETENTION_LOYALTY_ADVOCACY,
  [AI_AUTOMATION.slug]: AI_AUTOMATION,
  [ANALYTICS_DATA.slug]: ANALYTICS_DATA,
  [SECURITY_MAINTENANCE_COMPLIANCE.slug]: SECURITY_MAINTENANCE_COMPLIANCE,
  [MARKETPLACES_MORE.slug]: MARKETPLACES_MORE,
};

/** The domain-page config for a category slug, or undefined if it hasn't been set up yet. */
export function getServiceDomainConfig(slug: string): DomainConfig | undefined {
  return CONFIGS[slug];
}
