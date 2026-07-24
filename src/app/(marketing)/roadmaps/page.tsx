import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { RoadmapCard } from "@/components/cards/RoadmapCard";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes, getRoadmaps } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Roadmaps",
  description:
    "Suggested roadmaps for common situations — the rough shape and order we'd work in for each kind of business. Every plan is tailored to your specifics during discovery.",
  path: "/roadmaps",
});

export default async function RoadmapsIndexPage() {
  const [roadmaps, businessTypes] = await Promise.all([getRoadmaps(), getBusinessTypes()]);
  const businessTypeBySlug = new Map(businessTypes.map((b) => [b.slug, b] as const));

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Roadmaps",
          roadmaps.map((r) => ({ name: r.name, path: `/roadmaps/${r.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Roadmaps", path: "/roadmaps" },
        ])}
      />

      <PageHeader
        id="roadmaps-hero"
        breadcrumbs={[{ name: "Roadmaps" }]}
        eyebrow="Roadmaps"
        title="Suggested roadmaps for common situations"
        lead="These show the rough shape and order we'd work in for different kinds of business: foundation first, then traffic, then conversion, then retention. Every plan gets tailored to your specifics during discovery."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#roadmap-list" variant="secondary">
              Browse the roadmaps
            </Button>
          </>
        }
        trustNote="This is the map, not a fixed route."
      />

      {/* Light surface (chosen intentionally): the tinted RoadmapCards read best on white, and
          it distinguishes the roadmaps band from the alt-surface tool areas. */}
      <SectionShell
        surface="light"
        id="roadmap-list"
        eyebrow="By kind of business"
        title="Pick the roadmap closest to yours"
        lead="Each one is a suggested sequence, not a fixed script. Open it to see the phases, the stage each maps to, and the services and goals it moves."
        align="start"
      >
        <CardGrid layout="editorial" aria-label="Suggested roadmaps">
          {roadmaps.map((roadmap) => {
            const businessType = businessTypeBySlug.get(roadmap.forBusinessTypeSlug);
            return (
              <RoadmapCard
                key={roadmap.slug}
                href={`/roadmaps/${roadmap.slug}`}
                title={roadmap.name}
                intro={roadmap.intro}
                businessTypeLabel={businessType?.name ?? "Business roadmap"}
                businessTypeTone={businessType?.color}
                businessTypeIcon={businessType?.icon ?? "workflow"}
                phases={roadmap.phases}
              />
            );
          })}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Get a plan tailored to you"
        lead="These are suggested sequences. Your own plan is tailored to your specifics during discovery — build one around your goals, or talk it through with us first. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
