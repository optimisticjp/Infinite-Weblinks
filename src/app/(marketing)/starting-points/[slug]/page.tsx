import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServices, getStages, getStartingPoint, getStartingPoints } from "@/lib/content";
import styles from "./starting-point.module.css";

export async function generateStaticParams() {
  const startingPoints = await getStartingPoints();
  return startingPoints.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const startingPoint = await getStartingPoint(slug);
  if (!startingPoint) return { title: "Starting point not found" };
  return pageMetadata({
    title: startingPoint.label,
    description: startingPoint.situation,
    path: `/starting-points/${startingPoint.slug}`,
  });
}

export default async function StartingPointDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [startingPoint, stages, services] = await Promise.all([
    getStartingPoint(slug),
    getStages(),
    getServices(),
  ]);
  if (!startingPoint) notFound();

  const stage = stages.find((st) => st.slug === startingPoint.recommendedStageSlug);

  const stageServices = (stage?.serviceSlugs ?? [])
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => ({ name: sv.name, href: `/services/${sv.categorySlug}#${sv.slug}`, hint: sv.plainDescription }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Starting points", path: "/starting-points" },
          { name: startingPoint.label, path: `/starting-points/${startingPoint.slug}` },
        ])}
      />

      <PageHero
        eyebrow="Where you're starting"
        title={startingPoint.label}
        intro={startingPoint.situation}
        breadcrumbs={[
          { name: "Starting points", path: "/starting-points" },
          { name: startingPoint.label },
        ]}
        aside={
          <div
            className={styles.iconBadge}
            style={{ ["--accent" as string]: startingPoint.color }}
            aria-hidden="true"
          >
            <Icon name={startingPoint.icon} className={styles.icon} />
          </div>
        }
        actions={
          <Button href={startingPoint.cta.route} variant={startingPoint.cta.style}>
            {startingPoint.cta.label}
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="sp-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              {stage && (
                <Link
                  href={`/how-it-works#${stage.slug}`}
                  className={styles.stageCard}
                  style={{ ["--accent" as string]: startingPoint.color }}
                >
                  <span className={styles.stageLabel}>Recommended starting stage</span>
                  <span className={styles.stageName}>
                    {stage.name}
                    <ArrowRight className={styles.stageArrow} aria-hidden="true" />
                  </span>
                  <span className={styles.stageHint}>{stage.summary}</span>
                </Link>
              )}

              <h2 id="sp-body-heading" className={styles.h2}>
                What we&apos;d recommend
              </h2>
              <p className={styles.prose}>{startingPoint.recommendation}</p>
              <p className={styles.reassure}>
                Most businesses sit in more than one situation at once, and that&apos;s normal. Your plan
                is tailored to your specifics during discovery.
              </p>
            </div>

            <aside className={styles.side}>
              <RelatedLinks title="Services in this stage" links={stageServices} columns={1} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
