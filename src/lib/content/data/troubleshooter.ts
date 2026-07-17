import type { TroubleshooterProblem } from "@/lib/content/types";

/**
 * The Digital Growth Troubleshooter (ref 06) — pick a business problem and get a plain
 * explanation, useful checks and a sensible next step. Educational guidance only: no
 * fabricated metrics, client results or guarantees. Each problem points at a real growth
 * stage (see data/stages.ts) so the recommendation stays connected to the journey.
 */
export const troubleshooterProblems: TroubleshooterProblem[] = [
  {
    slug: "visit-no-buy",
    label: "People visit, but do not buy",
    icon: "shopping-bag",
    color: "var(--pink)",
    explanation:
      "Visitors are arriving but leaving without ordering. Usually the offer, the trust signals or the checkout are getting in the way — not the traffic.",
    reasons: [
      { title: "Unclear offer", body: "Visitors do not instantly see what you sell or why it matters to them.", icon: "help-circle" },
      { title: "Weak product page", body: "Information, images or structure do not build enough confidence to buy.", icon: "layout" },
      { title: "Limited trust", body: "Reviews, guarantees or trust signals that reassure buyers are missing.", icon: "shield" },
      { title: "Mobile friction", body: "The experience is hard to use or slow on a phone.", icon: "monitor" },
      { title: "Difficult checkout", body: "Too many steps, surprises or payment issues stop the purchase.", icon: "credit-card" },
    ],
    checks: [
      "Test the full purchase journey on your own phone, start to finish.",
      "Check whether visitors actually reach the checkout, and where they drop off.",
      "Read your key pages as a first-time buyer — is the message clear and simple?",
      "Look for unexpected friction: forms, fees or slow steps.",
      "Ask a few recent customers what nearly stopped them.",
    ],
    focusFirst: "Product clarity, the mobile journey, tracking and checkout — fix the basics that directly affect more sales.",
    recommendedStageSlug: "convert",
  },
  {
    slug: "spend-no-clarity",
    label: "We spend on marketing but do not know what works",
    icon: "megaphone",
    color: "var(--orange)",
    explanation:
      "Money is going out across channels, but you cannot see which effort brings customers. That is almost always a tracking and reporting gap, not a spending one.",
    reasons: [
      { title: "No clean tracking", body: "Conversions are not measured consistently across the site and ads.", icon: "bar-chart-3" },
      { title: "Scattered data", body: "Each channel reports on its own terms, so nothing lines up.", icon: "database" },
      { title: "Vanity metrics", body: "Clicks and likes are counted instead of enquiries and sales.", icon: "trending-up" },
      { title: "No single view", body: "There is no one place that shows what earns money and what does not.", icon: "line-chart" },
    ],
    checks: [
      "Confirm every important action (purchase, enquiry) is tracked in one place.",
      "Check that ad platforms and analytics agree on the same conversions.",
      "Map each channel to the enquiries or sales it actually produced.",
      "Pause one channel briefly and watch whether results change.",
      "Write down the one number that tells you a campaign worked.",
    ],
    focusFirst: "Clean tracking and one clear reporting view before spending more.",
    recommendedStageSlug: "get-discovered",
  },
  {
    slug: "slow-follow-up",
    label: "Enquiries arrive but follow-up is slow",
    icon: "message-square",
    color: "var(--violet)",
    explanation:
      "Leads come in but go cold before anyone replies. The fix is usually a simple, reliable follow-up system, not more leads.",
    reasons: [
      { title: "Manual handling", body: "Enquiries sit in an inbox waiting for someone to notice them.", icon: "mail" },
      { title: "No routing", body: "It is unclear who owns a new enquiry and by when.", icon: "git-branch" },
      { title: "No reminders", body: "Nothing nudges a second or third follow-up.", icon: "workflow" },
      { title: "No record", body: "Past conversations are not saved, so replies start from scratch.", icon: "folder" },
    ],
    checks: [
      "Time how long a typical enquiry waits for a first reply.",
      "Check that every enquiry lands somewhere a person will see it fast.",
      "Set a clear owner and a target response time.",
      "Add a simple reminder for a second and third follow-up.",
      "Keep a short record of each conversation in one place.",
    ],
    focusFirst: "A reliable follow-up flow with reminders and a clear owner.",
    recommendedStageSlug: "convert",
  },
  {
    slug: "few-enquiries",
    label: "Our website brings few enquiries",
    icon: "search",
    color: "var(--cyan)",
    explanation:
      "The site is live but almost nobody is finding it, or those who do are not the right people. This is usually a visibility and targeting task.",
    reasons: [
      { title: "Hard to find", body: "The site does not show up for the things customers search for.", icon: "search" },
      { title: "Wrong audience", body: "The people arriving are not a good match for what you offer.", icon: "users" },
      { title: "No clear next step", body: "Pages do not guide visitors toward enquiring.", icon: "target" },
      { title: "Thin content", body: "There is little that answers the questions buyers actually have.", icon: "book-open" },
    ],
    checks: [
      "Search for what you sell and see whether you appear.",
      "Check that each key page has one obvious next step.",
      "Review who is arriving and whether they fit your ideal customer.",
      "Add content that answers real buyer questions.",
      "Make it easy to enquire from every important page.",
    ],
    focusFirst: "Getting discovered by the right people, with a clear path to enquire.",
    recommendedStageSlug: "get-discovered",
  },
  {
    slug: "buy-once-disappear",
    label: "Customers buy once and disappear",
    icon: "heart",
    color: "var(--lime)",
    explanation:
      "First orders happen but there is no second. The opportunity is in staying in touch, not only in finding new customers.",
    reasons: [
      { title: "No follow-up", body: "Nothing brings a happy customer back after the first order.", icon: "mail" },
      { title: "No reason to return", body: "There is no offer, reminder or reward to come back for.", icon: "star" },
      { title: "Weak onboarding", body: "New customers are not helped to get value quickly.", icon: "compass" },
      { title: "No memory", body: "You do not know who bought what, so messages feel generic.", icon: "database" },
    ],
    checks: [
      "Check whether anything reaches a customer after their first order.",
      "Add a simple thank-you and helpful next-step message.",
      "Give a clear reason and reminder to buy again.",
      "Group customers so messages can fit what they bought.",
      "Ask lapsed customers what would bring them back.",
    ],
    focusFirst: "Retention basics — follow-up, a reason to return and light personalisation.",
    recommendedStageSlug: "retain",
  },
  {
    slug: "tools-not-connected",
    label: "We have many tools but nothing works together",
    icon: "git-branch",
    color: "var(--blue)",
    explanation:
      "You have collected tools over time, but they do not share data, so work is repeated and nothing gives a full picture. This is a connection task.",
    reasons: [
      { title: "Data silos", body: "Each tool holds its own version of the customer.", icon: "database" },
      { title: "Manual re-entry", body: "The same information is typed into several places.", icon: "workflow" },
      { title: "No source of truth", body: "It is unclear which system to trust when they disagree.", icon: "help-circle" },
      { title: "Gaps in the flow", body: "Hand-offs between tools drop information.", icon: "git-branch" },
    ],
    checks: [
      "List your tools and what each one is the source of truth for.",
      "Find any information you type into more than one place.",
      "Check where a customer record breaks between tools.",
      "Connect the two tools that would save the most time first.",
      "Agree which system wins when two disagree.",
    ],
    focusFirst: "Connecting the core tools around one reliable customer record.",
    recommendedStageSlug: "deliver-operate",
  },
  {
    slug: "wasted-time",
    label: "Our team wastes time on repeated tasks",
    icon: "workflow",
    color: "var(--violet-bright)",
    explanation:
      "Too much of the day goes on manual, repetitive steps. Once a process is stable, automation and AI can take the routine work off your team.",
    reasons: [
      { title: "Manual steps", body: "Routine tasks are done by hand every time.", icon: "workflow" },
      { title: "Copy and paste", body: "Information is moved between tools by a person.", icon: "folder" },
      { title: "Unstable process", body: "The steps change often, so nothing is worth automating yet.", icon: "help-circle" },
      { title: "No triggers", body: "Nothing kicks off the next step automatically.", icon: "zap" },
    ],
    checks: [
      "List the tasks your team repeats every week.",
      "Mark which of those follow the same steps every time.",
      "Stabilise one process so it is ready to automate.",
      "Automate the highest-volume repetitive task first.",
      "Check the automation with a person before trusting it fully.",
    ],
    focusFirst: "Stabilising the process first, then automating the highest-volume tasks.",
    recommendedStageSlug: "deliver-operate",
  },
  {
    slug: "unsure-priority",
    label: "We do not know what to improve first",
    icon: "compass",
    color: "var(--yellow)",
    explanation:
      "Everything feels like it needs work, so nothing gets a clear start. The answer is to look at the whole picture and pick the smallest step with the biggest effect.",
    reasons: [
      { title: "Too many options", body: "Every channel and tool competes for attention at once.", icon: "layers" },
      { title: "No clear goal", body: "Without a target, every task looks equally urgent.", icon: "target" },
      { title: "No full picture", body: "It is hard to see how the parts affect each other.", icon: "compass" },
      { title: "Fear of the wrong move", body: "Uncertainty makes it easier to do nothing.", icon: "help-circle" },
    ],
    checks: [
      "Write down the one goal that matters most this quarter.",
      "Map where you are on the growth journey today.",
      "Find the one step that unlocks the most that comes after it.",
      "Ignore anything that does not serve that goal for now.",
      "Commit to a single next step and a date.",
    ],
    focusFirst: "One clear goal, an honest look at where you are, and the smallest next step.",
    recommendedStageSlug: "discovery-plan",
  },
];
