import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { Constellation, type ConstellationNode } from "@/components/viz/Constellation";
import { getServiceCategories, getServices } from "@/lib/content";
import type { Service, ServiceCategory } from "@/lib/content/types";
import styles from "./ServicesExplorerSection.module.css";

/** Curated pillar categories for the constellation orbit — a representative spread of
    hues around the mark. Every category still links out below, so no slug is dropped. */
const PILLAR_SLUGS = [
  "strategy-discovery",
  "websites-development",
  "seo-content",
  "ecommerce-ops-delivery",
  "paid-ads",
  "social-media",
  "ai-automation",
];

const FEATURES = [
  { label: "Connected systems", icon: "link" },
  { label: "Smarter decisions", icon: "bar-chart-3" },
  { label: "Better results", icon: "trending-up" },
];

/**
 * ServicesExplorerSection — router #2 (theme-dark, ref 12). A constellation of service
 * pillars orbits the mark, which owns the section's single glow. The full category list
 * links out below into `/services#<slug>`, so every service area stays one click away —
 * the homepage summarises and routes; the depth lives on /services.
 */
export async function ServicesExplorerSection({ anchorId }: { anchorId?: string }) {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);

  const grouped: ServiceCategory[] = categories.filter((category: ServiceCategory) =>
    services.some((s: Service) => s.categorySlug === category.slug),
  );

  if (grouped.length === 0) return null;

  const bySlug = new Map(grouped.map((c) => [c.slug, c] as const));
  const nodes: ConstellationNode[] = PILLAR_SLUGS.map((slug) => bySlug.get(slug))
    .filter((c): c is ServiceCategory => Boolean(c))
    .map((c) => ({ key: c.slug, label: c.name, icon: c.icon, color: c.color }));

  return (
    <section
      id={anchorId}
      className="theme-dark iw-section"
      aria-labelledby="services-explorer-heading"
    >
      <div className="iw-container">
        <div className={styles.layout}>
          <div className={styles.lead}>
            <p className="iw-eyebrow">Our services constellation</p>
            <h2 id="services-explorer-heading" className={styles.heading}>
              Everything your business needs, connected around your goals
            </h2>
            <p className={styles.intro}>
              Explore the systems we can plan, build, connect and improve. Every service is tagged
              with the model behind it, so you always know who does the work.
            </p>

            <div className={styles.ctas}>
              <Button
                href="/services"
                variant="primary"
                size="md"
                iconRight={<ArrowRight aria-hidden="true" size={18} />}
              >
                Browse all services
              </Button>
              <Button href="/growth-plan" variant="secondary" size="md">
                Build my growth plan
              </Button>
            </div>

            <ul className={styles.features}>
              {FEATURES.map((f) => (
                <li key={f.label} className={styles.feature}>
                  <Icon name={f.icon} className={styles.featureIcon} />
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.visual}>
            <Constellation nodes={nodes} ariaLabel="Service pillars orbiting the central connected mark.">
              <InfinityMark glow size={132} />
            </Constellation>
          </div>
        </div>

        <div className={styles.areas}>
          <p className={styles.areasLabel}>Explore every service area</p>
          <ul className={styles.areaGrid}>
            {grouped.map((category) => (
              <li key={category.slug} className={styles.chip} style={{ ["--accent" as string]: category.color }}>
                <Link href={`/services#${category.slug}`} className={styles.chipLink}>
                  <Icon name={category.icon} className={styles.chipIcon} />
                  <span className={styles.chipName}>{category.name}</span>
                  <ArrowRight className={styles.chipArrow} aria-hidden="true" size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
