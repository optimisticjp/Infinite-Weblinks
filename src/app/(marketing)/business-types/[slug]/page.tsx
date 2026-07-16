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
import {
  getBusinessType,
  getBusinessTypes,
  getGoals,
  getRoadmaps,
  getServices,
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

export default async function BusinessTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [businessType, goals, roadmaps, services] = await Promise.all([
    getBusinessType(slug),
    getGoals(),
    getRoadmaps(),
    getServices(),
  ]);
  if (!businessType) notFound();

  const roadmap = businessType.roadmapSlug
    ? roadmaps.find((r) => r.slug === businessType.roadmapSlug)
    : undefined;

  const relatedGoals = businessType.goalSlugs
    .map((s) => goals.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ name: g.title, href: `/goals/${g.slug}`, hint: g.outcome }));

  const relevantServices = services
    .filter((sv) => sv.businessTypeSlugs.includes(businessType.slug))
    .slice(0, 6)
    .map((sv) => ({ name: sv.name, href: `/services/${sv.categorySlug}#${sv.slug}`, hint: sv.plainDescription }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Business types", path: "/business-types" },
          { name: businessType.name, path: `/business-types/${businessType.slug}` },
        ])}
      />

      <PageHero
        eyebrow="Who we help"
        title={businessType.name}
        intro={businessType.summary}
        breadcrumbs={[
          { name: "Business types", path: "/business-types" },
          { name: businessType.name },
        ]}
        aside={
          <div
            className={styles.iconBadge}
            style={{ ["--accent" as string]: businessType.color }}
            aria-hidden="true"
          >
            <Icon name={businessType.icon} className={styles.icon} />
          </div>
        }
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="bt-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 id="bt-body-heading" className={styles.h2}>
                What tends to matter for {businessType.name.toLowerCase()}
              </h2>
              <p className={styles.prose}>{businessType.description}</p>

              {roadmap && (
                <Link
                  href={`/roadmaps/${roadmap.slug}`}
                  className={styles.roadmapCta}
                  style={{ ["--accent" as string]: businessType.color }}
                >
                  <span className={styles.roadmapLabel}>Suggested roadmap</span>
                  <span className={styles.roadmapName}>
                    See the {roadmap.name}
                    <ArrowRight className={styles.roadmapArrow} aria-hidden="true" />
                  </span>
                  <span className={styles.roadmapHint}>{roadmap.intro}</span>
                </Link>
              )}
            </div>

            <aside className={styles.side}>
              <RelatedLinks title="Goals to focus on" links={relatedGoals} columns={1} />
              <RelatedLinks title="Relevant services" links={relevantServices} columns={1} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
