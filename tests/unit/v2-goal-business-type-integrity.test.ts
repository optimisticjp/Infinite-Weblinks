import { describe, it, expect } from "vitest";
import * as data from "@/lib/content/data";
import { isRenderable, type Statused } from "@/lib/content/types";
import { domainKeyFromToken } from "@/lib/design/domainColor";

/**
 * Relationship integrity for the goal and business-type DETAIL templates. It mirrors the exact
 * resolutions the two migrated templates perform, for every renderable goal and business type, so
 * a seed-data defect that would silently drop a detail-page card (or leave a service's category
 * unresolved, or a tone unmappable) fails a test immediately. Production uses safe omission (and a
 * neutral category fallback on ServiceCard); these tests expose the defect instead. The summary
 * counts are what the Phase 2H report records.
 */

const renderable = <T extends Statused>(xs: readonly T[]) => xs.filter(isRenderable);

const goals = renderable(data.goals);
const businessTypes = renderable(data.businessTypes);
const services = data.services;

const goalBySlug = new Map(data.goals.map((g) => [g.slug, g] as const));
const serviceBySlug = new Map(services.map((s) => [s.slug, s] as const));
const serviceCatBySlug = new Map(data.serviceCategories.map((c) => [c.slug, c] as const));
const stageBySlug = new Map(data.stages.map((s) => [s.slug, s] as const));
const roadmapBySlug = new Map(data.roadmaps.map((r) => [r.slug, r] as const));

const DELIVERY_MODELS = ["we-do", "we-expert", "we-run", "you-run"] as const;

type Rec = { resolved: number; unresolved: { source: string; slug: string }[] };
const summary: Record<string, Rec> = {};
const track = (type: string, source: string, slug: string, ok: boolean) => {
  const r = (summary[type] ??= { resolved: 0, unresolved: [] });
  if (ok) r.resolved += 1;
  else r.unresolved.push({ source, slug });
};

// --- Goal detail template resolutions ---
for (const g of goals) {
  track("goal.tone", g.slug, g.color, domainKeyFromToken(g.color) !== null);
  for (const s of g.serviceSlugs) {
    const service = serviceBySlug.get(s);
    track("goal.service", g.slug, s, Boolean(service));
    // Each resolved service resolves its own category (real label/icon/tone on ServiceCard).
    if (service) {
      track("goal.serviceCategory", `${g.slug}:${s}`, service.categorySlug, serviceCatBySlug.has(service.categorySlug));
    }
  }
  for (const st of g.stageSlugs) track("goal.stage", g.slug, st, stageBySlug.has(st));
}

// --- Business-type detail template resolutions ---
for (const b of businessTypes) {
  track("businessType.tone", b.slug, b.color, domainKeyFromToken(b.color) !== null);
  for (const gs of b.goalSlugs) track("businessType.goal", b.slug, gs, goalBySlug.has(gs));
  if (b.roadmapSlug) track("businessType.roadmap", b.slug, b.roadmapSlug, roadmapBySlug.has(b.roadmapSlug));

  // The DERIVED service domains — the exact derivation the template performs (services whose
  // businessTypeSlugs include this type → categorySlug → dedup first-seen → real ServiceCategory).
  const derived = [
    ...new Set(services.filter((sv) => sv.businessTypeSlugs.includes(b.slug)).map((sv) => sv.categorySlug)),
  ];
  for (const cs of derived) track("businessType.domain", b.slug, cs, serviceCatBySlug.has(cs));
}

// --- Every service carries one of the four locked delivery models ---
for (const s of services) {
  track("service.deliveryModel", s.slug, s.deliveryModel, (DELIVERY_MODELS as readonly string[]).includes(s.deliveryModel));
}

describe("goal + business-type detail relationship integrity", () => {
  it("covers all renderable goals and business types", () => {
    expect(goals.length).toBeGreaterThan(0);
    expect(businessTypes.length).toBeGreaterThan(0);
  });

  it("every business type derives at least one service domain", () => {
    for (const b of businessTypes) {
      const derived = new Set(
        services.filter((sv) => sv.businessTypeSlugs.includes(b.slug)).map((sv) => sv.categorySlug),
      );
      expect(derived.size, b.slug).toBeGreaterThan(0);
    }
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
