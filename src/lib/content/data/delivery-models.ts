import type { DeliveryModel } from "@/lib/content/types";

/**
 * The 4 delivery models (Growth Guide p.6). Every service is tagged with exactly
 * one of these, so it's always clear who does the work. Names are locked exactly.
 * Ownership line (used wherever these are explained): clients own their accounts,
 * data and tools, whichever model applies. Nothing is locked to Infinite Weblinks.
 */
export const deliveryModels: DeliveryModel[] = [
  {
    key: "we-do",
    name: "We Do the Work",
    tagline: "Done by our in-house team",
    description:
      "Our own team handles it start to finish. This is the core of what we do, and the model most of our services use.",
  },
  {
    key: "we-expert",
    name: "We Bring In an Expert",
    tagline: "Through our specialist network",
    description:
      "For specialist work like video, UGC, and parts of SEO, we bring in a vetted specialist we've worked with before, managed by us. You get expert-level work without hiring one.",
  },
  {
    key: "we-run",
    name: "We Run It End to End",
    tagline: "Fully managed for you",
    description:
      "We handle it completely and, where there's a platform involved, keep running it for you. You don't have to touch the tools.",
  },
  {
    key: "you-run",
    name: "You Run It After",
    tagline: "Set up and handed to you",
    description:
      "We build and configure the system, show you how it works, and hand you the keys so your team can run it day to day.",
  },
];
