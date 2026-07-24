/**
 * Honest expectations — what we WON'T do, next to what we DO promise. Approved trust copy, shared by
 * the /about section and the homepage trust section from one source. The "won't do" side is honest
 * limits (disclaimers); the "do promise" side is a service commitment. One absolute adverb ("always
 * know") was softened for accuracy in Phase 3B; the ownership commitment ("no lock-in") is a
 * business-policy commitment tracked in the public claims register + release blockers.
 */

export type HonestExpectationWont = { title: string; body: string };
export type HonestExpectationPromise = { title: string; body: string; hue: string };

export const honestExpectationsWont: HonestExpectationWont[] = [
  {
    title: "No overnight results",
    body: "Real growth shows over months, not days. We'll say so up front rather than sell a shortcut.",
  },
  {
    title: "No guaranteed rankings",
    body: "Nobody can promise a spot on Google. Anyone who does is guessing with your money.",
  },
  {
    title: "No invented numbers",
    body: "We won't promise a set number of sales or leads to win the work.",
  },
  {
    title: "No lock-in",
    body: "Your accounts, data and files stay in your name, so you can leave whenever you want.",
  },
];

export const honestExpectationsPromise: HonestExpectationPromise[] = [
  {
    title: "A clear plan",
    body: "You'll know what we're doing, in what order, and why.",
    hue: "var(--domain-strategy)",
  },
  {
    title: "Work done properly",
    body: "Built to a standard we'd be happy to show anyone, not rushed to hit a deadline.",
    hue: "var(--domain-build)",
  },
  {
    title: "Honest reporting",
    body: "Real numbers every time, including when a test doesn't work and we change course.",
    hue: "var(--domain-discover)",
  },
  {
    title: "Steady improvement",
    body: "Small, compounding steps backed by data, not big risky bets on one idea.",
    hue: "var(--domain-retain)",
  },
];
