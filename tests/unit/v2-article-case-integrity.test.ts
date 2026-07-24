import { describe, it, expect } from "vitest";
import * as data from "@/lib/content/data";
import { isRenderable, type Statused } from "@/lib/content/types";
import { domainKeyFromToken } from "@/lib/design/domainColor";

/**
 * Relationship integrity for the Learn article and case-scenario DETAIL templates. Mirrors the
 * exact resolutions the templates perform, for every renderable article and scenario, so a
 * seed-data defect that would silently drop a detail-page link (or a broken approach hue) fails
 * a test immediately. Production uses safe omission; these tests expose the defect. The summary
 * counts are what the Phase 2G report records.
 */

const renderable = <T extends Statused>(xs: readonly T[]) => xs.filter(isRenderable);

const articles = renderable(data.learnArticles);
// Case scenarios are always-illustrative and carry no status gate.
const scenarios = data.caseScenarios;

const goalBySlug = new Map(data.goals.map((g) => [g.slug, g] as const));
const serviceCatBySlug = new Map(data.serviceCategories.map((c) => [c.slug, c] as const));

type Rec = { resolved: number; unresolved: { source: string; slug: string }[] };
const summary: Record<string, Rec> = {};
const track = (type: string, source: string, slug: string, ok: boolean) => {
  const r = (summary[type] ??= { resolved: 0, unresolved: [] });
  if (ok) r.resolved += 1;
  else r.unresolved.push({ source, slug });
};

for (const a of articles) {
  for (const g of a.relatedGoalSlugs ?? []) track("article.relatedGoal", a.slug, g, goalBySlug.has(g));
}
for (const s of scenarios) {
  track("scenario.hue", s.slug, s.hue, domainKeyFromToken(s.hue) !== null);
  for (const cs of s.categorySlugs) track("scenario.category", s.slug, cs, serviceCatBySlug.has(cs));
  s.approach.forEach((step, i) =>
    track("scenario.approachHue", `${s.slug}#step-${i + 1}`, step.hue, domainKeyFromToken(step.hue) !== null),
  );
}

describe("article + case-scenario detail relationship integrity", () => {
  it("covers all renderable articles and scenarios", () => {
    expect(articles.length).toBe(5);
    expect(scenarios.length).toBe(5);
  });

  for (const type of Object.keys(summary).sort()) {
    it(`${type}: every reference resolves`, () => {
      expect(summary[type].unresolved, JSON.stringify(summary[type].unresolved)).toEqual([]);
      expect(summary[type].resolved).toBeGreaterThan(0);
    });
  }

  it("has zero unresolved references overall", () => {
    const total = Object.values(summary).reduce((n, v) => n + v.unresolved.length, 0);
    expect(total).toBe(0);
  });
});
