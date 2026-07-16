import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getServiceCategories, getServices } from "@/lib/content";
import type { Service, ServiceCategory } from "@/lib/content/types";
import styles from "./ServicesExplorerSection.module.css";

/**
 * ServicesExplorerSection — router #2, a preview not a catalogue (theme-dark).
 *
 * A compact map of what we do: every service category as a chip that routes into its
 * section on `/services`, which lists all 70 services in full with their delivery
 * models. The homepage summarises and routes; the depth lives one click away.
 */
export async function ServicesExplorerSection({ anchorId }: { anchorId?: string }) {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);

  const grouped: ServiceCategory[] = categories.filter((category: ServiceCategory) =>
    services.some((s: Service) => s.categorySlug === category.slug),
  );

  if (grouped.length === 0) return null;

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
          aside={
            <Button href="/services" variant="secondary" size="sm">
              Browse all services
            </Button>
          }
        />

        <ul className={styles.grid}>
          {grouped.map((category) => (
            <li key={category.slug} className={styles.card}>
              <Link href={`/services#${category.slug}`} className={styles.cardLink}>
                <IconTile color={category.color} size={40}>
                  <Icon name={category.icon} />
                </IconTile>
                <span className={styles.cardName}>{category.name}</span>
                <ArrowRight className={styles.cardArrow} aria-hidden="true" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
