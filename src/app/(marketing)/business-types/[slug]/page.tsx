import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { GoalCard } from "@/components/cards/GoalCard";
import { RoadmapCard } from "@/components/cards/RoadmapCard";
import { DomainCard } from "@/components/cards/DomainCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import {
  getBusinessType,
  getBusinessTypes,
  getGoals,
  getRoadmaps,
  getServices,
  getServiceCategories,
} from "@/lib/content";
import styles from "./business-type.module.css";

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
 * /business-types/[slug] — one kind of business on the V2 light-first system: the situation and
 * the goals that matter most (GoalCards), the suggested roadmap as a single sequence-led
 * RoadmapCard, and the service domains the work touches (DomainCards, each in its own tone),
 * then the shared closing CTA. The service domains are still derived from the business type's own
 * services and deduplicated — the derivation is unchanged; only the presentation is V2.
 * Server-rendered; metadata, canonical, the "Your goal" → /goals breadcrumb, `notFound` gating
 * and every content relationship are preserved from the pre-V2 template.
 */
export default async function BusinessTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [businessType, goals, roadmaps, services, categories] = await Promise.all([
    getBusinessType(slug),
    getGoals(),
    getRoadmaps(),
    getServices(),
    getServiceCategories(),
  ]);
  if (!businessType) notFound();

  const roadmap = businessType.roadmapSlug
    ? roadmaps.find((r) => r.slug === businessType.roadmapSlug)
    : undefined;

  // The goals that matter most, in the business type's own source order. A goal that can't be
  // resolved is omitted (surfaced by the relationship-integrity test); content integrity
  // guarantees resolution today.
  const matchingGoals = businessType.goalSlugs
    .map((s) => goals.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  // The service domains this business type touches, derived from its relevant services and
  // deduplicated first-seen — unchanged derivation, so the page points at whole domains (each in
  // its own tone), not seventy services. No getServiceDomainConfig: the domain tone is the
  // category's own colour, mapped through the domain bridge inside DomainCard.
  const relevantCategorySlugs = [
    ...new Set(
      services
        .filter((sv) => sv.businessTypeSlugs.includes(businessType.slug))
        .map((sv) => sv.categorySlug),
    ),
  ];
  const relevantDomains = relevantCategorySlugs
    .map((cs) => categories.find((c) => c.slug === cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Your goal", path: "/goals" },
          { name: businessType.name, path: `/business-types/${businessType.slug}` },
        ])}
      />

      <PageHeader
        id="business-type-hero"
        surface="light"
        breadcrumbs={[{ name: "Your goal", path: "/goals" }, { name: businessType.name }]}
        eyebrow="Who we help"
        accent={domainInk(businessType.color)}
        title={businessType.name}
        lead={businessType.summary}
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#matters" variant="secondary">
              What matters here
            </Button>
          </>
        }
        trustNote="Every plan is tailored during discovery."
      />

      <SectionShell
        surface="alt"
        id="matters"
        eyebrow="The situation"
        title="What tends to matter, and in what order"
        lead={businessType.description}
        align="start"
      >
        {matchingGoals.length > 0 ? (
          <CardGrid layout="equal" aria-label="Goals that matter most for this kind of business">
            {matchingGoals.map((goal) => (
              <GoalCard
                key={goal.slug}
                href={`/goals/${goal.slug}`}
                title={goal.title}
                outcome={goal.outcome}
                icon={goal.icon}
                tone={goal.color}
                audienceHint={goal.audienceHint}
              />
            ))}
          </CardGrid>
        ) : null}
      </SectionShell>

      {roadmap ? (
        <SectionShell
          surface="light"
          id="roadmap"
          eyebrow="Your roadmap"
          title="A suggested path, in phases"
          lead="A suggested sequence for this kind of business, not a fixed script. Open it for the full phases, the stage each maps to, and the services and goals it moves."
          align="start"
        >
          <div className={styles.roadmapWrap}>
            <RoadmapCard
              href={`/roadmaps/${roadmap.slug}`}
              title={roadmap.name}
              intro={roadmap.intro}
              businessTypeLabel={businessType.name}
              businessTypeTone={businessType.color}
              businessTypeIcon={businessType.icon}
              phases={roadmap.phases}
            />
          </div>
        </SectionShell>
      ) : null}

      {relevantDomains.length > 0 ? (
        <SectionShell
          surface="alt"
          id="domains"
          eyebrow="Where we'd focus"
          title="The domains this touches"
          lead="The areas of work that come up most for this kind of business. Open any one to see exactly what's inside."
          align="start"
        >
          <CardGrid layout="equal" aria-label="Service domains this business type touches">
            {relevantDomains.map((cat) => (
              <DomainCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                eyebrow="Service domain"
                title={cat.name}
                description={cat.intro}
                icon={cat.icon}
                tone={cat.color}
              />
            ))}
          </CardGrid>
        </SectionShell>
      ) : null}

      <FinalCtaSection
        id="get-started"
        title="Get a plan built around your business"
        lead="Your plan is tailored during discovery — not an identical roadmap for every business like yours. Build one around your goals. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/goals#by-business-type", label: "See other business types" }}
      />
    </>
  );
}
