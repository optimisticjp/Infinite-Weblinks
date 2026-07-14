import { describe, it, expect } from "vitest";
import * as data from "@/lib/content/data";
import { RENDERABLE_STATUSES, type ContentStatus } from "@/lib/content/types";

/**
 * Referential-integrity invariants on the seed content. Every cross-slug reference must
 * resolve to a real item, the locked taxonomy (8 stages / 3 systems / 4 delivery models)
 * must stay exactly as named, and every status must be a known value. This is what stops
 * a future content edit from quietly introducing a dangling link or renaming a locked
 * stage — the app resolves cross-links by slug, so an unresolved slug is a real defect.
 */

const VALID_STATUSES: ContentStatus[] = [
  "draft",
  "placeholder",
  "approvalRequired",
  "verified",
  "readyToPublish",
];
const DELIVERY_KEYS = new Set(["we-do", "we-expert", "we-run", "you-run"]);

const slugSet = <T extends { slug: string }>(items: readonly T[]) => new Set(items.map((i) => i.slug));

const stageSlugs = slugSet(data.stages);
const systemKeys = new Set(data.systems.map((s) => s.key));
const goalSlugs = slugSet(data.goals);
const businessTypeSlugs = slugSet(data.businessTypes);
const serviceSlugs = slugSet(data.services);
const serviceCategorySlugs = slugSet(data.serviceCategories);
const toolSlugs = slugSet(data.tools);
const toolCategorySlugs = slugSet(data.toolCategories);
const roadmapSlugs = slugSet(data.roadmaps);

function expectAllIn(values: readonly string[], universe: Set<string>, label: string) {
  const missing = values.filter((v) => !universe.has(v));
  expect(missing, `${label}: unresolved ${JSON.stringify(missing)}`).toEqual([]);
}

describe("content integrity — locked taxonomy", () => {
  it("has exactly the 8 named growth stages in order 1..8", () => {
    expect(data.stages).toHaveLength(8);
    expect([...data.stages].sort((a, b) => a.order - b.order).map((s) => s.name)).toEqual([
      "Discovery & Plan",
      "Foundation",
      "Get Discovered",
      "Build Trust",
      "Convert",
      "Deliver & Operate",
      "Retain",
      "Advocacy & Growth",
    ]);
    expect(new Set(data.stages.map((s) => s.order))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  });

  it("has exactly the 3 named cross-cutting systems", () => {
    expect(data.systems.map((s) => s.name)).toEqual([
      "AI & Automation",
      "Analytics & Data",
      "Maintenance & Scale",
    ]);
  });

  it("has exactly the 4 named delivery models with valid keys", () => {
    expect(data.deliveryModels).toHaveLength(4);
    expect(data.deliveryModels.map((d) => d.name)).toEqual([
      "We Do the Work",
      "We Bring In an Expert",
      "We Run It End to End",
      "You Run It After",
    ]);
    for (const d of data.deliveryModels) expect(DELIVERY_KEYS.has(d.key)).toBe(true);
  });
});

describe("content integrity — unique slugs & valid statuses", () => {
  const collections: Record<string, readonly { slug: string }[]> = {
    stages: data.stages,
    goals: data.goals,
    businessTypes: data.businessTypes,
    startingPoints: data.startingPoints,
    serviceCategories: data.serviceCategories,
    services: data.services,
    toolCategories: data.toolCategories,
    tools: data.tools,
    roadmaps: data.roadmaps,
    faqs: data.faqs,
    learnArticles: data.learnArticles,
    legalPages: data.legalPages,
  };

  for (const [name, items] of Object.entries(collections)) {
    it(`${name}: slugs are unique`, () => {
      const slugs = items.map((i) => i.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  }

  it("every statused item carries a known status", () => {
    const statused = [
      ...data.stages,
      ...data.goals,
      ...data.businessTypes,
      ...data.startingPoints,
      ...data.serviceCategories,
      ...data.services,
      ...data.toolCategories,
      ...data.tools,
      ...data.roadmaps,
      ...data.faqs,
      ...data.learnArticles,
      ...data.legalPages,
      ...data.caseStudies,
      ...data.testimonials,
      ...data.examples,
    ] as { status: ContentStatus }[];
    for (const item of statused) expect(VALID_STATUSES).toContain(item.status);
  });

  it("proof (case studies / testimonials / examples) stays non-public until verified", () => {
    const proof = [...data.caseStudies, ...data.testimonials, ...data.examples];
    for (const p of proof) expect(RENDERABLE_STATUSES).not.toContain(p.status);
  });
});

describe("content integrity — cross-references resolve", () => {
  it("services reference real categories, delivery models, tools, goals, stages, business types", () => {
    for (const s of data.services) {
      expect(serviceCategorySlugs.has(s.categorySlug), `service ${s.slug} category`).toBe(true);
      expect(DELIVERY_KEYS.has(s.deliveryModel), `service ${s.slug} deliveryModel`).toBe(true);
      expectAllIn(s.relatedToolSlugs, toolSlugs, `service ${s.slug} relatedTools`);
      expectAllIn(s.goalSlugs, goalSlugs, `service ${s.slug} goals`);
      expectAllIn(s.stageSlugs, stageSlugs, `service ${s.slug} stages`);
      expectAllIn(s.businessTypeSlugs, businessTypeSlugs, `service ${s.slug} businessTypes`);
    }
  });

  it("tools reference real categories, business types, services, stages, and connected categories", () => {
    for (const t of data.tools) {
      expect(toolCategorySlugs.has(t.categorySlug), `tool ${t.slug} category`).toBe(true);
      expectAllIn(t.connectsWith, toolCategorySlugs, `tool ${t.slug} connectsWith`);
      expectAllIn(t.suitsBusinessTypeSlugs, businessTypeSlugs, `tool ${t.slug} businessTypes`);
      expectAllIn(t.relatedServiceSlugs, serviceSlugs, `tool ${t.slug} relatedServices`);
      expectAllIn(t.stageSlugs, stageSlugs, `tool ${t.slug} stages`);
    }
  });

  it("goals reference real stages and services", () => {
    for (const g of data.goals) {
      expectAllIn(g.stageSlugs, stageSlugs, `goal ${g.slug} stages`);
      expectAllIn(g.serviceSlugs, serviceSlugs, `goal ${g.slug} services`);
    }
  });

  it("business types reference real goals and (optional) roadmap", () => {
    for (const b of data.businessTypes) {
      expectAllIn(b.goalSlugs, goalSlugs, `businessType ${b.slug} goals`);
      if (b.roadmapSlug) expect(roadmapSlugs.has(b.roadmapSlug), `businessType ${b.slug} roadmap`).toBe(true);
    }
  });

  it("starting points reference a real recommended stage", () => {
    for (const p of data.startingPoints) {
      expect(stageSlugs.has(p.recommendedStageSlug), `startingPoint ${p.slug} stage`).toBe(true);
    }
  });

  it("roadmaps reference a real business type, and every phase resolves", () => {
    for (const r of data.roadmaps) {
      expect(businessTypeSlugs.has(r.forBusinessTypeSlug), `roadmap ${r.slug} businessType`).toBe(true);
      for (const phase of r.phases) {
        expect(stageSlugs.has(phase.stageSlug), `roadmap ${r.slug} phase stage`).toBe(true);
        expectAllIn(phase.serviceSlugs, serviceSlugs, `roadmap ${r.slug} phase services`);
        if (phase.goalSlugs) expectAllIn(phase.goalSlugs, goalSlugs, `roadmap ${r.slug} phase goals`);
      }
    }
  });

  it("systems have unique keys", () => {
    expect(systemKeys.size).toBe(data.systems.length);
  });
});
