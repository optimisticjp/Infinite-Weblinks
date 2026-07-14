import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { IndexCard } from "@/components/routes/IndexCard";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes, getRoadmaps } from "@/lib/content";
import styles from "./roadmaps.module.css";

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

      <PageHero
        eyebrow="Roadmaps"
        title="Suggested roadmaps for common situations"
        intro="These show the rough shape and order we'd work in for different kinds of business — foundation first, then traffic, then conversion, then retention. Every plan gets tailored to your specifics during discovery; this is the map, not a fixed route."
        breadcrumbs={[{ name: "Roadmaps" }]}
      />

      <section className="theme-band iw-section" aria-label="Roadmaps">
        <div className="iw-container">
          <ul className={styles.grid}>
            {roadmaps.map((roadmap) => {
              const businessType = businessTypeBySlug.get(roadmap.forBusinessTypeSlug);
              return (
                <li key={roadmap.slug}>
                  <IndexCard
                    href={`/roadmaps/${roadmap.slug}`}
                    title={roadmap.name}
                    description={roadmap.intro}
                    icon={businessType?.icon}
                    color={businessType?.color}
                    footer={
                      businessType ? (
                        <Badge color={businessType.color} variant="outline">
                          For {businessType.name}
                        </Badge>
                      ) : undefined
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="theme-dark iw-section" aria-label="Next steps">
        <div className="iw-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Want the version built around your business?</h2>
            <p className={styles.ctaBody}>
              A roadmap shows the shape of the work. A plan turns it into your first concrete step,
              in the right order, around what you already have.
            </p>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
