import type { Metadata } from "next";
import { HomepageHeroSection } from "@/components/sections/home/HomepageHeroSection";
import { HomepageProblemSection } from "@/components/sections/home/HomepageProblemSection";
import { HomepageGoalRouterSection } from "@/components/sections/home/HomepageGoalRouterSection";
import { HomepageConnectedSystemSection } from "@/components/sections/home/HomepageConnectedSystemSection";
import { DeliveryModelsExplainerSection } from "@/components/sections/DeliveryModelsExplainerSection";
import { HomepageTrustSection } from "@/components/sections/home/HomepageTrustSection";
import { HomepageLearningSection } from "@/components/sections/home/HomepageLearningSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
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
 * Homepage — the V2 light-first spine: hero (with the works-with rail) → the digital-world problem
 * → start with your goal → one connected system (with the growth-journey / customer-journey /
 * services bridges) → ways of working → ownership and honest expectations → learn → the single
 * reserved dark final CTA. Every section is a server component (no HeroUniverse, canvas or
 * animation loop); the hero H1 is server-rendered text. Each homepage fragment lives on real,
 * visible content. The heavy legacy homepage sections stay in the codebase (used by their other
 * routes and the registry) — the homepage simply no longer renders them.
 */
export default async function HomePage() {
  const { hero, editorial } = await getHomepageOpening();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <HomepageHeroSection hero={hero} />
      <HomepageProblemSection data={editorial} />
      <HomepageGoalRouterSection />
      <HomepageConnectedSystemSection />
      <DeliveryModelsExplainerSection
        id="ways-of-working"
        surface="alt"
        showOwnership={false}
        cardFragmentTargets={false}
      />
      <HomepageTrustSection surface="light" />
      <HomepageLearningSection surface="alt" />

      <FinalCtaSection
        id="get-started"
        title="Build your digital growth plan, one connected step at a time."
        lead="Tell us where you are and what you want to achieve. We'll help you find the right starting point, then map what to build first and what to connect next."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
