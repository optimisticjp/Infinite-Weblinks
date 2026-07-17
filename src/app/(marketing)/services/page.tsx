import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { Constellation, type ConstellationNode } from "@/components/viz/Constellation";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServiceCategories, getServices } from "@/lib/content";
import styles from "./services.module.css";

/**
 * /services — a router, not a catalogue.
 *
 * Redesign: a services-constellation opening (ref 12) — the mark ringed by a spread of
 * colour-coded category nodes — over the full sixteen categories as a premium card grid.
 * Each card is a real destination (/services/<category>); the individual services fold in
 * on those category pages. No new taxonomy — names and intros come from service-categories.ts.
 */
export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Everything Infinite Weblinks can build and run for you, grouped the way you actually need it. Pick a category, or build a plan and we'll sequence the right ones for you.",
  path: "/services",
});

// A colour-varied spread of real categories for the opening constellation — a visual
// overview, not the exhaustive list (that is the grid below). Ordered around the ellipse.
const ORBIT_SLUGS = [
  "strategy-discovery",
  "websites-development",
  "seo-content",
  "ecommerce-ops-delivery",
  "paid-ads",
  "branding-design",
  "retention-loyalty-advocacy",
];

export default async function ServicesIndexPage() {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);
  const countByCategory = new Map<string, number>();
  for (const s of services) {
    countByCategory.set(s.categorySlug, (countByCategory.get(s.categorySlug) ?? 0) + 1);
  }

  const orbitNodes: ConstellationNode[] = ORBIT_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  )
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ key: c.slug, label: c.name, icon: c.icon, color: c.color }));

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Service categories",
          categories.map((c) => ({ name: c.name, path: `/services/${c.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHero
        eyebrow="Our services constellation"
        title="Everything your business needs, connected around your goals"
        intro="Sixteen areas of work, grouped the way you actually need them. Every service is tagged with who does the work, so it's always clear. Pick a category, or build a plan and we'll sequence the right ones for you."
        breadcrumbs={[{ name: "Services" }]}
        accent="var(--violet)"
        actions={
          <>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
            <Button href="#service-categories" variant="secondary">
              View all services
            </Button>
          </>
        }
      />

      {/* Constellation overview — the mark owns the brightest value; the category nodes run
          as ambient supporting lights around it (light budget). */}
      <section className={`theme-dark iw-section ${styles.constellation}`} aria-labelledby="services-viz-heading">
        <div className="iw-container iw-container--wide">
          <div className={styles.vizGrid}>
            <div className={styles.vizText}>
              <p className={`iw-eyebrow ${styles.eyebrow}`}>One connected system</p>
              <h2 id="services-viz-heading" className={styles.vizTitle}>
                A connected system, not a menu
              </h2>
              <p className={styles.vizLead}>
                Explore the areas we can plan, build, connect and improve. On their own each
                one helps; sequenced around your goals, they compound.
              </p>
              <ul className={styles.chips}>
                <li className={styles.chip}>
                  <span className={styles.chipIcon} aria-hidden="true">
                    <Icon name="link" />
                  </span>
                  Connected systems
                </li>
                <li className={styles.chip}>
                  <span className={styles.chipIcon} aria-hidden="true">
                    <Icon name="sparkles" />
                  </span>
                  Smarter decisions
                </li>
                <li className={styles.chip}>
                  <span className={styles.chipIcon} aria-hidden="true">
                    <Icon name="trending-up" />
                  </span>
                  Better results
                </li>
              </ul>
            </div>
            <div className={styles.vizStage}>
              <Constellation nodes={orbitNodes} ariaLabel="A selection of service areas orbiting the Infinite Weblinks mark">
                <InfinityMark size={128} glow />
              </Constellation>
            </div>
          </div>
        </div>
      </section>

      <section id="service-categories" className={`theme-dark iw-section ${styles.gridSection}`} aria-labelledby="services-grid-heading">
        <div className="iw-container">
          <div className={styles.gridHead}>
            <h2 id="services-grid-heading" className={styles.gridTitle}>
              Sixteen areas of work
            </h2>
            <p className={styles.gridLead}>
              Each one is its own page, with the exact services inside and the delivery model
              behind every one.
            </p>
          </div>
          <HubGrid center min="15rem">
            {categories.map((category) => {
              const count = countByCategory.get(category.slug) ?? 0;
              return (
                <HubGridItem key={category.slug}>
                  <IndexCard
                    href={`/services/${category.slug}`}
                    title={category.name}
                    description={category.intro}
                    icon={category.icon}
                    color={category.color}
                    footer={count > 0 ? `${count} service${count === 1 ? "" : "s"}` : undefined}
                  />
                </HubGridItem>
              );
            })}
          </HubGrid>
        </div>
      </section>

      <section className={`theme-band iw-section iw-section--tight ${styles.cta}`} aria-labelledby="services-cta-heading">
        <div className="iw-container">
          <div className={styles.ctaInner}>
            <h2 id="services-cta-heading" className={styles.ctaTitle}>
              Not sure which of these you need first?
            </h2>
            <p className={styles.ctaBody}>
              That&apos;s the point of a plan. Tell us your goals and we&apos;ll map the smallest next
              step, then the ones that follow — in the right order, around what you already have.
            </p>
            <div className={styles.ctaActions}>
              <Button href="/growth-plan" variant="primary">
                Build My Digital Growth Plan
              </Button>
              <Button href="/how-it-works" variant="secondary">
                See how it all connects
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
