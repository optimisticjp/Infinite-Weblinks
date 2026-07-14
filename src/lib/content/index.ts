import { isSanityConfigured } from "@/lib/sanity/client";
import { seedChrome, seedEditorial, seedHero } from "./seed";
import * as data from "./data";
import { isRenderable, type Statused } from "./types";
import type {
  BusinessType,
  CaseStudy,
  CrossCuttingSystem,
  DeliveryModel,
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

/* When Sanity is configured, these will branch to GROQ; seed is the fallback. */
export const usingSanity = isSanityConfigured;

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

/* ---- fixed taxonomy (not status-gated: locked reference data) ---- */
export async function getStages(): Promise<GrowthStage[]> {
  return [...data.stages].sort((a, b) => a.order - b.order);
}
export async function getStage(slug: string): Promise<GrowthStage | undefined> {
  return bySlug(data.stages, slug);
}
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

/* ---- status-gated content ---- */
export async function getGoals(): Promise<Goal[]> {
  return renderable(data.goals);
}
export async function getGoal(slug: string): Promise<Goal | undefined> {
  const g = bySlug(data.goals, slug);
  return g && isRenderable(g) ? g : undefined;
}
export async function getBusinessTypes(): Promise<BusinessType[]> {
  return renderable(data.businessTypes);
}
export async function getBusinessType(slug: string): Promise<BusinessType | undefined> {
  const b = bySlug(data.businessTypes, slug);
  return b && isRenderable(b) ? b : undefined;
}
export async function getStartingPoints(): Promise<StartingPoint[]> {
  return renderable(data.startingPoints);
}
export async function getStartingPoint(slug: string): Promise<StartingPoint | undefined> {
  const s = bySlug(data.startingPoints, slug);
  return s && isRenderable(s) ? s : undefined;
}
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return renderable(data.serviceCategories).sort((a, b) => a.order - b.order);
}
export async function getServices(): Promise<Service[]> {
  return renderable(data.services);
}
export async function getService(slug: string): Promise<Service | undefined> {
  const s = bySlug(data.services, slug);
  return s && isRenderable(s) ? s : undefined;
}
export async function getToolCategories(): Promise<ToolCategory[]> {
  return renderable(data.toolCategories).sort((a, b) => a.order - b.order);
}
export async function getTools(): Promise<Tool[]> {
  return renderable(data.tools);
}
export async function getTool(slug: string): Promise<Tool | undefined> {
  const t = bySlug(data.tools, slug);
  return t && isRenderable(t) ? t : undefined;
}
export async function getRoadmaps(): Promise<Roadmap[]> {
  return renderable(data.roadmaps);
}
export async function getRoadmap(slug: string): Promise<Roadmap | undefined> {
  const r = bySlug(data.roadmaps, slug);
  return r && isRenderable(r) ? r : undefined;
}
export async function getFaqs(): Promise<Faq[]> {
  return renderable(data.faqs);
}
export async function getLearnArticles(): Promise<LearnArticle[]> {
  return renderable(data.learnArticles);
}
export async function getLearnArticle(slug: string): Promise<LearnArticle | undefined> {
  const a = bySlug(data.learnArticles, slug);
  return a && isRenderable(a) ? a : undefined;
}
export async function getLegalPage(slug: string): Promise<LegalPage | undefined> {
  const l = bySlug(data.legalPages, slug);
  return l && isRenderable(l) ? l : undefined;
}

/* ---- proof (placeholder-gated → empty until verified) ---- */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  return renderable(data.caseStudies);
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return renderable(data.testimonials);
}
export async function getExamples(): Promise<Example[]> {
  return renderable(data.examples);
}

/* ---- homepage section order (data-driven; each section owns its theme) ---- */
export function getHomepageSections(): SectionConfig[] {
  return [
    { type: "editorialStatement", enabled: true, anchorId: "why-it-matters" },
    { type: "growthJourney", enabled: true, anchorId: "growth-journey" },
    { type: "goalExplorer", enabled: true, anchorId: "goals" },
    { type: "connectedSystem", enabled: true, anchorId: "how-it-connects" },
    { type: "startingPointSelector", enabled: true, anchorId: "start" },
    { type: "servicesExplorer", enabled: true, anchorId: "services" },
    { type: "toolUniverse", enabled: true, anchorId: "tools" },
    { type: "deliveryModels", enabled: true, anchorId: "how-we-deliver" },
    { type: "processSteps", enabled: true, anchorId: "process" },
    { type: "whyInfiniteWeblinks", enabled: true, anchorId: "why-us" },
    { type: "caseStudyShowcase", enabled: true, anchorId: "case-studies" },
    { type: "testimonialWall", enabled: true, anchorId: "testimonials" },
    { type: "learningResources", enabled: true, anchorId: "learn" },
    { type: "faqSection", enabled: true, anchorId: "faq" },
    { type: "finalCtaBanner", enabled: true, anchorId: "get-started" },
  ];
}
