import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { Button } from "@/components/primitives/Button";
import { LinkChip } from "@/components/primitives/LinkChip";
import { GrowthJourneyOverviewSection } from "@/components/sections/GrowthJourneyOverviewSection";
import { ConnectedSystemExplainerSection } from "@/components/sections/ConnectedSystemExplainerSection";
import { WorkProcessSection } from "@/components/sections/WorkProcessSection";
import { DeliveryModelsExplainerSection } from "@/components/sections/DeliveryModelsExplainerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./how-it-works.module.css";

/**
 * /how-it-works — the connected-system explainer on the V2 light-first system. PageHeader → a
 * compact page-jump nav → the growth-journey overview (eight stages + three cross-cutting systems)
 * → the connected-system explainer → the work process → the four delivery models → the closing
 * CTA. Every mega-menu deep link is preserved by moving each id onto real content: the eight stage
 * slugs live on the GrowthJourneyList items, the three system keys on the CrossCuttingSystemCards,
 * the four delivery keys on the DeliveryModelCards, and the section ids on their sections — the old
 * hidden anchor band is removed. Server-rendered; metadata, canonical and breadcrumb structured
 * data are unchanged.
 */
export const metadata: Metadata = pageMetadata({
  title: "How It Works",
  description:
    "One connected system, built around your growth: an eight-stage online growth journey, three systems that run across every stage, four ways we can be involved, and one steady process from start to finish.",
  path: "/how-it-works",
});

export default async function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ])}
      />

      <PageHeader
        id="how-it-works-hero"
        surface="light"
        breadcrumbs={[{ name: "How it works" }]}
        eyebrow="How it works"
        title="One connected system, built around your growth"
        lead="We start with your goals, find the smallest useful next step, and connect each stage so the work builds on itself over time. Seeing the whole path is what tells you where to start, and what can wait."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#growth-journey" variant="secondary">
              Explore the journey
            </Button>
          </>
        }
      />

      {/* Compact page-jump nav — links between the four sections, not tabs or a filter. */}
      <div className={`theme-deep ${styles.jumpNavBand}`}>
        <div className="iw-container iw-container--wide">
          <nav aria-label="How it works sections" className={styles.jumpNav}>
            <LinkChip href="#growth-journey">Growth journey</LinkChip>
            <LinkChip href="#how-it-connects">How it connects</LinkChip>
            <LinkChip href="#process">Our process</LinkChip>
            <LinkChip href="#delivery">Ways of working</LinkChip>
          </nav>
        </div>
      </div>

      <GrowthJourneyOverviewSection surface="alt" />
      <ConnectedSystemExplainerSection surface="light" />
      <WorkProcessSection surface="alt" />
      <DeliveryModelsExplainerSection surface="light" />

      <FinalCtaSection
        id="get-started"
        title="Start from where you are"
        lead="You don't need every stage — just the smallest useful next step. Tell us your goals and we'll map a connected plan around them, with the sequence and scope tailored to your business during discovery. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/goals#by-where-you-are", label: "Find where you are" }}
      />
    </>
  );
}
