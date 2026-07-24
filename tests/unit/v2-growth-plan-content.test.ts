import { describe, it, expect } from "vitest";
import * as growthPlanContent from "@/lib/content/data/growth-plan";
import { growthPlanHeroTrustPoints, growthPlanIncludes } from "@/lib/content/data/growth-plan";
import { hasIcon } from "@/components/primitives/Icon";

/**
 * Phase 2P/2Q — the centralised growth-plan presentation content. Locks the exact copy, counts and
 * source order of the hero trust points and the six "what your plan can include" cards, and guards
 * that no invented price/result/proof or persistence/download/email-copy claim appears.
 *
 * Phase 2Q retirement: the old decorative five-line hero preview list (`growthPlanPreviewItems`) was
 * removed — it had no route or design-preview consumer and duplicated, at less depth, the six-item
 * `growthPlanIncludes`. This test guards that it stays gone (no near-duplicate five-item section).
 */

describe("hero trust points", () => {
  it("are the three approved reassurances in source order", () => {
    expect(growthPlanHeroTrustPoints).toEqual([
      "Takes a few minutes",
      "No sign-up, no cost",
      "Honest advice, not a sales pitch",
    ]);
  });
});

describe("retired preview list", () => {
  it("no longer exports the unused decorative five-line preview list", () => {
    expect("growthPlanPreviewItems" in growthPlanContent).toBe(false);
  });
});

describe("what the plan can include", () => {
  it("has the six approved items, in source order, with exact titles/bodies", () => {
    expect(growthPlanIncludes).toEqual([
      {
        title: "A starting point",
        body: "The stage that fits you now, and why it's the sensible place to begin.",
        icon: "compass",
        tone: "var(--domain-strategy)",
      },
      {
        title: "A connected roadmap",
        body: "What to do first, what to connect next, and what can wait, in order.",
        icon: "git-branch",
        tone: "var(--domain-discover)",
      },
      {
        title: "Relevant services",
        body: "The services that move you forward, and the delivery model options for each.",
        icon: "layers",
        tone: "var(--domain-convert)",
      },
      {
        title: "The right tools",
        body: "Real tools that fit your setup, chosen to work together, never a random list.",
        icon: "wrench",
        tone: "var(--domain-build)",
      },
      {
        title: "Priorities for later",
        body: "What to add once the first steps are working, so effort compounds.",
        icon: "gauge",
        tone: "var(--domain-operate)",
      },
      {
        title: "How we'd help",
        body: "A plain note on where we'd do the work and where you'd keep control.",
        icon: "users",
        tone: "var(--domain-retain)",
      },
    ]);
  });

  it("uses only resolvable shared icon names and mapped tones", () => {
    for (const item of growthPlanIncludes) {
      expect(hasIcon(item.icon), `${item.icon} resolves`).toBe(true);
      expect(item.tone).toMatch(/^var\(--/);
    }
  });
});

describe("no invented figure or unsupported claim", () => {
  const allText = [
    ...growthPlanHeroTrustPoints,
    ...growthPlanIncludes.flatMap((i) => [i.title, i.body]),
  ].join(" ");

  it("makes no price, rating, guarantee, persistence, download or email-copy claim", () => {
    expect(allText).not.toMatch(
      /[£$€]\s?\d|guarantee|\bsaved\b|\bdownload\b|yours to keep|emailed to you|sent to your email|★|\brated\b/i,
    );
  });
});
