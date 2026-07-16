import type { Metadata } from "next";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { GrowthPlanBuilder } from "@/components/builder/GrowthPlanBuilder";
import { canonical } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals, getStages } from "@/lib/content";

/**
 * /growth-plan — the site's primary CTA destination ("Build My Digital Growth Plan").
 * `noindex, follow` per the SEO spec: this conversion tool is kept out of the index, but
 * link equity still flows through it. A self-canonical keeps any tracking-param variants
 * consolidated onto the clean URL.
 */
export const metadata: Metadata = {
  title: "Build My Digital Growth Plan",
  description:
    "Answer a few guided questions about your business and get a structured starting point — what to build first, what to connect next, and what can wait.",
  robots: { index: false, follow: true },
  alternates: { canonical: canonical("/growth-plan") },
};

export default async function GrowthPlanPage() {
  // getBusinessTypes / getGoals / getStages all exist in @/lib/content today (status-gated
  // seed data), so the builder always has real options to render.
  const [businessTypes, goals, stages] = await Promise.all([
    getBusinessTypes(),
    getGoals(),
    getStages(),
  ]);

  return (
    <section className="theme-dark iw-section" aria-labelledby="growth-plan-heading">
      <div className="iw-container">
        <SectionHeader
          as="h1"
          id="growth-plan-heading"
          eyebrow="Build my digital growth plan"
          title="A few questions. A clear starting point."
          intro="Answer a handful of guided questions about your business and we'll map out where to start, what to connect next, and what can wait — no jargon, no guesswork, no call required."
        />
        <GrowthPlanBuilder businessTypes={businessTypes} goals={goals} stages={stages} />
      </div>
    </section>
  );
}
