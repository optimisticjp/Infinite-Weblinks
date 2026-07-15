import type { LearnArticle } from "@/lib/content/types";

/**
 * Short educational articles grounded in the Growth Guide's own explanations
 * (pp.3, 6, 18-19, 24). No hype, no invented statistics, just the plain-English
 * reasoning the Guide already gives for how things fit together.
 */
export const learnArticles: LearnArticle[] = [
  {
    status: "verified",
    slug: "how-online-growth-works-as-one-system",
    title: "How Online Growth Works as One System",
    excerpt:
      "Why treating your website, marketing, and tools as one connected system beats juggling them as separate projects.",
    body: [
      "Every business we work with moves through roughly the same journey: a plan, a foundation, getting discovered, building trust, converting, delivering, retaining, and turning happy customers into a growth channel of their own. The order matters, because each step tends to need the one before it.",
      "It's tempting to treat SEO, ads, social, email, and the website itself as separate projects run by separate people. In practice, they work far better joined up. SEO, ads, and social all bring people to the same website or funnel. That destination needs to be built to convert, with tracking on every step, or the traffic is wasted.",
      "Once a visitor becomes a customer, analytics shows what's actually working, email and SMS bring them back, and automation handles the repetitive parts. Retention and referrals then feed back into the top of the system, lowering what it costs to win the next sale.",
      "When these pieces are separate, value leaks out in the gaps: ad clicks land on a weak page, sales go untracked, customers are never brought back. When they're connected, each part makes the others work harder. That's the whole idea behind treating growth as one system rather than a list of disconnected tactics.",
    ],
    readMinutes: 6,
    relatedGoalSlugs: ["understand-whats-working"],
  },
  {
    status: "verified",
    slug: "choosing-the-right-first-step",
    title: "Choosing the Right First Step",
    excerpt:
      "With so much you could do online, here's how to find the smallest next step that actually moves things forward.",
    body: [
      "New tools, channels, and tactics appear constantly, and it's easy to feel like you should be doing all of them at once. Most businesses don't need to, and trying usually spreads effort too thin to make progress on anything.",
      "A more useful question than \"what could I do?\" is \"where am I now, and what's the next thing that actually needs to happen?\" A business with no website yet doesn't need an advanced retention strategy. A business with steady traffic but few sales doesn't need more traffic, it needs to fix what happens once people arrive.",
      "This is why starting points matter more than a long list of possible services. Reading down a short list of situations, from \"just starting, nothing built yet\" through to \"established and want to scale\", usually points to a fairly obvious next step.",
      "Most businesses sit in more than one situation at once, and that's normal. The goal isn't to do everything on the menu, it's to pick the smallest next step that removes the biggest current blocker, then move to the next one once that's working.",
    ],
    readMinutes: 5,
  },
  {
    status: "verified",
    slug: "what-connected-tools-actually-means",
    title: "What \"Connected\" Tools Actually Means",
    excerpt:
      "A few tools that talk to each other cleanly beat a dozen that don't. Here's what connected really looks like in practice.",
    body: [
      "More tools is not automatically better. A stack of a dozen platforms that don't share data usually creates more admin than it saves, and makes it harder to see a single, trustworthy picture of what's happening.",
      "Connected, in practice, means a handful of things: an event on your site or store (a purchase, a sign-up, a form submission) shows up correctly in analytics; an email platform can see that behaviour and act on it; a CRM reflects the same customer record a support tool uses; and reporting can be built without manually stitching spreadsheets together.",
      "This is why tool choice matters less than tool fit. The right stack depends on your size, budget, and goals, not on which platform is trending. A small local business rarely needs the same stack as a fast-growing ecommerce brand, and forcing one onto the other usually creates unnecessary cost and complexity.",
      "Whatever gets set up, the accounts and billing should sit in your name. That's not just a nice-to-know detail, it's what keeps a connected stack actually yours, rather than dependent on whoever set it up.",
    ],
    readMinutes: 5,
    relatedGoalSlugs: ["save-time-with-automation"],
  },
  {
    status: "verified",
    slug: "understanding-delivery-models",
    title: "Understanding Delivery Models: Who Actually Does the Work",
    excerpt:
      "In-house, specialist network, fully managed, or handed over to you, what each delivery model means and when it fits.",
    body: [
      "Not every piece of work makes sense delivered the same way, and that's on purpose. Four models cover most of it: work done fully in-house, work brought in through a vetted specialist network, work run end to end on your behalf, and work that's built, configured, and then handed over for your team to run.",
      "In-house work makes sense where consistency and direct accountability matter most, core strategy, website builds, and day-to-day campaign management, for example. Specialist network work makes sense for things that benefit from a dedicated expert, like video production or a particular flavour of SEO, without the cost and risk of hiring and managing a freelancer directly.",
      "Fully managed work suits ongoing, platform-heavy jobs where it's simpler for one team to keep running the system than to hand it back and forth. Handed-over work suits systems your own team is equipped to run day to day once it's properly set up and explained, like a CRM or a set of automations.",
      "Whichever model applies to a given service, the same rule holds: the accounts, data, and tools stay in your name. Nothing is locked in. The delivery model is about who does the work, not who owns it.",
    ],
    readMinutes: 6,
  },
  {
    status: "verified",
    slug: "what-good-progress-actually-looks-like",
    title: "What Good Progress Actually Looks Like",
    excerpt:
      "Honest expectations for early wins, mid-term growth, and long-term compounding, grounded in real work, not hype.",
    body: [
      "It's worth being upfront about what to expect, because a lot of marketing promises overnight results, guaranteed rankings, or a fixed number of sales. Nobody can honestly promise those. Real growth depends on your market, your offer, and your budget, and it compounds over time rather than arriving all at once.",
      "Early on, good progress usually looks unglamorous: the foundations are right, tracking is clean, and you can finally see what's actually happening. That visibility alone is often the biggest early win, because it replaces guesswork with evidence.",
      "Over the following months, traffic and conversions typically trend upward while wasted spend trends down, as the weakest points get identified and fixed. As things mature, repeat customers and referrals grow, which tends to lower what it costs to win the next sale.",
      "Throughout, the aim is for decisions to get easier because they're backed by real numbers rather than hunches, and for you to always know what was done, why, and what's next.",
    ],
    readMinutes: 5,
  },
];
