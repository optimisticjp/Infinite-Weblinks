import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { EditorialStatement } from "@/components/sections/EditorialStatement";
import { GoalBentoSection } from "@/components/sections/home/GoalBentoSection";
import { ConnectedGrowthSection } from "@/components/sections/home/ConnectedGrowthSection";
import { OneSystemSection } from "@/components/sections/home/OneSystemSection";
import { CustomerJourneySection } from "@/components/sections/CustomerJourneySection";
import { ServicesConstellationSection } from "@/components/sections/home/ServicesConstellationSection";
import { DeliveryModelsSection } from "@/components/sections/DeliveryModelsSection";
import { AccountOwnershipSection } from "@/components/sections/AccountOwnershipSection";
import { HonestExpectationsSection } from "@/components/sections/home/HonestExpectationsSection";
import { LearningResourcesSection } from "@/components/sections/LearningResourcesSection";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomepageOpening } from "@/lib/content";
import { canonical } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

// Title, description and OG are inherited from the strong root-layout defaults; only the
// self-canonical is set here so the index root has one.
export const metadata: Metadata = {
  alternates: { canonical: canonical("/") },
};

/**
 * Homepage — the flagship page of the Constellation rebrand. The spine, in order:
 * hero (dark, the signature moment) → the digital world today (light breather) → start with
 * your goal (bento router) → the connected growth journey (stage timeline + rails) → one
 * system not silos (the differentiator) → customer journey (phones) → services constellation
 * (interactive) → four ways we deliver (light) → ownership → honest expectations → resources
 * (light) → final CTA. Reused sections are rendered directly; the new cosmic sections live in
 * `sections/home/`. The hero headline is server-rendered text (the LCP element); every heavy
 * scene hydrates progressively and only animates while in view.
 */
export default async function HomePage() {
  const { hero, editorial } = await getHomepageOpening();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <Hero hero={hero} />
      <EditorialStatement data={editorial} />
      <GoalBentoSection />
      <ConnectedGrowthSection />
      <OneSystemSection />
      <CustomerJourneySection anchorId="customer-journey" />
      <ServicesConstellationSection />
      <DeliveryModelsSection anchorId="ways-of-working" />
      <AccountOwnershipSection anchorId="ownership" />
      <HonestExpectationsSection />
      <LearningResourcesSection anchorId="learn" />
      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
