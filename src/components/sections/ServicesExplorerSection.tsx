import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getDeliveryModels, getServiceCategories, getServices } from "@/lib/content";
import type { Service, ServiceCategory } from "@/lib/content/types";
import styles from "./ServicesExplorerSection.module.css";

const PREVIEW_COUNT = 4;

/**
 * ServicesExplorerSection — a preview, not a catalogue (theme-dark).
 *
 * Services are grouped by category (the same grouping used on `/services`) and
 * only a few example services are shown per category, each tagged with its
 * delivery model so it's always clear who actually does the work. The first
 * populated category is shown full-width as a lead-in; the rest sit in a
 * lighter-weight grid — deliberately not a wall of identical equal cards.
 */
export async function ServicesExplorerSection({ anchorId }: { anchorId?: string }) {
  const [categories, services, deliveryModels] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getDeliveryModels(),
  ]);

  const deliveryNameByKey = new Map(deliveryModels.map((d) => [d.key, d.name] as const));

  const grouped: { category: ServiceCategory; items: Service[] }[] = categories
    .map((category) => ({
      category,
      items: services.filter((s) => s.categorySlug === category.slug),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  const [featured, ...rest] = grouped;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="services-explorer-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="services-explorer-heading"
          eyebrow="What we do"
          title="Services grouped the way you actually need them"
          intro="Every service is tagged with the delivery model behind it, so you always know who's doing the work — us in-house, a vetted specialist, a fully managed setup, or something we hand over to your team."
        />

        <div className={styles.featured}>
          <IconTile color={featured.category.color} variant="filled" size={64}>
            <Icon name={featured.category.icon} />
          </IconTile>
          <div className={styles.featuredBody}>
            <h3 className={styles.featuredName}>{featured.category.name}</h3>
            <p className={styles.featuredIntro}>{featured.category.intro}</p>
            <ul className={styles.serviceRows}>
              {featured.items.slice(0, PREVIEW_COUNT).map((service) => (
                <li key={service.slug} className={styles.serviceRow}>
                  <Link href={`/services/${service.slug}`} className={styles.serviceLink}>
                    {service.name}
                  </Link>
                  <Badge color={DELIVERY_COLOR[service.deliveryModel]}>
                    {deliveryNameByKey.get(service.deliveryModel) ?? service.deliveryModel}
                  </Badge>
                </li>
              ))}
            </ul>
            <Button
              href={`/services#${featured.category.slug}`}
              variant="text"
              size="sm"
              iconRight={<ArrowRight aria-hidden="true" size={16} />}
            >
              Explore all {featured.category.name} services
            </Button>
          </div>
        </div>

        {rest.length > 0 && (
          <ul className={styles.grid}>
            {rest.map(({ category, items }) => (
              <li key={category.slug} className={styles.card}>
                <IconTile color={category.color} size={44}>
                  <Icon name={category.icon} />
                </IconTile>
                <h4 className={styles.cardName}>{category.name}</h4>
                <p className={styles.cardIntro}>{category.intro}</p>
                <ul className={styles.exampleList}>
                  {items.slice(0, 3).map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} className={styles.exampleLink}>
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                {items.length > 3 && <p className={styles.more}>+{items.length - 3} more</p>}
                <Link href={`/services#${category.slug}`} className={styles.cardLink}>
                  See all in {category.name}
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.cta}>
          <Button href="/services" variant="secondary">
            Browse all services
          </Button>
        </div>
      </div>
    </section>
  );
}
