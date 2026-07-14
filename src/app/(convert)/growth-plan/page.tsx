import type { Metadata } from "next";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { GrowthPlanBuilder } from "@/components/builder/GrowthPlanBuilder";
import { getBusinessTypes, getGoals, getStages } from "@/lib/content";

/**
 * /growth-plan — the site's primary CTA destination ("Build My Digital Growth Plan").
 * Noindex per the brief: this is a conversion tool, not an evergreen content page.
 */
export const metadata: Metadata = {
  title: "Build My Digital Growth Plan",
  description:
    "Answer a few guided questions about your business and get a structured starting point — what to build first, what to connect next, and what can wait.",
  robots: { index: false, follow: false },
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
          title={
            <>
              A few questions. A <span className="iw-gradient-text">clear starting point.</span>
            </>
          }
          intro="Answer a handful of guided questions about your business and we'll map out where to start, what to connect next, and what can wait — no jargon, no guesswork, no call required."
        />
        <GrowthPlanBuilder businessTypes={businessTypes} goals={goals} stages={stages} />
      </div>
    </section>
  );
}
