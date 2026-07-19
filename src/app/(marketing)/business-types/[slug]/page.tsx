import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getBusinessType,
  getBusinessTypes,
  getGoals,
  getRoadmaps,
  getServices,
  getServiceCategories,
  getStages,
} from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";

export async function generateStaticParams() {
  const businessTypes = await getBusinessTypes();
  return businessTypes.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const businessType = await getBusinessType(slug);
  if (!businessType) return { title: "Business type not found" };
  return pageMetadata({
    title: businessType.name,
    description: businessType.summary,
    path: `/business-types/${businessType.slug}`,
  });
}

/**
 * /business-types/[slug] — one kind of business, framed on the Constellation kit: the
 * situation and the goals that matter most, a recommended roadmap in phases, and the service
 * domains the work touches (each linking to its domain page in its hue), then a route into
 * the plan builder. Reuses the shared cosmic hero, SectionShell, bento tiles and node orbs.
 */
export default async function BusinessTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [businessType, goals, roadmaps, services, categories, stages] = await Promise.all([
    getBusinessType(slug),
    getGoals(),
    getRoadmaps(),
    getServices(),
    getServiceCategories(),
    getStages(),
  ]);
  if (!businessType) notFound();

  const roadmap = businessType.roadmapSlug
    ? roadmaps.find((r) => r.slug === businessType.roadmapSlug)
    : undefined;

  const matchingGoals = businessType.goalSlugs
    .map((s) => goals.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));

  // The service domains this business type touches, derived from its relevant services and
  // deduplicated, so the page points at whole domains (in their hue), not seventy services.
  const relevantCategorySlugs = [
    ...new Set(
      services.filter((sv) => sv.businessTypeSlugs.includes(businessType.slug)).map((sv) => sv.categorySlug),
    ),
  ];
  const relevantDomains = relevantCategorySlugs
    .map((cs) => categories.find((c) => c.slug === cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const hueFor = (cslug: string, fallback: string) =>
    getServiceDomainConfig(cslug)?.hue ?? fallback;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Your goal", path: "/goals" },
          { name: businessType.name, path: `/business-types/${businessType.slug}` },
        ])}
      />

      <CosmicPageHero
        id="business-type-hero"
        breadcrumbs={[{ name: "Your goal", path: "/goals" }, { name: businessType.name }]}
        eyebrow="Who we help"
        hue={businessType.color}
        title={businessType.name}
        lead={businessType.summary}
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#matters" variant="ghost" size="lg">
              What matters here
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={businessType.color} size={128} emphasis="bright">
              <Icon name={businessType.icon} />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="matters"
        eyebrow="The situation"
        title="What tends to matter, and in what order"
        lead={businessType.description}
        align="start"
      >
        {matchingGoals.length > 0 ? (
          <BentoGrid>
            {matchingGoals.map((goal, i) => (
              <BentoCard
                key={goal.slug}
                href={`/goals/${goal.slug}`}
                hue={goal.color}
                icon={goal.icon}
                index={String(i + 1).padStart(2, "0")}
                eyebrow="Goal"
                title={goal.title}
                blurb={goal.outcome}
                variant={i === 0 ? "featured" : "medium"}
              />
            ))}
          </BentoGrid>
        ) : null}
      </SectionShell>

      {roadmap ? (
        <SectionShell
          id="roadmap"
          eyebrow="Your roadmap"
          title={
            <>
              A path in <span className="iw-gradient-word">phases</span>
            </>
          }
          lead={roadmap.intro}
          align="start"
        >
          <BentoGrid>
            {roadmap.phases.map((phase, i) => {
              const stage = stageBySlug.get(phase.stageSlug);
              return (
                <BentoCard
                  key={phase.title}
                  hue={stage?.color ?? businessType.color}
                  icon={stage?.icon ?? "compass"}
                  index={String(i + 1).padStart(2, "0")}
                  eyebrow={`Phase ${i + 1}`}
                  title={phase.title}
                  blurb={phase.summary}
                  variant={i === 0 ? "featured" : "medium"}
                />
              );
            })}
          </BentoGrid>
        </SectionShell>
      ) : null}

      {relevantDomains.length > 0 ? (
        <SectionShell
          id="domains"
          eyebrow="Where we'd focus"
          title="The domains this touches"
          lead="The areas of work that come up most for this kind of business. Open any one to see exactly what's inside."
          align="start"
        >
          <BentoGrid>
            {relevantDomains.map((cat, i) => (
              <BentoCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                hue={hueFor(cat.slug, cat.color)}
                icon={cat.icon}
                title={cat.name}
                blurb={cat.intro}
                variant={i === 0 ? "featured" : "medium"}
              />
            ))}
          </BentoGrid>
        </SectionShell>
      ) : null}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
