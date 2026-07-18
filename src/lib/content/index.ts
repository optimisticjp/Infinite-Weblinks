import { isSanityConfigured } from "@/lib/sanity/client";
import { fromSanityOrSeed } from "@/lib/sanity/fetch";
import {
  businessTypeQuery,
  caseStudyQuery,
  exampleQuery,
  faqQuery,
  goalQuery,
  growthStageQuery,
  learnArticleQuery,
  mapBusinessTypes,
  mapCaseStudies,
  mapExamples,
  mapFaqs,
  mapGoals,
  mapGrowthStages,
  mapLearnArticles,
  mapRoadmaps,
  mapServiceCategories,
  mapServices,
  mapStartingPoints,
  mapTestimonials,
  mapToolCategories,
  mapTools,
  roadmapQuery,
  serviceCategoryQuery,
  serviceQuery,
  startingPointQuery,
  testimonialQuery,
  toolCategoryQuery,
  toolQuery,
} from "@/lib/sanity/queries";
import { seedChrome, seedEditorial, seedHero } from "./seed";
import * as data from "./data";
import { isRenderable, type Statused } from "./types";
import type {
  AccountOwnership,
  BusinessType,
  CaseStudy,
  ConnectedExample,
  CrossCuttingSystem,
  CustomerJourneyStep,
  DeliveryModel,
  TroubleshooterProblem,
  EditorialSection,
  Example,
  Faq,
  Goal,
  GrowthStage,
  HeroContent,
  LearnArticle,
  LegalPage,
  ProcessStep,
  Roadmap,
  SectionConfig,
  Service,
  ServiceCategory,
  SiteChrome,
  StartingPoint,
  Testimonial,
  Tool,
  ToolCategory,
  TrustNarrative,
  ValueProp,
} from "./types";

/**
 * Content getters. Today they return the approved seed data (status-gated); once a
 * Sanity project is configured the same functions will run status-gated GROQ queries and
 * fall back to seed for any missing document. Public getters NEVER return content whose
 * status is not verified/readyToPublish — the gate holds in both modes (owner requirement).
 */

function renderable<T extends Statused>(items: readonly T[]): T[] {
  return items.filter(isRenderable);
}
function bySlug<T extends { slug: string }>(items: readonly T[], slug: string): T | undefined {
  return items.find((i) => i.slug === slug);
}

/**
 * Sanity read status. `isSanityConfigured` reports only whether a project id is present.
 *
 * Live, status-gated Sanity reads are wired for the full marketing taxonomy and editorial
 * content — growth stages, service/tool categories, services, tools, goals, business types,
 * starting points, roadmaps, learn articles, FAQs, and proof (case studies / testimonials /
 * examples). Each getter calls `fromSanityOrSeed`: it prefers live Sanity content and falls
 * back to the (already status-gated) seed array whenever Sanity is unconfigured, empty, or
 * unreachable. The Studio schema was reconciled to the reviewed seed so a document projects
 * back to the exact app type (see seed-transform.ts + queries.ts; round-trip tested).
 *
 * Deliberately NOT read from Sanity (seed / code is the source of truth):
 *  - Structural reference data that is not status-gated: cross-cutting systems, delivery
 *    models, process steps, value props. These are seeded (so they exist as reference
 *    targets and are visible in Studio) but the site renders them from code.
 *  - Brand-locked chrome/hero/editorial and the growth-plan rule set.
 *  - Legal pages — lawyer-reviewed, lowest-churn; rendered from code with a review note.
 */
export { isSanityConfigured };
export const sanityWiredTypes = [
  "growthStage",
  "serviceCategory",
  "service",
  "toolCategory",
  "tool",
  "goal",
  "businessType",
  "startingPoint",
  "roadmap",
  "article",
  "faq",
  "caseStudy",
  "testimonial",
  "example",
] as const;

/* ---- chrome / hero / editorial (existing seed) ---- */
export async function getSiteChrome(): Promise<SiteChrome> {
  return seedChrome;
}
export async function getHero(): Promise<HeroContent> {
  return seedHero;
}
export async function getEditorial(): Promise<EditorialSection> {
  return seedEditorial;
}
export async function getHomepageOpening(): Promise<{
  hero: HeroContent;
  editorial: EditorialSection;
}> {
  return { hero: seedHero, editorial: seedEditorial };
}

/* ---- growth stages (Sanity-backed, status-gated; the 8-stage journey) ---- */
export async function getStages(): Promise<GrowthStage[]> {
  const stages = await fromSanityOrSeed<GrowthStage, GrowthStage>({
    query: growthStageQuery,
    map: mapGrowthStages,
    seed: renderable(data.stages),
  });
  return [...stages].sort((a, b) => a.order - b.order);
}
export async function getStage(slug: string): Promise<GrowthStage | undefined> {
  return bySlug(await getStages(), slug);
}

/* ---- structural reference data (not status-gated: seeded, but rendered from code) ---- */
export async function getSystems(): Promise<CrossCuttingSystem[]> {
  return [...data.systems];
}
export async function getDeliveryModels(): Promise<DeliveryModel[]> {
  return [...data.deliveryModels];
}
export async function getProcessSteps(): Promise<ProcessStep[]> {
  return [...data.processSteps].sort((a, b) => a.order - b.order);
}
export async function getValueProps(): Promise<ValueProp[]> {
  return [...data.valueProps];
}
/** Interim trust narrative (code-authoritative, always renders — never gated proof). */
export async function getTrustNarrative(): Promise<TrustNarrative> {
  return data.trustNarrative;
}
export async function getCustomerJourney(): Promise<CustomerJourneyStep[]> {
  return [...data.customerJourney].sort((a, b) => a.order - b.order);
}
export async function getConnectedExamples(): Promise<ConnectedExample[]> {
  return [...data.connectedExamples];
}
export async function getAccountOwnership(): Promise<AccountOwnership> {
  return data.accountOwnership;
}
export async function getTroubleshooterProblems(): Promise<TroubleshooterProblem[]> {
  return [...data.troubleshooterProblems];
}

/* ---- status-gated content (Sanity-backed with seed fallback) ---- */
export async function getGoals(): Promise<Goal[]> {
  return fromSanityOrSeed<Goal, Goal>({
    query: goalQuery,
    map: mapGoals,
    seed: renderable(data.goals),
  });
}
export async function getGoal(slug: string): Promise<Goal | undefined> {
  return bySlug(await getGoals(), slug);
}
export async function getBusinessTypes(): Promise<BusinessType[]> {
  return fromSanityOrSeed<BusinessType, BusinessType>({
    query: businessTypeQuery,
    map: mapBusinessTypes,
    seed: renderable(data.businessTypes),
  });
}
export async function getBusinessType(slug: string): Promise<BusinessType | undefined> {
  return bySlug(await getBusinessTypes(), slug);
}
export async function getStartingPoints(): Promise<StartingPoint[]> {
  return fromSanityOrSeed<StartingPoint, StartingPoint>({
    query: startingPointQuery,
    map: mapStartingPoints,
    seed: renderable(data.startingPoints),
  });
}
export async function getStartingPoint(slug: string): Promise<StartingPoint | undefined> {
  return bySlug(await getStartingPoints(), slug);
}
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const cats = await fromSanityOrSeed<ServiceCategory, ServiceCategory>({
    query: serviceCategoryQuery,
    map: mapServiceCategories,
    seed: renderable(data.serviceCategories),
  });
  return [...cats].sort((a, b) => a.order - b.order);
}
export async function getServices(): Promise<Service[]> {
  return fromSanityOrSeed<Service, Service>({
    query: serviceQuery,
    map: mapServices,
    seed: renderable(data.services),
  });
}
export async function getService(slug: string): Promise<Service | undefined> {
  return bySlug(await getServices(), slug);
}
export async function getToolCategories(): Promise<ToolCategory[]> {
  const cats = await fromSanityOrSeed<ToolCategory, ToolCategory>({
    query: toolCategoryQuery,
    map: mapToolCategories,
    seed: renderable(data.toolCategories),
  });
  return [...cats].sort((a, b) => a.order - b.order);
}
export async function getTools(): Promise<Tool[]> {
  return fromSanityOrSeed<Tool, Tool>({
    query: toolQuery,
    map: mapTools,
    seed: renderable(data.tools),
  });
}
export async function getTool(slug: string): Promise<Tool | undefined> {
  return bySlug(await getTools(), slug);
}
export async function getRoadmaps(): Promise<Roadmap[]> {
  return fromSanityOrSeed<Roadmap, Roadmap>({
    query: roadmapQuery,
    map: mapRoadmaps,
    seed: renderable(data.roadmaps),
  });
}
export async function getRoadmap(slug: string): Promise<Roadmap | undefined> {
  return bySlug(await getRoadmaps(), slug);
}
export async function getFaqs(): Promise<Faq[]> {
  return fromSanityOrSeed<Faq, Faq>({
    query: faqQuery,
    map: mapFaqs,
    seed: renderable(data.faqs),
  });
}
export async function getLearnArticles(): Promise<LearnArticle[]> {
  return fromSanityOrSeed<LearnArticle, LearnArticle>({
    query: learnArticleQuery,
    map: mapLearnArticles,
    seed: renderable(data.learnArticles),
  });
}
export async function getLearnArticle(slug: string): Promise<LearnArticle | undefined> {
  return bySlug(await getLearnArticles(), slug);
}
/* Legal pages stay code-authoritative (lawyer-reviewed, lowest-churn — not seeded to Sanity). */
export async function getLegalPage(slug: string): Promise<LegalPage | undefined> {
  const l = bySlug(data.legalPages, slug);
  return l && isRenderable(l) ? l : undefined;
}

/* ---- proof (placeholder-gated → empty until Verified/ReadyToPublish, in seed OR Sanity) ---- */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  return fromSanityOrSeed<CaseStudy, CaseStudy>({
    query: caseStudyQuery,
    map: mapCaseStudies,
    seed: renderable(data.caseStudies),
  });
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return fromSanityOrSeed<Testimonial, Testimonial>({
    query: testimonialQuery,
    map: mapTestimonials,
    seed: renderable(data.testimonials),
  });
}
export async function getExamples(): Promise<Example[]> {
  return fromSanityOrSeed<Example, Example>({
    query: exampleQuery,
    map: mapExamples,
    seed: renderable(data.examples),
  });
}
/* Single-item proof getters resolve against the status-gated list, so a placeholder /
   unverified record is never found → the detail route 404s (proof stays hidden). */
export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return (await getCaseStudies()).find((c) => c.slug === slug);
}
export async function getExample(slug: string): Promise<Example | undefined> {
  return (await getExamples()).find((e) => e.slug === slug);
}

/* ---- homepage section order (data-driven; each section owns its theme) ----
 *
 * Phase 2 — the homepage summarises and routes; inner pages are exhaustive. The
 * narrative is hook → tension → one big idea → proof → permission, with two routers
 * that don't stack and proof sitting immediately after the claim it proves.
 *
 * Deliberately NOT on the homepage any more (each is rendered in full on an inner
 * page, so this is de-duplication, not deletion):
 *   growthJourney, connectedSystem's twin, deliveryModels, processSteps → /how-it-works
 *   startingPointSelector → /goals (by where you are)   ·   toolUniverse → /tools
 *   faqSection → /faq
 * Hero + editorialStatement are rendered explicitly by the page (GATE-1 opening);
 * editorialStatement stays in this list only to document its position — the registry
 * skips it. Proof (caseStudyShowcase, testimonialWall) is status-gated and renders
 * nothing today; its slot is positioned now, right after the claim, ready for Sanity.
 */
export function getHomepageSections(): SectionConfig[] {
  // Redesign v2 — recomposed to the reference plan's *focused growth narrative* rather than
  // a catalogue. The previous order told the "connected systems / journey" idea three times
  // (growthJourney + connectedSystem + customerJourney), routed three ways (goal + services +
  // starting-point), and stated ownership twice (deliveryModels strip + accountOwnership).
  // Those redundancies are removed HERE (the components stay in the codebase and on their
  // dedicated inner pages — this is de-duplication of the homepage, not deletion):
  //   growthJourney, customerJourney, startingPointSelector, connectedExamples,
  //   whyInfiniteWeblinks  →  not on the homepage any more.
  //
  // The result is one beat per idea, in the plan's sequence — hook → tension → one
  // connected-system explanation → goal router → service router → ways of working →
  // ownership → proof → practical learning → final action — and a strict dark/light
  // alternation (never two dark sections in a row), so every section has one clear job.
  // Rendered rhythm (proof is status-gated to null today):
  //   Hero(dark) · editorial(cream) · goals(dark) · connected-system(cream) ·
  //   services(dark) · ways-of-working(cream) · ownership(dark) · learn(cream) · CTA(dark).
  // Hero + editorialStatement (the "digital world" cream band, ref 18) are rendered
  // explicitly by the page; editorialStatement stays here only to document its slot.
  return [
    { type: "editorialStatement", enabled: true, anchorId: "why-it-matters" }, // cream — the digital world (ref 18)
    { type: "goalExplorer", enabled: true, anchorId: "goals" }, // router #1 — by goal (ref 10)
    { type: "connectedSystem", enabled: true, anchorId: "how-it-connects" }, // cream — the one connected-system explanation
    { type: "servicesExplorer", enabled: true, anchorId: "services" }, // router #2 — services constellation (ref 12)
    { type: "deliveryModels", enabled: true, anchorId: "ways-of-working" }, // cream — ways of working (ref 01)
    { type: "accountOwnership", enabled: true, anchorId: "ownership" }, // you own it (ref 13)
    { type: "trustMethodology", enabled: true, anchorId: "how-we-work" }, // interim honest trust: method + standards (bright)
    { type: "caseStudyShowcase", enabled: true, anchorId: "case-studies" }, // proof — status-gated (null today)
    { type: "testimonialWall", enabled: true, anchorId: "testimonials" }, // proof — status-gated (null today)
    { type: "learningResources", enabled: true, anchorId: "learn" }, // cream — practical guides
    { type: "finalCtaBanner", enabled: true, anchorId: "get-started" }, // permission to act (ref 19)
  ];
}
