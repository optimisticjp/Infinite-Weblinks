import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Button } from "@/components/primitives/Button";
import { RoadmapPhaseList, type RoadmapPhaseItem } from "@/components/routes/RoadmapPhaseList";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import {
  getBusinessTypes,
  getGoals,
  getRoadmap,
  getRoadmaps,
  getServices,
  getStages,
} from "@/lib/content";
import styles from "./roadmap.module.css";

export async function generateStaticParams() {
  const roadmaps = await getRoadmaps();
  return roadmaps.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  return pageMetadata({
    title: roadmap.name,
    description: roadmap.intro,
    path: `/roadmaps/${roadmap.slug}`,
  });
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [roadmap, businessTypes, services, goals, stages] = await Promise.all([
    getRoadmap(slug),
    getBusinessTypes(),
    getServices(),
    getGoals(),
    getStages(),
  ]);
  if (!roadmap) notFound();

  const businessTypeBySlug = new Map(businessTypes.map((b) => [b.slug, b] as const));
  const serviceBySlug = new Map(services.map((s) => [s.slug, s] as const));
  const goalBySlug = new Map(goals.map((g) => [g.slug, g] as const));
  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));

  const businessType = businessTypeBySlug.get(roadmap.forBusinessTypeSlug);
  const ink = domainInk(businessType?.color);

  // Resolve every phase's stage, services and goals; keep source order; omit only individual
  // unresolved relationships (production stays renderable; the integrity test guards the seed).
  const phaseItems: RoadmapPhaseItem[] = roadmap.phases.map((phase, i) => {
    const stage = stageBySlug.get(phase.stageSlug);
    const phaseServices = phase.serviceSlugs
      .map((s) => serviceBySlug.get(s))
      .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
      .map((sv) => ({ slug: sv.slug, categorySlug: sv.categorySlug, name: sv.name }));
    const phaseGoals = (phase.goalSlugs ?? [])
      .map((g) => goalBySlug.get(g))
      .filter((go): go is NonNullable<typeof go> => Boolean(go))
      .map((go) => ({ slug: go.slug, title: go.title }));
    return {
      id: `phase-${i + 1}`,
      number: i + 1,
      title: phase.title,
      summary: phase.summary,
      stage: stage ? { slug: stage.slug, name: stage.name, tone: stage.color } : null,
      services: phaseServices,
      goals: phaseGoals,
    };
  });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Roadmaps", path: "/roadmaps" },
          { name: roadmap.name, path: `/roadmaps/${roadmap.slug}` },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          roadmap.name,
          phaseItems.map((p) => ({ name: p.title, path: `/roadmaps/${roadmap.slug}#${p.id}` })),
        )}
      />

      <PageHeader
        id="roadmap-hero"
        breadcrumbs={[{ name: "Roadmaps", path: "/roadmaps" }, { name: roadmap.name }]}
        eyebrow="Suggested roadmap"
        accent={ink}
        title={roadmap.name}
        lead={roadmap.intro}
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/roadmaps" variant="secondary">
              All roadmaps
            </Button>
          </>
        }
        trustNote="This is a map, not a fixed route."
      />

      {businessType ? (
        <SectionShell
          surface="alt"
          id="built-for"
          eyebrow="Who it's for"
          title="Built around this kind of business"
          align="start"
          spacing="tight"
        >
          <Card
            href={`/business-types/${businessType.slug}`}
            accent={ink}
            className={styles.builtFor}
          >
            <IconTile color={ink} size="lg">
              <Icon name={businessType.icon} />
            </IconTile>
            <span className={styles.builtForBody}>
              <span className={styles.builtForEyebrow}>Built for</span>
              <span className={styles.builtForName}>{businessType.name}</span>
              <span className={styles.builtForText}>{businessType.summary}</span>
            </span>
            <ArrowRight className={styles.builtForArrow} aria-hidden="true" />
          </Card>
        </SectionShell>
      ) : null}

      <SectionShell
        surface="light"
        id="phases"
        eyebrow="The sequence"
        title="How the phases fit together"
        lead="Each phase builds on the last. Jump to any phase with the numbered anchors, and follow the links to the stages, services and goals it moves."
        align="start"
      >
        <RoadmapPhaseList phases={phaseItems} />
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Your plan is tailored to you"
        lead="This is a suggested shape. We tailor the actual plan to your specifics during discovery — build one around your goals, or talk it through first. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/roadmaps", label: "All roadmaps" }}
      />
    </>
  );
}
