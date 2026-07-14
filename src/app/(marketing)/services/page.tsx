import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { IndexCard } from "@/components/routes/IndexCard";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDeliveryModels, getServiceCategories, getServices } from "@/lib/content";
import styles from "./services.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Everything Infinite Weblinks can build and run for you, grouped by the way you actually need it. Every service is tagged with the delivery model behind it, so it's always clear who's doing the work.",
  path: "/services",
});

export default async function ServicesIndexPage() {
  const [categories, services, deliveryModels] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getDeliveryModels(),
  ]);

  const deliveryNameByKey = new Map(deliveryModels.map((d) => [d.key, d.name] as const));

  const grouped = categories
    .map((category) => ({
      category,
      items: services.filter((s) => s.categorySlug === category.slug),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Services",
          services.map((s) => ({ name: s.name, path: `/services/${s.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHero
        eyebrow="Services"
        title="What we can build and run for you"
        intro="Every service is tagged with the delivery model behind it, so you always know who's doing the work — us in-house, a vetted specialist, a fully managed setup, or something we hand over to your team. Pick a category, or build a plan and we'll sequence the right ones for you."
        breadcrumbs={[{ name: "Services" }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      {grouped.map(({ category, items }, i) => {
        const theme = i % 2 === 0 ? "theme-band" : "theme-dark";
        const headingId = `cat-${category.slug}`;
        return (
          <section
            key={category.slug}
            id={category.slug}
            className={`${theme} iw-section ${styles.catSection}`}
            aria-labelledby={headingId}
          >
            <div className="iw-container">
              <div className={styles.catHead}>
                <IconTile color={category.color} variant="filled" size={52}>
                  <Icon name={category.icon} />
                </IconTile>
                <div className={styles.catHeadText}>
                  <h2 id={headingId} className={styles.catName}>
                    {category.name}
                  </h2>
                  <p className={styles.catIntro}>{category.intro}</p>
                </div>
              </div>

              <ul className={styles.grid}>
                {items.map((service) => (
                  <li key={service.slug}>
                    <IndexCard
                      href={`/services/${service.slug}`}
                      title={service.name}
                      description={service.plainDescription}
                      color={category.color}
                      badge={
                        <Badge color={DELIVERY_COLOR[service.deliveryModel]}>
                          {deliveryNameByKey.get(service.deliveryModel) ?? service.deliveryModel}
                        </Badge>
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="theme-dark iw-section" aria-label="Next steps">
        <div className="iw-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Not sure which services you need first?</h2>
            <p className={styles.ctaBody}>
              That&apos;s the point of a plan. Tell us your goals and we&apos;ll map the smallest next step,
              then the ones that follow — in the right order, around what you already have.
            </p>
            <div className={styles.ctaActions}>
              <Button href="/growth-plan" variant="primary">
                Build My Digital Growth Plan
              </Button>
              <Button href="/how-it-works" variant="secondary">
                See how it all works
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
