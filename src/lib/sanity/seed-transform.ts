/**
 * Seed → Sanity transform. Turns the reviewed local seed taxonomy/content (src/lib/content/data)
 * into schema-conformant Sanity documents with DETERMINISTIC `_id`s and resolved references.
 *
 * Why deterministic ids: importing with these stable ids (`<type>.<slug>`) is idempotent —
 * re-running the seed `createOrReplace`s the same documents instead of creating duplicates, and
 * every cross-document reference (`_ref`) points at a stable id so the graph is preserved on
 * every reseed. This module is pure (no I/O) so it is unit-testable and reused by both the NDJSON
 * exporter (scripts/export-sanity-seed.ts) and the round-trip tests.
 *
 * The transform is the inverse of the GROQ projections in queries.ts: a seed item mapped to a doc
 * here, then projected back by the matching query, must reproduce the original seed item. The
 * round-trip tests (tests/unit/sanity-roundtrip.test.ts) assert exactly that.
 *
 * Single content model: these docs populate the EXISTING Studio schema (studio/schemaTypes),
 * extended only with the reviewed seed's own editorial fields — not a second competing model.
 */
import * as data from "@/lib/content/data";
import type {
  BusinessType,
  CrossCuttingSystem,
  Cta,
  DeliveryModel,
  Faq,
  Goal,
  GrowthStage,
  LearnArticle,
  Roadmap,
  Service,
  ServiceCategory,
  StartingPoint,
  Tool,
  ToolCategory,
} from "@/lib/content/types";

/** A minimal Sanity document shape (import NDJSON records). */
export interface SanityDoc {
  _id: string;
  _type: string;
  [field: string]: unknown;
}
interface Ref {
  _type: "reference";
  _ref: string;
}
interface KeyedRef extends Ref {
  _key: string;
}

/** Deterministic document id: `<type>.<slug>` (slug already unique within a type). */
export const docId = (type: string, slug: string): string => `${type}.${slug}`;

/** A single reference to `<type>.<slug>`. */
const ref = (type: string, slug: string): Ref => ({ _type: "reference", _ref: docId(type, slug) });

/** A keyed reference array member (Sanity arrays require a stable `_key`). */
const keyedRef = (type: string, slug: string): KeyedRef => ({
  _key: `${type}-${slug}`,
  _type: "reference",
  _ref: docId(type, slug),
});

/** Map a slug list to a keyed reference array (order preserved). */
const refs = (type: string, slugs: readonly string[] | undefined): KeyedRef[] =>
  (slugs ?? []).map((s) => keyedRef(type, s));

/** contentStatus object mirrored from a seed item's status/noindex. */
const status = (item: { status: string; noindex?: boolean }) => ({
  _type: "contentStatus",
  status: item.status,
  ...(item.noindex ? { noindex: true } : {}),
});

const slug = (current: string) => ({ _type: "slug", current });
const cta = (c: Cta) => ({ _type: "cta", label: c.label, route: c.route, style: c.style });

/* ----------------------------------------------------------------- per-type transforms */

export const stageDoc = (s: GrowthStage): SanityDoc => ({
  _id: docId("growthStage", s.slug),
  _type: "growthStage",
  order: s.order,
  name: s.name,
  slug: slug(s.slug),
  plainSummary: s.summary,
  whatHappens: s.whatHappens,
  outcome: s.outcome,
  color: s.color,
  icon: s.icon,
  relatedServices: refs("service", s.serviceSlugs),
  contentStatus: status(s),
});

export const systemDoc = (sys: CrossCuttingSystem): SanityDoc => ({
  _id: docId("crossCuttingSystem", sys.key),
  _type: "crossCuttingSystem",
  name: sys.name,
  slug: slug(sys.key),
  description: sys.description,
  color: sys.color,
  icon: sys.icon,
  contentStatus: { _type: "contentStatus", status: "verified" },
});

export const deliveryModelDoc = (m: DeliveryModel): SanityDoc => ({
  _id: docId("deliveryModel", m.key),
  _type: "deliveryModel",
  key: m.key,
  name: m.name,
  slug: slug(m.key),
  tagline: m.tagline,
  description: m.description,
  contentStatus: { _type: "contentStatus", status: "verified" },
});

export const serviceCategoryDoc = (c: ServiceCategory): SanityDoc => ({
  _id: docId("serviceCategory", c.slug),
  _type: "serviceCategory",
  name: c.name,
  slug: slug(c.slug),
  order: c.order,
  intro: c.intro,
  icon: c.icon,
  color: c.color,
  contentStatus: status(c),
});

export const serviceDoc = (s: Service): SanityDoc => ({
  _id: docId("service", s.slug),
  _type: "service",
  name: s.name,
  slug: slug(s.slug),
  category: ref("serviceCategory", s.categorySlug),
  deliveryModel: ref("deliveryModel", s.deliveryModel),
  plainDescription: s.plainDescription,
  whatYouGet: s.whatYouGet,
  outcome: s.outcome,
  exampleTools: s.exampleTools,
  relatedTools: refs("tool", s.relatedToolSlugs),
  relatedGoals: refs("goal", s.goalSlugs),
  stages: refs("growthStage", s.stageSlugs),
  businessTypes: refs("businessType", s.businessTypeSlugs),
  contentStatus: status(s),
});

export const toolCategoryDoc = (c: ToolCategory): SanityDoc => ({
  _id: docId("toolCategory", c.slug),
  _type: "toolCategory",
  name: c.name,
  slug: slug(c.slug),
  order: c.order,
  intro: c.intro,
  icon: c.icon,
  color: c.color,
  contentStatus: status(c),
});

export const toolDoc = (t: Tool): SanityDoc => ({
  _id: docId("tool", t.slug),
  _type: "tool",
  name: t.name,
  slug: slug(t.slug),
  category: ref("toolCategory", t.categorySlug),
  whatItDoes: t.whatItDoes,
  whyUseful: t.whyUseful,
  whenNotNeeded: t.whenNotNeeded,
  exampleTools: t.exampleTools,
  connectsWith: refs("tool", t.connectsWith),
  suitsBusinessTypes: refs("businessType", t.suitsBusinessTypeSlugs),
  relatedServices: refs("service", t.relatedServiceSlugs),
  stages: refs("growthStage", t.stageSlugs),
  contentStatus: status(t),
});

export const goalDoc = (g: Goal): SanityDoc => ({
  _id: docId("goal", g.slug),
  _type: "goal",
  name: g.title,
  slug: slug(g.slug),
  audienceHint: g.audienceHint,
  whatYouNeed: g.whatYouNeed,
  howWeHelp: g.howWeHelp,
  outcome: g.outcome,
  exampleTools: g.exampleTools,
  icon: g.icon,
  color: g.color,
  stages: refs("growthStage", g.stageSlugs),
  services: refs("service", g.serviceSlugs),
  contentStatus: status(g),
});

export const businessTypeDoc = (b: BusinessType): SanityDoc => ({
  _id: docId("businessType", b.slug),
  _type: "businessType",
  name: b.name,
  slug: slug(b.slug),
  summary: b.summary,
  description: b.description,
  icon: b.icon,
  color: b.color,
  relatedGoals: refs("goal", b.goalSlugs),
  ...(b.roadmapSlug ? { roadmap: ref("roadmap", b.roadmapSlug) } : {}),
  contentStatus: status(b),
});

export const startingPointDoc = (p: StartingPoint): SanityDoc => ({
  _id: docId("startingPoint", p.slug),
  _type: "startingPoint",
  label: p.label,
  slug: slug(p.slug),
  situation: p.situation,
  recommendation: p.recommendation,
  cta: cta(p.cta),
  icon: p.icon,
  color: p.color,
  recommendedStage: ref("growthStage", p.recommendedStageSlug),
  contentStatus: status(p),
});

export const roadmapDoc = (r: Roadmap): SanityDoc => ({
  _id: docId("roadmap", r.slug),
  _type: "roadmap",
  name: r.name,
  slug: slug(r.slug),
  forBusinessType: ref("businessType", r.forBusinessTypeSlug),
  intro: r.intro,
  phases: r.phases.map((ph, i) => ({
    _key: `phase-${i}`,
    _type: "phase",
    title: ph.title,
    summary: ph.summary,
    stage: ref("growthStage", ph.stageSlug),
    services: refs("service", ph.serviceSlugs),
    goals: refs("goal", ph.goalSlugs ?? []),
  })),
  contentStatus: status(r),
});

export const articleDoc = (a: LearnArticle): SanityDoc => ({
  _id: docId("article", a.slug),
  _type: "article",
  title: a.title,
  slug: slug(a.slug),
  excerpt: a.excerpt,
  body: a.body,
  readMinutes: a.readMinutes,
  publishedAt: a.publishedAt,
  relatedGoals: refs("goal", a.relatedGoalSlugs ?? []),
  contentStatus: status(a),
});

/**
 * NOTE: legal pages (privacy/cookies/terms/accessibility) are intentionally NOT seeded and are
 * read from code, not Sanity. They are lawyer-reviewed, lowest-churn, and the site already renders
 * them with a professional-review note; bulk-seeding legal copy is out of scope for this pass.
 */

export const faqDoc = (f: Faq, index: number): SanityDoc => ({
  _id: docId("faq", f.slug),
  _type: "faq",
  question: f.question,
  slug: slug(f.slug),
  answer: f.answer,
  category: f.category,
  order: index,
  contentStatus: status(f),
});

/* ----------------------------------------------------------------- full document set */

/**
 * Every seed document, in dependency-friendly order (reference targets first). Sanity import
 * tolerates any order (references resolve within the dataset), but ordering by dependency keeps
 * the NDJSON readable. Includes reference targets (stages, systems, delivery models, categories)
 * even though the site currently reads some of them from code, so every `_ref` resolves.
 */
export function buildAllSeedDocs(): SanityDoc[] {
  return [
    ...data.stages.map(stageDoc),
    ...data.systems.map(systemDoc),
    ...data.deliveryModels.map(deliveryModelDoc),
    ...data.serviceCategories.map(serviceCategoryDoc),
    ...data.toolCategories.map(toolCategoryDoc),
    ...data.businessTypes.map(businessTypeDoc),
    ...data.goals.map(goalDoc),
    ...data.services.map(serviceDoc),
    ...data.tools.map(toolDoc),
    ...data.startingPoints.map(startingPointDoc),
    ...data.roadmaps.map(roadmapDoc),
    ...data.learnArticles.map(articleDoc),
    ...data.faqs.map(faqDoc),
    // Proof (caseStudy / testimonial / example) is intentionally NOT seeded: the seed proof is
    // placeholder-only ("not a real quote"), and injecting fake proof into the CMS is forbidden.
    // The read queries stay wired, so real Verified proof added in Studio appears automatically.
  ];
}

/** Serialise docs to newline-delimited JSON for `sanity dataset import`. */
export function toNdjson(docs: SanityDoc[]): string {
  return docs.map((d) => JSON.stringify(d)).join("\n") + "\n";
}
