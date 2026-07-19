import type { Metadata } from "next";
import Link from "next/link";
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
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
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

  const businessType = businessTypes.find((b) => b.slug === roadmap.forBusinessTypeSlug);
  const hue = businessType?.color ?? "var(--domain-operate)";

  const phases = roadmap.phases.map((phase, i) => {
    const stage = stages.find((st) => st.slug === phase.stageSlug);
    const phaseServices = phase.serviceSlugs
      .map((s) => services.find((sv) => sv.slug === s))
      .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv));
    const phaseGoals = (phase.goalSlugs ?? [])
      .map((g) => goals.find((go) => go.slug === g))
      .filter((go): go is NonNullable<typeof go> => Boolean(go));
    return { ...phase, index: i + 1, id: `phase-${i + 1}`, stage, phaseServices, phaseGoals };
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
          phases.map((p) => ({ name: p.title, path: `/roadmaps/${roadmap.slug}#${p.id}` })),
        )}
      />

      <CosmicPageHero
        id="roadmap-hero"
        breadcrumbs={[{ name: "Roadmaps", path: "/roadmaps" }, { name: roadmap.name }]}
        eyebrow="Suggested roadmap"
        hue={hue}
        title={roadmap.name}
        lead={roadmap.intro}
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/roadmaps" variant="ghost" size="lg">
              All roadmaps
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={hue} size={128} emphasis="bright">
              <Icon name={businessType?.icon ?? "workflow"} />
            </NodeOrb>
          </span>
        }
      />

      {businessType && (
        <SectionShell id="built-for" eyebrow="Who it's for" title="Built around this kind of business" align="start" spacing="tight">
          <BentoGrid>
            <BentoCard
              href={`/business-types/${businessType.slug}`}
              hue={hue}
              icon={businessType.icon}
              eyebrow="Built for"
              title={businessType.name}
              blurb={businessType.summary}
              variant="featured"
            />
          </BentoGrid>
        </SectionShell>
      )}

      <SectionShell
        id="phases"
        eyebrow="The sequence"
        title="How the phases fit together"
        lead="A rough shape, not a fixed script. Every plan is tailored to your specifics during discovery."
        align="start"
      >
        <ol className={styles.phases}>
          {phases.map((phase) => (
            <li key={phase.id} id={phase.id} className={styles.phase} style={{ ["--hue" as string]: hue }}>
              <div className={styles.orb} aria-hidden="true">
                <NodeOrb hue={hue} size={52} emphasis="bright">
                  <span className={styles.num}>{phase.index}</span>
                </NodeOrb>
              </div>
              <div className={styles.phaseBody}>
                <h3 className={styles.phaseTitle}>{phase.title}</h3>
                <p className={styles.phaseSummary}>{phase.summary}</p>

                {phase.stage && (
                  <p className={styles.phaseStage}>
                    <span className={styles.metaLabel}>Stage</span>
                    <Link href={`/how-it-works#${phase.stage.slug}`} className={styles.stageLink}>
                      {phase.stage.name}
                    </Link>
                  </p>
                )}

                {phase.phaseServices.length > 0 && (
                  <div className={styles.linkGroup}>
                    <span className={styles.metaLabel}>Services in this phase</span>
                    <ul className={styles.linkList}>
                      {phase.phaseServices.map((sv) => (
                        <li key={sv.slug}>
                          <Link href={`/services/${sv.categorySlug}#${sv.slug}`} className={styles.pill}>
                            {sv.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {phase.phaseGoals.length > 0 && (
                  <div className={styles.linkGroup}>
                    <span className={styles.metaLabel}>Goals this moves</span>
                    <ul className={styles.linkList}>
                      {phase.phaseGoals.map((go) => (
                        <li key={go.slug}>
                          <Link href={`/goals/${go.slug}`} className={styles.pill}>
                            {go.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
