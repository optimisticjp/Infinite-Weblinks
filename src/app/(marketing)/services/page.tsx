import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServiceCategories, getServices } from "@/lib/content";

/**
 * /services — a router, not a catalogue.
 *
 * Phase 4: this route used to stack all sixteen category sections and their seventy
 * services on one 14,000px URL, so the mega menu's category links all pointed ~11k px
 * down a wall. It's now the shape Phase 3 gave /goals: sixteen category cards, each a
 * real destination (/services/<category>). No new copy — names and intros come straight
 * from service-categories.ts.
 */
export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Everything Infinite Weblinks can build and run for you, grouped by the way you actually need it. Pick a category, or build a plan and we'll sequence the right ones for you.",
  path: "/services",
});

export default async function ServicesIndexPage() {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);
  const countByCategory = new Map<string, number>();
  for (const s of services) {
    countByCategory.set(s.categorySlug, (countByCategory.get(s.categorySlug) ?? 0) + 1);
  }

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
        eyebrow="Services"
        title="What we can build and run for you"
        intro="Sixteen areas of work, grouped the way you actually need them. Every service is tagged with the delivery model behind it, so you always know who's doing the work. Pick a category, or build a plan and we'll sequence the right ones for you."
        breadcrumbs={[{ name: "Services" }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-dark iw-section iw-section--tight" aria-labelledby="service-categories">
        <div className="iw-container">
          <h2 id="service-categories" className="iw-visually-hidden">
            Service categories
          </h2>
          {/* A router routes: compact name + count cards, not described catalogue entries.
              Sixteen described cards plus the shared hero and footer can't fit under 2,000px,
              and the intro copy belongs on each category page anyway. 13rem keeps four across
              down to tablet, so the grid stays four rows instead of six. */}
          <HubGrid center min="13rem">
            {categories.map((category) => {
              const count = countByCategory.get(category.slug) ?? 0;
              return (
                <HubGridItem key={category.slug}>
                  <IndexCard
                    href={`/services/${category.slug}`}
                    title={category.name}
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

    </>
  );
}
