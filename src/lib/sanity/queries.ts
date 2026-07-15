import { PUBLIC_STATUS_FILTER } from "./client";
import type { CaseStudy, Example, Faq, Testimonial } from "@/lib/content/types";

/**
 * GROQ for the content types whose Studio schema projects cleanly and completely onto the
 * app types. Each query applies the public status gate (verified / readyToPublish) at the
 * source, and projects field names to match the app type exactly so no post-mapping is
 * needed beyond a shape cast. Types with app-only fields (icon/color/exampleTools),
 * portable-text bodies, or reference-vs-slug mismatches are intentionally NOT here yet.
 */

/** FAQs. Studio `faq` has no slug field, so derive a stable key from `_id`. */
export const faqQuery = `*[_type == "faq" && ${PUBLIC_STATUS_FILTER}] | order(order asc, question asc){
  "status": contentStatus.status,
  "slug": coalesce(slug.current, _id),
  question,
  answer,
  category
}`;

export const caseStudyQuery = `*[_type == "caseStudy" && ${PUBLIC_STATUS_FILTER}]{
  "status": contentStatus.status,
  "slug": slug.current,
  title,
  client,
  summary
}`;

export const testimonialQuery = `*[_type == "testimonial" && ${PUBLIC_STATUS_FILTER}]{
  "status": contentStatus.status,
  quote,
  attribution,
  rating
}`;

export const exampleQuery = `*[_type == "example" && ${PUBLIC_STATUS_FILTER}]{
  "status": contentStatus.status,
  "slug": slug.current,
  title,
  summary
}`;

/* The GROQ projections above already match these shapes; the mappers are simple casts. */
export const mapFaqs = (docs: Faq[]): Faq[] => docs;
export const mapCaseStudies = (docs: CaseStudy[]): CaseStudy[] => docs;
export const mapTestimonials = (docs: Testimonial[]): Testimonial[] => docs;
export const mapExamples = (docs: Example[]): Example[] => docs;
