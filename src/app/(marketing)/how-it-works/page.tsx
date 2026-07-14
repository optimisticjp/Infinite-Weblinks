import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { Button } from "@/components/primitives/Button";
import { GrowthJourneySection } from "@/components/sections/GrowthJourneySection";
import { ConnectedSystemSection } from "@/components/sections/ConnectedSystemSection";
import { DeliveryModelsSection } from "@/components/sections/DeliveryModelsSection";
import { ProcessStepsSection } from "@/components/sections/ProcessStepsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStages, getSystems } from "@/lib/content";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How It Works",
  description:
    "The connected system behind the work: an eight-stage online growth journey, three systems that run across every stage, four delivery models, and one process from start to finish.",
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

      <PageHero
        eyebrow="How It Works"
        title="One connected journey, eight stages at a time"
        intro="Every business moves through the same eight-stage online growth journey, with three systems running across all of it. You don't have to do it all at once — seeing the whole path is what tells you where to start, and what can wait."
        breadcrumbs={[{ name: "How It Works" }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      {/*
        Anchor wrappers. The mega-menu links to per-stage (#discovery-plan …) and
        per-system (#ai-automation …) anchors. The reused section components render
        the stages/systems but do NOT put those ids on their inner elements, and we
        must not edit those components — so we place thin, non-visual anchor targets
        just above each section. They share the page's scroll-padding-top offset, so
        each menu link lands at the top of the relevant section.
      */}
      <div className={styles.anchors} aria-hidden="true">
        {stages.map((stage) => (
          <span key={stage.slug} id={stage.slug} className={styles.anchor} />
        ))}
      </div>
      <GrowthJourneySection anchorId="journey" />

      <div className={styles.anchors} aria-hidden="true">
        {systems.map((system) => (
          <span key={system.key} id={system.key} className={styles.anchor} />
        ))}
      </div>
      <ConnectedSystemSection anchorId="systems" />

      <DeliveryModelsSection anchorId="delivery" />

      <ProcessStepsSection anchorId="process" />
    </>
  );
}
