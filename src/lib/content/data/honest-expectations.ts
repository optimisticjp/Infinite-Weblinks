/**
 * Honest expectations — what we WON'T do, next to what we DO promise. Approved trust copy, moved
 * here verbatim from HonestExpectationsSection so the legacy /about section and the new homepage
 * trust section share one source. Code-authoritative (a brand principle, not a claim to verify);
 * exact titles, body copy and source order are unchanged. No new claims.
 */

export type HonestExpectationWont = { title: string; body: string };
export type HonestExpectationPromise = { title: string; body: string; hue: string };

export const honestExpectationsWont: HonestExpectationWont[] = [
  { title: "No overnight results", body: "Real growth shows over months, not days. We'll say so up front rather than sell a shortcut." },
  { title: "No guaranteed rankings", body: "Nobody can promise a spot on Google. Anyone who does is guessing with your money." },
  { title: "No invented numbers", body: "We won't promise a set number of sales or leads to win the work." },
  { title: "No lock-in", body: "Your accounts, data and files stay in your name, so you can leave whenever you want." },
];

export const honestExpectationsPromise: HonestExpectationPromise[] = [
  { title: "A clear plan", body: "You'll always know what we're doing, in what order, and why.", hue: "var(--domain-strategy)" },
  { title: "Work done properly", body: "Built to a standard we'd be happy to show anyone, not rushed to hit a deadline.", hue: "var(--domain-build)" },
  { title: "Honest reporting", body: "Real numbers every time, including when a test doesn't work and we change course.", hue: "var(--domain-discover)" },
  { title: "Steady improvement", body: "Small, compounding steps backed by data, not big risky bets on one idea.", hue: "var(--domain-retain)" },
];
