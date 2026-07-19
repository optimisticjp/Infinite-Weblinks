import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { GlowButton } from "@/components/primitives/GlowButton";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { ConnectedGrowthSection } from "@/components/sections/home/ConnectedGrowthSection";
import { OneSystemSection } from "@/components/sections/home/OneSystemSection";
import { ProcessStepsSection } from "@/components/sections/ProcessStepsSection";
import { DeliveryModelsSection } from "@/components/sections/DeliveryModelsSection";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStages, getSystems } from "@/lib/content";
import styles from "./how-it-works.module.css";

/**
 * /how-it-works — the story of the connected system, fully on the Constellation kit (no more
 * legacy PageHero shell). The spine: cosmic hero (H1 = LCP text) → the 8-stage growth journey
 * as the interactive StageTimeline with its three cross-cutting rails → "one system, not
 * silos" (the connected-system diagram) → the steady process → the four delivery models →
 * closing CTA. A thin, aria-hidden anchor band above the journey preserves the mega-menu's
 * deep links to every stage (#discovery-plan …) and cross-cutting system (#ai-automation …);
 * ProcessSteps/DeliveryModels keep #process, #delivery and #delivery-<key>.
 */
export const metadata: Metadata = pageMetadata({
  title: "How It Works",
  description:
    "One connected system, built around your growth: an eight-stage online growth journey, three systems that run across every stage, four ways we can be involved, and one steady process from start to finish.",
  path: "/how-it-works",
});

export default async function HowItWorksPage() {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ])}
      />

      <CosmicPageHero
        id="how-it-works-hero"
        breadcrumbs={[{ name: "How it works" }]}
        eyebrow="How it works"
        hue="var(--pink)"
        title={
          <>
            One connected system, built around your <span className="iw-gradient-word">growth</span>
          </>
        }
        lead="We start with your goals, find the smallest useful next step, and connect each stage so the work builds on itself over time. Seeing the whole path is what tells you where to start, and what can wait."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#growth-journey" variant="ghost" size="lg">
              Explore the journey
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <InfinityMark size={168} glow />
          </span>
        }
      />

      {/*
        Deep-link anchor band. The mega-menu links to each stage (#discovery-plan …) and each
        cross-cutting system (#ai-automation …); these thin, aria-hidden targets sit just above
        the journey so every link lands at the top of it. They inherit the page scroll-padding
        offset, so the sticky header never covers the landing point.
      */}
      <div className={styles.anchors} aria-hidden="true">
        {stages.map((stage) => (
          <span key={stage.slug} id={stage.slug} className={styles.anchor} />
        ))}
        {systems.map((system) => (
          <span key={system.key} id={system.key} className={styles.anchor} />
        ))}
      </div>

      {/* The 8-stage growth journey (interactive StageTimeline) + the three cross-cutting rails. */}
      <ConnectedGrowthSection />

      {/* One system, not silos — the connected-system diagram. */}
      <OneSystemSection />

      {/* The steady process behind every project (#process). */}
      <ProcessStepsSection anchorId="process" />

      {/* The four delivery models; each card carries id="delivery-<key>" for the mega-menu. */}
      <DeliveryModelsSection anchorId="delivery" />

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
