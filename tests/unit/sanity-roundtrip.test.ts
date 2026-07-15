import { describe, it, expect } from "vitest";
import * as data from "@/lib/content/data";
import { buildAllSeedDocs, docId, type SanityDoc } from "@/lib/sanity/seed-transform";
import { RENDERABLE_STATUSES } from "@/lib/content/types";

/**
 * Round-trip fidelity: seed → Sanity document → GROQ projection === seed.
 *
 * The `project*` helpers below mirror the GROQ projections in src/lib/sanity/queries.ts. If a
 * document, once stored and projected back, does not reproduce the reviewed seed item, the seed
 * transform and the query have drifted apart — this suite fails. Because the live Sanity API is
 * unreachable from CI, this offline round-trip (plus the fallback the adapter guarantees) is what
 * grounds the read wiring; the owner confirms the live read after seeding + deploy.
 *
 * Documents are JSON round-tripped first to mirror Sanity storage (undefined keys are dropped).
 */

const stored = buildAllSeedDocs().map((d) => JSON.parse(JSON.stringify(d)) as SanityDoc);
const byId = new Map(stored.map((d) => [d._id, d]));
const of = (type: string) => stored.filter((d) => d._type === type);

/* ref helpers — mirror `ref->slug.current` / `ref->key` and `array::compact(ref[]->slug.current)` */
const slugOf = (ref: any): string | undefined => (ref ? (byId.get(ref._ref)?.slug as any)?.current : undefined);
const keyOf = (ref: any): string | undefined => (ref ? (byId.get(ref._ref)?.key as any) : undefined);
const slugs = (arr: any): string[] => (arr ?? []).map(slugOf).filter(Boolean);

/** Recursively drop undefined, null, and empty arrays so absent ≈ null ≈ [] on both sides. */
function norm(value: any): any {
  if (Array.isArray(value)) return value.map(norm);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      out[k] = norm(v);
    }
    return out;
  }
  return value;
}

const projStage = (d: any) => ({
  status: d.contentStatus.status,
  order: d.order,
  slug: d.slug.current,
  name: d.name,
  summary: d.plainSummary,
  whatHappens: d.whatHappens,
  outcome: d.outcome,
  color: d.color,
  icon: d.icon,
  serviceSlugs: slugs(d.relatedServices),
});
const projServiceCategory = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  name: d.name,
  intro: d.intro,
  order: d.order,
  icon: d.icon,
  color: d.color,
});
const projService = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  name: d.name,
  categorySlug: slugOf(d.category),
  deliveryModel: keyOf(d.deliveryModel),
  plainDescription: d.plainDescription,
  whatYouGet: d.whatYouGet ?? [],
  outcome: d.outcome,
  exampleTools: d.exampleTools ?? [],
  relatedToolSlugs: slugs(d.relatedTools),
  goalSlugs: slugs(d.relatedGoals),
  stageSlugs: slugs(d.stages),
  businessTypeSlugs: slugs(d.businessTypes),
});
const projToolCategory = projServiceCategory;
const projTool = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  name: d.name,
  categorySlug: slugOf(d.category),
  whatItDoes: d.whatItDoes,
  whyUseful: d.whyUseful,
  whenNotNeeded: d.whenNotNeeded,
  exampleTools: d.exampleTools ?? [],
  connectsWith: slugs(d.connectsWith),
  suitsBusinessTypeSlugs: slugs(d.suitsBusinessTypes),
  relatedServiceSlugs: slugs(d.relatedServices),
  stageSlugs: slugs(d.stages),
});
const projGoal = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  title: d.name,
  audienceHint: d.audienceHint,
  whatYouNeed: d.whatYouNeed,
  howWeHelp: d.howWeHelp,
  outcome: d.outcome,
  exampleTools: d.exampleTools ?? [],
  icon: d.icon,
  color: d.color,
  stageSlugs: slugs(d.stages),
  serviceSlugs: slugs(d.services),
});
const projBusinessType = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  name: d.name,
  summary: d.summary,
  description: d.description,
  icon: d.icon,
  color: d.color,
  goalSlugs: slugs(d.relatedGoals),
  roadmapSlug: slugOf(d.roadmap),
});
const projStartingPoint = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  label: d.label,
  situation: d.situation,
  recommendation: d.recommendation,
  icon: d.icon,
  color: d.color,
  recommendedStageSlug: slugOf(d.recommendedStage),
  cta: { label: d.cta.label, route: d.cta.route, style: d.cta.style },
});
const projRoadmap = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  name: d.name,
  intro: d.intro,
  forBusinessTypeSlug: slugOf(d.forBusinessType),
  phases: (d.phases ?? []).map((p: any) => ({
    title: p.title,
    summary: p.summary,
    stageSlug: slugOf(p.stage),
    serviceSlugs: slugs(p.services),
    goalSlugs: slugs(p.goals),
  })),
});
const projArticle = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug.current,
  title: d.title,
  excerpt: d.excerpt,
  body: d.body ?? [],
  readMinutes: d.readMinutes,
  publishedAt: d.publishedAt,
  relatedGoalSlugs: slugs(d.relatedGoals),
});
const projFaq = (d: any) => ({
  status: d.contentStatus.status,
  slug: d.slug?.current ?? d._id,
  question: d.question,
  answer: d.answer,
  category: d.category,
});

/** For a seed array + its `_type` + projector, assert every item round-trips. */
function roundtrips<T extends { slug?: string }>(
  seed: readonly T[],
  type: string,
  idKey: (item: T) => string,
  project: (doc: any) => unknown,
) {
  for (const item of seed) {
    const doc = byId.get(docId(type, idKey(item)));
    expect(doc, `${type} doc for ${idKey(item)} exists`).toBeDefined();
    expect(norm(project(doc)), `${type}:${idKey(item)} round-trips`).toEqual(norm(item));
  }
}

describe("seed → document → projection round-trips", () => {
  it("growth stages", () => roundtrips(data.stages, "growthStage", (s) => s.slug, projStage));
  it("service categories", () =>
    roundtrips(data.serviceCategories, "serviceCategory", (c) => c.slug, projServiceCategory));
  it("services (all 70)", () => roundtrips(data.services, "service", (s) => s.slug, projService));
  it("tool categories", () => roundtrips(data.toolCategories, "toolCategory", (c) => c.slug, projToolCategory));
  it("tools", () => roundtrips(data.tools, "tool", (t) => t.slug, projTool));
  it("goals", () => roundtrips(data.goals, "goal", (g) => g.slug, projGoal));
  it("business types", () => roundtrips(data.businessTypes, "businessType", (b) => b.slug, projBusinessType));
  it("starting points", () =>
    roundtrips(data.startingPoints, "startingPoint", (p) => p.slug, projStartingPoint));
  it("roadmaps", () => roundtrips(data.roadmaps, "roadmap", (r) => r.slug, projRoadmap));
  it("learn articles", () => roundtrips(data.learnArticles, "article", (a) => a.slug, projArticle));
  it("faqs", () => roundtrips(data.faqs, "faq", (f) => f.slug, projFaq));
});

describe("seed dataset integrity", () => {
  it("has no duplicate document ids", () => {
    const ids = stored.map((d) => d._id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every reference resolves to a seeded document (graph preserved)", () => {
    const dangling: string[] = [];
    const walk = (v: any) => {
      if (v && typeof v === "object") {
        if (v._type === "reference" && v._ref && !byId.has(v._ref)) dangling.push(v._ref);
        for (const k of Object.keys(v)) walk(v[k]);
      }
    };
    stored.forEach(walk);
    expect(dangling).toEqual([]);
  });

  it("never seeds fake proof (caseStudy / testimonial / example) into the CMS", () => {
    expect(of("caseStudy")).toHaveLength(0);
    expect(of("testimonial")).toHaveLength(0);
    expect(of("example")).toHaveLength(0);
  });

  it("every seeded document carries a valid contentStatus", () => {
    const allowed = new Set([...RENDERABLE_STATUSES, "draft", "placeholder", "approvalRequired"]);
    for (const d of stored) {
      const status = (d.contentStatus as any)?.status;
      expect(allowed.has(status), `${d._id} status ${status}`).toBe(true);
    }
  });
});
