import { describe, it, expect } from "vitest";
import * as data from "@/lib/content/data";
import { isRenderable, type Statused } from "@/lib/content/types";

/**
 * Relationship integrity for the tool and roadmap DETAIL templates. This mirrors the exact
 * resolutions the templates perform — including the derived ones content-integrity.test.ts does
 * not cover (related service DOMAINS via service→category, and connectsWith resolved to the tool
 * in that category) — so a seed-data defect that would silently drop a detail-page link fails a
 * test immediately. Production uses safe omission (`.filter(Boolean)`); these tests are what
 * expose the defect. The summary counts are what the Phase 2F report records.
 */

const renderable = <T extends Statused>(xs: readonly T[]) => xs.filter(isRenderable);

const tools = renderable(data.tools);
const roadmaps = renderable(data.roadmaps);

const toolCatBySlug = new Map(data.toolCategories.map((c) => [c.slug, c] as const));
const toolByCategorySlug = new Map(data.tools.map((t) => [t.categorySlug, t] as const));
const serviceBySlug = new Map(data.services.map((s) => [s.slug, s] as const));
const serviceCatBySlug = new Map(data.serviceCategories.map((c) => [c.slug, c] as const));
const stageBySlug = new Map(data.stages.map((s) => [s.slug, s] as const));
const btBySlug = new Map(data.businessTypes.map((b) => [b.slug, b] as const));
const goalBySlug = new Map(data.goals.map((g) => [g.slug, g] as const));

type Rec = { resolved: number; unresolved: { source: string; slug: string }[] };
const summary: Record<string, Rec> = {};
const track = (type: string, source: string, slug: string, ok: boolean) => {
  const r = (summary[type] ??= { resolved: 0, unresolved: [] });
  if (ok) r.resolved += 1;
  else r.unresolved.push({ source, slug });
};

// --- Tool detail resolutions ---
for (const t of tools) {
  track("tool.category", t.slug, t.categorySlug, toolCatBySlug.has(t.categorySlug));

  // related service DOMAINS: relatedService → service → its category
  for (const s of t.relatedServiceSlugs) {
    const svc = serviceBySlug.get(s);
    track("tool.relatedService", t.slug, s, Boolean(svc));
    if (svc) track("tool.relatedDomain", t.slug, svc.categorySlug, serviceCatBySlug.has(svc.categorySlug));
  }
  // connectsWith category → the tool in that category (excluding self)
  for (const c of t.connectsWith) {
    const other = toolByCategorySlug.get(c);
    track("tool.connectsWith", t.slug, c, Boolean(other) && other!.slug !== t.slug);
  }
  for (const st of t.stageSlugs) track("tool.stage", t.slug, st, stageBySlug.has(st));
  for (const b of t.suitsBusinessTypeSlugs) track("tool.businessType", t.slug, b, btBySlug.has(b));
}

// --- Roadmap detail resolutions ---
for (const r of roadmaps) {
  track("roadmap.businessType", r.slug, r.forBusinessTypeSlug, btBySlug.has(r.forBusinessTypeSlug));
  r.phases.forEach((phase, i) => {
    const where = `${r.slug}#phase-${i + 1}`;
    track("roadmap.phaseStage", where, phase.stageSlug, stageBySlug.has(phase.stageSlug));
    for (const s of phase.serviceSlugs) track("roadmap.phaseService", where, s, serviceBySlug.has(s));
    for (const g of phase.goalSlugs ?? []) track("roadmap.phaseGoal", where, g, goalBySlug.has(g));
  });
}

describe("detail-template relationship integrity", () => {
  const types = Object.keys(summary).sort();
  for (const type of types) {
    it(`${type}: every referenced slug resolves`, () => {
      expect(summary[type].unresolved, JSON.stringify(summary[type].unresolved)).toEqual([]);
      expect(summary[type].resolved).toBeGreaterThan(0);
    });
  }

  it("covers all renderable tools and roadmaps", () => {
    expect(tools.length).toBe(10);
    expect(roadmaps.length).toBe(7);
  });

  it("emits a resolution summary for the report", () => {
    const report = Object.fromEntries(
      Object.entries(summary).map(([k, v]) => [k, { resolved: v.resolved, unresolved: v.unresolved.length }]),
    );
    // eslint-disable-next-line no-console
    console.log("PHASE-2F-RELATIONSHIP-SUMMARY", JSON.stringify(report));
    const totalUnresolved = Object.values(summary).reduce((n, v) => n + v.unresolved.length, 0);
    expect(totalUnresolved).toBe(0);
  });
});
