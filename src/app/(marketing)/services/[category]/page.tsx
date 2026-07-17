import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDeliveryModels, getGoals, getServiceCategories, getServices } from "@/lib/content";
import styles from "./category.module.css";

/**
 * /services/[category] — a single service category, given room to be its own page.
 *
 * Phase 4: /services was one 14k-px wall of sixteen stacked category sections; each is
 * now its own route. The individual services fold in here as anchored blocks (id=<slug>)
 * rather than seventy thin standalone pages — so the old /services/<service> URLs 301 to
 * /services/<category>#<service> and land on the exact block. No new copy: every field
 * comes from service-categories.ts and services.ts.
 */
export async function generateStaticParams() {
  const categories = await getServiceCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await getServiceCategories()).find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  return pageMetadata({
    title: category.name,
    description: category.intro,
    path: `/services/${category.slug}`,
  });
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [categories, services, deliveryModels, goals] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getDeliveryModels(),
    getGoals(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const items = services.filter((s) => s.categorySlug === category.slug);
  const deliveryByKey = new Map(deliveryModels.map((d) => [d.key, d] as const));

  // Internal-linking preserved at the category level: the goals every service here helps
  // with, de-duplicated, so the ranking signal points at one strong page instead of many.
  const goalSlugs = [...new Set(items.flatMap((s) => s.goalSlugs))];
  const relatedGoals = goalSlugs
    .map((gs) => goals.find((g) => g.slug === gs))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ name: g.title, href: `/goals/${g.slug}`, hint: g.outcome }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: category.name, path: `/services/${category.slug}` },
        ])}
      />
      {items.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            category.name,
            items.map((s) => ({ name: s.name, path: `/services/${category.slug}#${s.slug}` })),
          )}
        />
      )}

      <PageHero
        eyebrow="Services"
        title={category.name}
        intro={category.intro}
        breadcrumbs={[{ name: "Services", path: "/services" }, { name: category.name }]}
        accent={category.color}
        aside={
          // Outline, not filled: the H1 must own the brightest value in the hero — the tile
          // is a quiet category marker, not a second bloom competing with the headline.
          <IconTile color={category.color} variant="outline" size={72}>
            <Icon name={category.icon} />
          </IconTile>
        }
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section
        className="theme-band iw-section"
        aria-labelledby="whats-included"
        style={{ ["--cat-accent" as string]: category.color }}
      >
        <div className="iw-container">
          <h2 id="whats-included" className={styles.sectionTitle}>
            What&rsquo;s included
          </h2>

          <ul className={styles.list}>
            {items.map((service) => {
              const delivery = deliveryByKey.get(service.deliveryModel);
              return (
                <li key={service.slug} id={service.slug} className={styles.item}>
                  <div className={styles.itemHead}>
                    <h3 className={styles.itemName}>{service.name}</h3>
                    {delivery && (
                      <Badge color={DELIVERY_COLOR[delivery.key]}>{delivery.name}</Badge>
                    )}
                  </div>

                  <p className={styles.itemLead}>{service.plainDescription}</p>

                  <ul className={styles.checklist}>
                    {service.whatYouGet.map((point) => (
                      <li key={point} className={styles.checkItem}>
                        <Check className={styles.checkIcon} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {service.exampleTools.length > 0 && (
                    <ul className={styles.chips} aria-label="Tools we can connect">
                      {service.exampleTools.map((tool) => (
                        <li key={tool} className={styles.chip}>
                          {tool}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {relatedGoals.length > 0 && (
            <div className={styles.goals}>
              <RelatedLinks title="Goals these services help with" links={relatedGoals} columns={2} />
            </div>
          )}
        </div>
      </section>

      <section className="theme-dark iw-section iw-section--tight" aria-label="Next steps">
        <div className="iw-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Not sure which of these you need first?</h2>
            <p className={styles.ctaBody}>
              That&apos;s the point of a plan. Tell us your goals and we&apos;ll map the smallest next
              step, then the ones that follow — in the right order, around what you already have.
            </p>
            <div className={styles.ctaActions}>
              <Button href="/growth-plan" variant="primary">
                Build My Digital Growth Plan
              </Button>
              <Button href="/services" variant="secondary">
                All service categories
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
