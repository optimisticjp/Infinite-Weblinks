import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { PlanBuilder } from "@/components/builder/PlanBuilder";
import { PlanIncludeCard } from "@/components/cards/PlanIncludeCard";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { canonical } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals } from "@/lib/content";
import { growthPlanHeroTrustPoints, growthPlanIncludes } from "@/lib/content/data/growth-plan";
import styles from "./growth-plan.module.css";

/**
 * /growth-plan — the Growth Plan Builder, the site's primary conversion tool, on the V2 light-first
 * system. `noindex, follow` (the tool is kept out of the index but link equity flows through it) and a
 * self-canonical consolidate tracking-param variants onto the clean URL. PageHeader (a
 * server-rendered H1, a likely LCP candidate — not a measured LCP result)
 * → the builder on a light SectionShell → what a plan can include → the single reserved dark final
 * CTA. No cosmic hero/starfield, ConnectorPath, InView, FloatingCards, InfinityMark, NodeOrb, glass or
 * fake chart. The builder is the existing Client Component (unchanged behaviour). Server Component.
 */
export const metadata: Metadata = {
  title: "Build my growth plan",
  description:
    "Answer a few short questions and get a clear, honest starting plan for your business online: what to do first, what to connect next, and the tools that fit. No account needed.",
  robots: { index: false, follow: true },
  alternates: { canonical: canonical("/growth-plan") },
};

export default async function GrowthPlanPage() {
  const [businessTypes, goals] = await Promise.all([getBusinessTypes(), getGoals()]);

  return (
    <>
      <PageHeader
        id="growth-plan-hero"
        surface="light"
        breadcrumbs={[{ name: "Growth plan" }]}
        eyebrow="Build your plan"
        title="Build your growth plan, one connected step at a time."
        lead="Answer a few short questions and get a clear, honest starting plan: what to do first, what connects next, and the tools that fit. No account needed — your plan appears on screen."
        actions={
          <>
            <Button href="#builder" size="lg" iconRight={<ArrowDown size={18} aria-hidden="true" />}>
              Start with the first question
            </Button>
            <Button href="/how-it-works" variant="secondary" size="lg">
              See how it works
            </Button>
          </>
        }
        trustNote={growthPlanHeroTrustPoints.join(" · ")}
      />

      {/* ============ The builder ============ */}
      <SectionShell surface="alt" id="builder" ariaLabel="Growth plan builder" spacing="tight">
        <div className={styles.builderPanel}>
          <PlanBuilder businessTypes={businessTypes} goals={goals} />
        </div>
      </SectionShell>

      {/* ============ What your plan can include ============ */}
      <SectionShell
        surface="light"
        id="what-your-plan-includes"
        eyebrow="What you get"
        title="What your plan can include"
        lead="The exact recommendation depends on your answers, so not every plan contains all of these — but this is the shape of what you'll see."
        align="start"
        spacing="tight"
      >
        <CardGrid layout="equal" aria-label="What your plan can include">
          {growthPlanIncludes.map((item) => (
            <PlanIncludeCard key={item.title} title={item.title} body={item.body} icon={item.icon} tone={item.tone} />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Ready to find your first step?"
        lead="Answer the guided questions and see a practical starting plan on screen."
        primary={{ href: "#builder", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
