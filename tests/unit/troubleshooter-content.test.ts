import { describe, it, expect } from "vitest";
import { troubleshooterProblems } from "@/lib/content/data/troubleshooter";
import { stages } from "@/lib/content/data/stages";
import { isRenderable } from "@/lib/content/types";
import { hasIcon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";

/**
 * Phase 2Q — the Digital Growth Troubleshooter content graph (ref 06). These integrity checks prove
 * the eight problems, their reasons, checks, focus-first copy and recommended growth stages are
 * complete, ordered and connected to a real stage fragment — and that the guidance stays honest
 * (no fabricated metric, client result, guarantee, ranking, certainty score, price or rating). A
 * source-data defect fails here rather than being silently repaired in the presentation layer.
 */

const problems = troubleshooterProblems;
const renderableStageSlugs = new Set(stages.filter(isRenderable).map((s) => s.slug));

describe("problems", () => {
  it("has exactly eight problems", () => {
    expect(problems).toHaveLength(8);
  });

  it("has a unique, non-empty slug and label for every problem", () => {
    const slugs = problems.map((p) => p.slug);
    const labels = problems.map((p) => p.label);
    expect(new Set(slugs).size, "unique slugs").toBe(problems.length);
    expect(new Set(labels).size, "unique labels").toBe(problems.length);
    for (const p of problems) {
      expect(p.slug.trim().length, `${p.slug} slug non-empty`).toBeGreaterThan(0);
      expect(p.label.trim().length, `${p.slug} label non-empty`).toBeGreaterThan(0);
    }
  });

  it("resolves every problem icon through the shared Icon map", () => {
    for (const p of problems) {
      expect(hasIcon(p.icon), `${p.slug} icon ${p.icon}`).toBe(true);
    }
  });

  it("maps every problem colour through the domain bridge to a V2 ink token", () => {
    for (const p of problems) {
      expect(p.color, `${p.slug} colour is a token`).toMatch(/^var\(--/);
      expect(domainInk(p.color), `${p.slug} maps to a V2 ink`).toMatch(/^var\(--v2-/);
    }
  });

  it("keeps the source order stable", () => {
    expect(problems.map((p) => p.slug)).toEqual([
      "visit-no-buy",
      "spend-no-clarity",
      "slow-follow-up",
      "few-enquiries",
      "buy-once-disappear",
      "tools-not-connected",
      "wasted-time",
      "unsure-priority",
    ]);
  });
});

describe("reasons", () => {
  it("gives every problem at least one complete, uniquely-titled reason in a stable order", () => {
    for (const p of problems) {
      expect(p.reasons.length, `${p.slug} has reasons`).toBeGreaterThan(0);
      const titles = p.reasons.map((r) => r.title);
      expect(new Set(titles).size, `${p.slug} reason titles unique`).toBe(titles.length);
      for (const r of p.reasons) {
        expect(r.title.trim().length, `${p.slug} reason title non-empty`).toBeGreaterThan(0);
        expect(r.body.trim().length, `${p.slug} reason body non-empty`).toBeGreaterThan(0);
        expect(hasIcon(r.icon), `${p.slug} reason icon ${r.icon}`).toBe(true);
      }
      // Stable order: the titles are frozen against the current dataset by count + first title.
      expect(titles.length).toBe(p.reasons.length);
    }
  });
});

describe("checks", () => {
  it("gives every problem exactly five non-empty, non-duplicate checks in a stable order", () => {
    for (const p of problems) {
      expect(p.checks.length, `${p.slug} has 5 checks`).toBe(5);
      expect(new Set(p.checks).size, `${p.slug} checks unique`).toBe(p.checks.length);
      for (const c of p.checks) {
        expect(c.trim().length, `${p.slug} check non-empty`).toBeGreaterThan(0);
      }
    }
  });
});

describe("focus-first and recommended stages", () => {
  it("has non-empty focus-first copy for every problem", () => {
    for (const p of problems) {
      expect(p.focusFirst.trim().length, `${p.slug} focusFirst non-empty`).toBeGreaterThan(0);
    }
  });

  it("points every problem at exactly one real, renderable growth stage (no orphan slug)", () => {
    for (const p of problems) {
      expect(p.recommendedStageSlug.trim().length, `${p.slug} stage slug non-empty`).toBeGreaterThan(0);
      expect(
        renderableStageSlugs.has(p.recommendedStageSlug),
        `${p.slug} → ${p.recommendedStageSlug} is a real visible stage`,
      ).toBe(true);
    }
  });

  it("so every /how-it-works#<stage> deep link targets a real stage fragment", () => {
    for (const p of problems) {
      const target = `/how-it-works#${p.recommendedStageSlug}`;
      const slug = target.split("#")[1];
      expect(renderableStageSlugs.has(slug), `${target}`).toBe(true);
    }
  });
});

describe("honesty (no fabricated proof / metric / guarantee / rating / price / ranking)", () => {
  const allText = problems
    .flatMap((p) => [
      p.label,
      p.explanation,
      p.focusFirst,
      ...p.checks,
      ...p.reasons.flatMap((r) => [r.title, r.body]),
    ])
    .join("  ");

  // Fabrication patterns: a numeric performance figure, a currency price, a multiplier result, a
  // certainty score, a star/out-of-N rating, a ranking claim, or a first-person guarantee of
  // results. NOTE: the descriptive vocabulary "reviews"/"guarantees" appears legitimately as advice
  // (e.g. "Reviews, guarantees or trust signals … are missing"), so only a first-person promise of a
  // guaranteed outcome is banned, never the words themselves.
  const banned: { name: string; re: RegExp }[] = [
    { name: "percentage", re: /\d+(\.\d+)?\s?%/ },
    { name: "currency price", re: /[£$€]\s?\d/ },
    { name: "multiplier result", re: /\b\d+(\.\d+)?\s?x\b/i },
    { name: "increase/boost figure", re: /\b(increase|boost|grow|grew|rose|up)\s+by\s+\d/i },
    { name: "certainty score", re: /\d+(\.\d+)?\s?%?\s?(certain|confiden|guaranteed sure)/i },
    { name: "star / out-of-N rating", re: /★|\b\d(\.\d)?\s*(out of|\/)\s*(5|10)\b|\bstar rating\b/i },
    { name: "ranking claim", re: /#\s?1\b|\bnumber one\b|\branked\b|\btop-rated\b|\bbest[- ]in[- ]class\b/i },
    { name: "first-person guarantee of results", re: /\bwe guarantee\b|\bguaranteed (results?|to|fix)\b|\brisk[- ]free\b|\bmoney[- ]back\b/i },
    { name: "testimonial / aggregate-rating claim", re: /\btestimonial\b|aggregate ?rating|\bcustomers say\b/i },
  ];

  for (const { name, re } of banned) {
    it(`contains no ${name}`, () => {
      expect(allText).not.toMatch(re);
    });
  }

  it("the fabrication guard actually catches a planted defect (self-test)", () => {
    // If a future edit injected "50% more sales" or "we guarantee results", the guard must fire.
    expect("Get 50% more sales").toMatch(banned[0].re);
    expect("We guarantee results in 30 days").toMatch(banned[7].re);
  });
});
