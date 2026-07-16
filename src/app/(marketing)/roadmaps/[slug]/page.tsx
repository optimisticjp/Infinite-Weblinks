import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { Button } from "@/components/primitives/Button";
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

      <PageHero
        eyebrow="Suggested roadmap"
        title={roadmap.name}
        intro={roadmap.intro}
        breadcrumbs={[{ name: "Roadmaps", path: "/roadmaps" }, { name: roadmap.name }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="roadmap-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 id="roadmap-body-heading" className={styles.h2}>
                How the phases fit together
              </h2>
              <p className={styles.note}>
                A rough shape, not a fixed script — every plan is tailored to your specifics during
                discovery.
              </p>

              <ol className={styles.phases}>
                {phases.map((phase) => (
                  <li key={phase.id} id={phase.id} className={styles.phase}>
                    <span className={styles.num} aria-hidden="true">
                      {phase.index}
                    </span>
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
            </div>

            <aside className={styles.side}>
              {businessType && (
                <Link href={`/business-types/${businessType.slug}`} className={styles.forCard}>
                  <span className={styles.forLabel}>Built for</span>
                  <span className={styles.forName}>
                    {businessType.name}
                    <ArrowRight className={styles.forArrow} aria-hidden="true" />
                  </span>
                  <span className={styles.forHint}>{businessType.summary}</span>
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
