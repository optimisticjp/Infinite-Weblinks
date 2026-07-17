import { Fragment, type ReactNode } from "react";
import type { SectionConfig, SectionType } from "@/lib/content/types";
import { GrowthJourneySection } from "./GrowthJourneySection";
import { GoalExplorerSection } from "./GoalExplorerSection";
import { ConnectedSystemSection } from "./ConnectedSystemSection";
import { CustomerJourneySection } from "./CustomerJourneySection";
import { ConnectedExamplesSection } from "./ConnectedExamplesSection";
import { AccountOwnershipSection } from "./AccountOwnershipSection";
import { StartingPointSelectorSection } from "./StartingPointSelectorSection";
import { ServicesExplorerSection } from "./ServicesExplorerSection";
import { ToolUniverseSection } from "./ToolUniverseSection";
import { DeliveryModelsSection } from "./DeliveryModelsSection";
import { ProcessStepsSection } from "./ProcessStepsSection";
import { WhyInfiniteWeblinksSection } from "./WhyInfiniteWeblinksSection";
import { CaseStudyShowcaseSection } from "./CaseStudyShowcaseSection";
import { TestimonialWallSection } from "./TestimonialWallSection";
import { LearningResourcesSection } from "./LearningResourcesSection";
import { FaqSection } from "./FaqSection";
import { FinalCtaBannerSection } from "./FinalCtaBannerSection";

/**
 * Section renderer registry. Maps a `SectionType` to the component that renders it.
 * The homepage opening (Hero + EditorialStatement) is rendered explicitly by the page
 * to preserve the approved GATE-1 opening exactly, so `editorialStatement` is
 * intentionally NOT registered here — any config entry for it is skipped.
 *
 * Every section is a self-contained async server component that fetches its own
 * status-gated data and returns `null` when there's nothing to show, so an
 * unavailable/empty section simply disappears rather than rendering an empty shell.
 * Unknown/unregistered section types are skipped rather than throwing.
 */
type SectionRenderer = (anchorId?: string) => ReactNode;

const REGISTRY: Partial<Record<SectionType, SectionRenderer>> = {
  growthJourney: (id) => <GrowthJourneySection anchorId={id} />,
  goalExplorer: (id) => <GoalExplorerSection anchorId={id} />,
  connectedSystem: (id) => <ConnectedSystemSection anchorId={id} />,
  customerJourney: (id) => <CustomerJourneySection anchorId={id} />,
  connectedExamples: (id) => <ConnectedExamplesSection anchorId={id} />,
  accountOwnership: (id) => <AccountOwnershipSection anchorId={id} />,
  startingPointSelector: (id) => <StartingPointSelectorSection anchorId={id} />,
  servicesExplorer: (id) => <ServicesExplorerSection anchorId={id} />,
  toolUniverse: (id) => <ToolUniverseSection anchorId={id} />,
  deliveryModels: (id) => <DeliveryModelsSection anchorId={id} />,
  processSteps: (id) => <ProcessStepsSection anchorId={id} />,
  whyInfiniteWeblinks: (id) => <WhyInfiniteWeblinksSection anchorId={id} />,
  caseStudyShowcase: (id) => <CaseStudyShowcaseSection anchorId={id} />,
  testimonialWall: (id) => <TestimonialWallSection anchorId={id} />,
  learningResources: (id) => <LearningResourcesSection anchorId={id} />,
  faqSection: (id) => <FaqSection anchorId={id} />,
  finalCtaBanner: (id) => <FinalCtaBannerSection anchorId={id} />,
};

/** Render an ordered list of section configs into their mapped components. */
export function HomepageSections({ sections }: { sections: SectionConfig[] }) {
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map((s) => {
          const render = REGISTRY[s.type];
          if (!render) return null;
          return <Fragment key={s.type}>{render(s.anchorId)}</Fragment>;
        })}
    </>
  );
}
