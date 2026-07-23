import { describe, it, expect } from "vitest";
import {
  pricingFactors,
  pricingDeliveryCostNotes,
  pricingEngagementShapes,
  pricingQuoteSteps,
  pricingFaqs,
} from "@/lib/content/data/pricing";
import { deliveryModels } from "@/lib/content/data/delivery-models";
import { DELIVERY_MODEL_KEYS } from "@/lib/design/deliveryModel";

/**
 * Phase 2N — the centralised /pricing content. Locks the counts, source order and exact copy that
 * were moved verbatim out of the route, proves the delivery-cost map is exhaustive over the four
 * canonical keys with no fallback to a model description, and guards the honest-pricing rule: not a
 * single currency figure, price, range, rate or minimum appears anywhere in the pricing content.
 */

describe("pricing content — counts and source order", () => {
  it("has exactly 6 factors in source order", () => {
    expect(pricingFactors).toHaveLength(6);
    expect(pricingFactors.map((f) => f.title)).toEqual([
      "The scope of the work",
      "The goal behind it",
      "The way we work together",
      "How much connects",
      "One-off or ongoing",
      "How soon you need it",
    ]);
  });

  it("has exactly 3 engagement shapes in source order", () => {
    expect(pricingEngagementShapes).toHaveLength(3);
    expect(pricingEngagementShapes.map((s) => s.title)).toEqual([
      "A focused fix",
      "A build project",
      "An ongoing partnership",
    ]);
  });

  it("has exactly 4 quote steps in source order", () => {
    expect(pricingQuoteSteps).toHaveLength(4);
    expect(pricingQuoteSteps.map((s) => s.title)).toEqual([
      "Build a plan",
      "We scope it with you",
      "You get a written quote",
      "We start on the first step",
    ]);
  });

  it("has exactly 5 FAQs in source order", () => {
    expect(pricingFaqs).toHaveLength(5);
    expect(pricingFaqs.map((f) => f.question)).toEqual([
      "Do you have a fixed price list?",
      "How do I get a price?",
      "Does the growth plan cost anything?",
      "Is it a one-off cost or ongoing?",
      "Will I be locked in?",
    ]);
  });
});

describe("pricing factors — exact copy, icons and tones", () => {
  it("matches the approved factor content verbatim", () => {
    expect(pricingFactors).toEqual([
      { title: "The scope of the work", blurb: "How much there is to build or set up, and how much of it is new versus tidying what you already have.", icon: "layers", tone: "var(--domain-build)" },
      { title: "The goal behind it", blurb: "A quick fix to unblock one thing costs less than building a system meant to grow with you for years.", icon: "target", tone: "var(--domain-strategy)" },
      { title: "The way we work together", blurb: "Whether our team does it, we bring in a specialist, we run it for you, or we hand it over changes the cost.", icon: "workflow", tone: "var(--domain-operate)" },
      { title: "How much connects", blurb: "Joining a few tools cleanly is more involved than a single standalone page, and it shows in the quote.", icon: "git-branch", tone: "var(--domain-discover)" },
      { title: "One-off or ongoing", blurb: "Some work is a single project. Some is a monthly arrangement where we keep improving what is live.", icon: "gauge", tone: "var(--domain-retain)" },
      { title: "How soon you need it", blurb: "A comfortable timeline keeps costs steady. Compressing the work to hit a hard date can add to it.", icon: "compass", tone: "var(--domain-ai)" },
    ]);
  });
});

describe("pricing delivery-cost notes — exhaustive, no fallback", () => {
  it("covers exactly the four canonical delivery keys and no others", () => {
    expect(Object.keys(pricingDeliveryCostNotes).sort()).toEqual([...DELIVERY_MODEL_KEYS].sort());
  });

  it("maps each key to its exact cost-shape note", () => {
    expect(pricingDeliveryCostNotes).toEqual({
      "we-do": "A project fee for one-off builds, or a monthly amount when it is ongoing. Priced to the scope we agree up front.",
      "we-expert": "The specialist's rate for their part, plus our time to brief and manage them. Expert work without hiring in-house.",
      "we-run": "Usually a recurring fee, since we keep the platform running for you. It scales with how much we manage day to day.",
      "you-run": "Set-up is a one-off. After we hand over, the running cost is the tools' own subscriptions, paid by you, in your name.",
    });
  });

  it("never falls back to a delivery model's own description", () => {
    for (const m of deliveryModels) {
      const note = pricingDeliveryCostNotes[m.key];
      expect(note, `${m.key} has a note`).toBeTruthy();
      expect(note, `${m.key} note is a distinct cost note, not the model description`).not.toBe(m.description);
    }
  });
});

describe("pricing engagement shapes — exact copy and notes", () => {
  it("matches the approved shape content verbatim", () => {
    expect(pricingEngagementShapes).toEqual([
      { title: "A focused fix", blurb: "One clear job: a specific page, a broken step in a funnel, or a single integration that is holding you up.", icon: "check", tone: "var(--domain-strategy)", note: "Quoted to scope" },
      { title: "A build project", blurb: "A website, store, or connected set of tools built and configured, then handed to you or run on your behalf.", icon: "layout", tone: "var(--domain-build)", note: "Quoted to scope" },
      { title: "An ongoing partnership", blurb: "We plan, build and connect in stages, and keep improving what is live as your goals move on.", icon: "trending-up", tone: "var(--domain-retain)", note: "Monthly, quoted to scope" },
    ]);
  });

  it("uses only the two approved 'quoted to scope' notes — never a figure", () => {
    for (const s of pricingEngagementShapes) {
      expect(["Quoted to scope", "Monthly, quoted to scope"]).toContain(s.note);
    }
  });
});

describe("pricing quote steps and FAQs — exact copy", () => {
  it("matches the approved quote-step content verbatim", () => {
    expect(pricingQuoteSteps).toEqual([
      { title: "Build a plan", blurb: "Use the growth plan builder. It is free, takes a few minutes, and gives you a prioritised list of steps." },
      { title: "We scope it with you", blurb: "A short conversation to confirm what matters now, and what is fine to leave for a later step." },
      { title: "You get a written quote", blurb: "Clear scope and a clear price for the agreed work, in writing, before anything starts." },
      { title: "We start on the first step", blurb: "The smallest step that moves you forward, done and working, then on to the next one." },
    ]);
  });

  it("matches the approved FAQ content verbatim", () => {
    expect(pricingFaqs).toEqual([
      { question: "Do you have a fixed price list?", answer: "No. What things cost depends on the scope, the goal, and the way we work together, so we quote each piece of work after we understand it rather than publishing set prices that would rarely fit." },
      { question: "How do I get a price?", answer: "Build a growth plan or get in touch. We scope the work with you and send a written quote with clear scope and price before any work begins." },
      { question: "Does the growth plan cost anything?", answer: "No. Building a plan on this site is free and takes a few minutes. It gives you a prioritised list of steps. A quote for any work follows once we have scoped it with you." },
      { question: "Is it a one-off cost or ongoing?", answer: "It can be either. Some work is a single project with a project fee. Some is a monthly arrangement where we keep running or improving what is live. The way of working you choose decides which." },
      { question: "Will I be locked in?", answer: "No. Whichever way we work, your accounts, data and tools stay in your name. Nothing is locked to Infinite Weblinks, and you can take your work with you." },
    ]);
  });
});

describe("pricing content — no invented figures anywhere", () => {
  const allStrings = [
    ...pricingFactors.flatMap((f) => [f.title, f.blurb]),
    ...Object.values(pricingDeliveryCostNotes),
    ...pricingEngagementShapes.flatMap((s) => [s.title, s.blurb, s.note]),
    ...pricingQuoteSteps.flatMap((s) => [s.title, s.blurb]),
    ...pricingFaqs.flatMap((f) => [f.question, f.answer]),
  ];

  it("contains no currency symbol", () => {
    for (const s of allStrings) expect(s, `"${s}" has no currency symbol`).not.toMatch(/[£$€]/);
  });

  it("contains no numeric figure (so no price, range, minimum, rate or duration can hide)", () => {
    // The pricing copy is deliberately number-free; a digit would signal an invented figure.
    for (const s of allStrings) expect(s, `"${s}" has no digit`).not.toMatch(/\d/);
  });

  it("preserves approved qualitative duration language while a numeric duration would be caught", () => {
    // "a few minutes" is approved qualitative copy — no digit, so allowed.
    expect(pricingQuoteSteps.some((s) => s.blurb.includes("a few minutes"))).toBe(true);
    // A numeric duration (what we DO ban) contains a digit and would fail the number-free rule.
    expect("takes 5 minutes").toMatch(/\d/);
    expect("2 weeks").toMatch(/\d/);
  });
});
