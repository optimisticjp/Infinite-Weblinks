import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { Badge } from "@/components/primitives/Badge";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
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

      <CosmicPageHero
        id="roadmaps-hero"
        breadcrumbs={[{ name: "Roadmaps" }]}
        eyebrow="Roadmaps"
        hue="var(--domain-operate)"
        title={
          <>
            Suggested roadmaps for <span className="iw-gradient-word">common situations</span>
          </>
        }
        lead="These show the rough shape and order we'd work in for different kinds of business: foundation first, then traffic, then conversion, then retention. Every plan gets tailored to your specifics during discovery. This is the map, not a fixed route."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#roadmap-list" variant="ghost" size="lg">
              Browse the roadmaps
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--domain-operate)" size={128} emphasis="bright">
              <Icon name="workflow" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="roadmap-list"
        eyebrow="By kind of business"
        title="Pick the roadmap closest to yours"
        lead="Each one is a suggested sequence, not a fixed script. Open it to see the phases, the stage each maps to, and the services and goals it moves."
        align="start"
      >
        <BentoGrid>
          {roadmaps.map((roadmap, i) => {
            const businessType = businessTypeBySlug.get(roadmap.forBusinessTypeSlug);
            return (
              <BentoCard
                key={roadmap.slug}
                href={`/roadmaps/${roadmap.slug}`}
                hue={businessType?.color ?? "var(--domain-operate)"}
                icon={businessType?.icon ?? "workflow"}
                title={roadmap.name}
                blurb={roadmap.intro}
                variant={i === 0 ? "featured" : "medium"}
                badge={
                  businessType ? (
                    <Badge color={businessType.color} variant="outline">
                      For {businessType.name}
                    </Badge>
                  ) : undefined
                }
              />
            );
          })}
        </BentoGrid>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
