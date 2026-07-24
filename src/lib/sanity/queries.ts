import { PUBLIC_STATUS_FILTER } from "./client";
import type {
  BusinessType,
  CaseStudy,
  Example,
  Faq,
  Goal,
  GrowthStage,
  LearnArticle,
  Roadmap,
  Service,
  ServiceCategory,
  StartingPoint,
  Testimonial,
  Tool,
  ToolCategory,
} from "@/lib/content/types";

/**
 * GROQ for every content type the website reads from Sanity. Each query:
 *   1. applies the public status gate (verified / readyToPublish) at the SOURCE, so
 *      Draft / Placeholder / Approval-required documents can never be returned; and
 *   2. projects field names to match the app runtime type exactly (name→title, references→
 *      slug arrays, plainSummary→summary, …), so the mapper is a thin, defensive cast.
 *
 * The projections are the inverse of src/lib/sanity/seed-transform.ts and are verified by the
 * round-trip tests (tests/unit/sanity-roundtrip.test.ts): seed → document → projection == seed.
 *
 * Reference dereferences (`ref->slug.current`) resolve against the whole dataset (deref is not
 * status-gated), which is intentional: a slug list is just a relationship, and the target's own
 * page is independently gated. `array::compact` drops any dangling ref so a deleted target can't
 * inject a null into a slug array.
 */

const GATE = PUBLIC_STATUS_FILTER;
const compact = (expr: string) => `array::compact(${expr})`;

/* ------------------------------------------------------------------ taxonomy */

export const growthStageQuery = `*[_type == "growthStage" && ${GATE}] | order(order asc){
  "status": contentStatus.status,
  order,
  "slug": slug.current,
  name,
  "summary": plainSummary,
  whatHappens,
  outcome,
  color,
  icon,
  "serviceSlugs": ${compact("relatedServices[]->slug.current")}
}`;

export const serviceCategoryQuery = `*[_type == "serviceCategory" && ${GATE}] | order(order asc){
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  intro,
  order,
  icon,
  color
}`;

export const serviceQuery = `*[_type == "service" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  "categorySlug": category->slug.current,
  "deliveryModel": deliveryModel->key,
  plainDescription,
  "whatYouGet": coalesce(whatYouGet, []),
  outcome,
  "exampleTools": coalesce(exampleTools, []),
  "relatedToolSlugs": ${compact("relatedTools[]->slug.current")},
  "goalSlugs": ${compact("relatedGoals[]->slug.current")},
  "stageSlugs": ${compact("stages[]->slug.current")},
  "businessTypeSlugs": ${compact("businessTypes[]->slug.current")}
}`;

export const toolCategoryQuery = `*[_type == "toolCategory" && ${GATE}] | order(order asc){
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  intro,
  order,
  icon,
  color
}`;

export const toolQuery = `*[_type == "tool" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  "categorySlug": category->slug.current,
  whatItDoes,
  whyUseful,
  whenNotNeeded,
  "exampleTools": coalesce(exampleTools, []),
  "connectsWith": ${compact("connectsWith[]->slug.current")},
  "suitsBusinessTypeSlugs": ${compact("suitsBusinessTypes[]->slug.current")},
  "relatedServiceSlugs": ${compact("relatedServices[]->slug.current")},
  "stageSlugs": ${compact("stages[]->slug.current")}
}`;

export const goalQuery = `*[_type == "goal" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  "title": name,
  audienceHint,
  whatYouNeed,
  howWeHelp,
  outcome,
  "exampleTools": coalesce(exampleTools, []),
  icon,
  color,
  "stageSlugs": ${compact("stages[]->slug.current")},
  "serviceSlugs": ${compact("services[]->slug.current")}
}`;

export const businessTypeQuery = `*[_type == "businessType" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  summary,
  description,
  icon,
  color,
  "goalSlugs": ${compact("relatedGoals[]->slug.current")},
  "roadmapSlug": roadmap->slug.current
}`;

export const startingPointQuery = `*[_type == "startingPoint" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  label,
  situation,
  recommendation,
  icon,
  color,
  "recommendedStageSlug": recommendedStage->slug.current,
  "cta": {"label": cta.label, "route": cta.route, "style": cta.style}
}`;

export const roadmapQuery = `*[_type == "roadmap" && ${GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  name,
  intro,
  "forBusinessTypeSlug": forBusinessType->slug.current,
  "phases": phases[]{
    title,
    summary,
    "stageSlug": stage->slug.current,
    "serviceSlugs": ${compact("services[]->slug.current")},
    "goalSlugs": ${compact("goals[]->slug.current")}
  }
}`;

/* ------------------------------------------------------------------ editorial */

export const learnArticleQuery = `*[_type == "article" && ${GATE}] | order(publishedAt desc){
  "status": contentStatus.status,
  "slug": slug.current,
  title,
  excerpt,
  "body": coalesce(body, []),
  readMinutes,
  publishedAt,
  "relatedGoalSlugs": ${compact("relatedGoals[]->slug.current")}
}`;

/** FAQs. `faq` now has a slug field; fall back to `_id` for any legacy doc without one. */
export const faqQuery = `*[_type == "faq" && ${GATE}] | order(order asc, question asc){
  "status": contentStatus.status,
  "slug": coalesce(slug.current, _id),
  question,
  answer,
  category
}`;

/* ------------------------------------------------------------------ proof (double-gated)
 * Proof is gated TWICE: the shared status GATE, PLUS `proofVerification.approvedForPublication == true`
 * at the source so an unapproved document is never even returned. The full publication check
 * (`isPublishableProof`: consent + identity + claims + approval + a non-empty evidence reference) is
 * re-applied by the getter, so the same gate governs seed and live modes. The projected `verification`
 * object is what that check reads. */
const PROOF_GATE = `${GATE} && proofVerification.approvedForPublication == true`;
const proofVerification = `"verification": proofVerification{
    "consentConfirmed": consentConfirmed == true,
    "identityApproved": identityApproved == true,
    "claimsVerified": claimsVerified == true,
    "approvedForPublication": approvedForPublication == true,
    "evidenceReference": coalesce(evidenceReference, "")
  }`;

export const caseStudyQuery = `*[_type == "caseStudy" && ${PROOF_GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  title,
  client,
  summary,
  ${proofVerification}
}`;

export const testimonialQuery = `*[_type == "testimonial" && ${PROOF_GATE}]{
  "status": contentStatus.status,
  quote,
  attribution,
  rating,
  ${proofVerification}
}`;

export const exampleQuery = `*[_type == "example" && ${PROOF_GATE}]{
  "status": contentStatus.status,
  "slug": slug.current,
  title,
  summary,
  ${proofVerification}
}`;

/* ------------------------------------------------------------------ mappers
 * The projections above already match the app shapes; each mapper is a defensive identity cast
 * (the shared adapter re-applies the status gate). Kept as named fns so the getters read cleanly
 * and a future per-type transform has a single home. */
export const mapGrowthStages = (docs: GrowthStage[]): GrowthStage[] => docs;
export const mapServiceCategories = (docs: ServiceCategory[]): ServiceCategory[] => docs;
export const mapServices = (docs: Service[]): Service[] => docs;
export const mapToolCategories = (docs: ToolCategory[]): ToolCategory[] => docs;
export const mapTools = (docs: Tool[]): Tool[] => docs;
export const mapGoals = (docs: Goal[]): Goal[] => docs;
export const mapBusinessTypes = (docs: BusinessType[]): BusinessType[] => docs;
export const mapStartingPoints = (docs: StartingPoint[]): StartingPoint[] => docs;
export const mapRoadmaps = (docs: Roadmap[]): Roadmap[] => docs;
export const mapLearnArticles = (docs: LearnArticle[]): LearnArticle[] => docs;
export const mapFaqs = (docs: Faq[]): Faq[] => docs;
export const mapCaseStudies = (docs: CaseStudy[]): CaseStudy[] => docs;
export const mapTestimonials = (docs: Testimonial[]): Testimonial[] => docs;
export const mapExamples = (docs: Example[]): Example[] => docs;
