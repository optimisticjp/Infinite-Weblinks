import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceDomainTemplate, type RelatedGoal } from "@/components/routes/ServiceDomainTemplate";
import { breadcrumbJsonLd, itemListJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getGoals, getServiceCategories, getServices, getStages } from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";

/**
 * /services/[category] — one service category, rendered by the shared V2 ServiceDomainTemplate.
 *
 * Every renderable category has a DomainConfig (proven by v2-service-domain-integrity), so the
 * template renders for every valid category and the old legacy PageHero fallback is gone. The
 * seventy individual services fold in as anchored ServiceOfferingCard blocks (id=<slug>); the old
 * /services/<service> URLs 308 to /services/<category>#<service> and land on the exact block. No
 * new copy: every field comes from service-categories.ts, services.ts and the domain config.
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
  const [categories, services, goals, stages] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getGoals(),
    getStages(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const config = getServiceDomainConfig(slug);
  // Every renderable category has a config (integrity invariant); a category without one is not a
  // real service area, so it 404s rather than falling back to a dead legacy presentation.
  if (!config) notFound();

  const items = services.filter((s) => s.categorySlug === category.slug);

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));
  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));
  const goalBySlug = new Map(goals.map((g) => [g.slug, g] as const));

  const activeStage = stageBySlug.get(config.stageSlug);
  const nextCategory = categoryBySlug.get(config.next.slug);
  // Both are integrity invariants; if either is missing the config is broken, so 404 rather than
  // render a page that lies about the journey.
  if (!activeStage || !nextCategory) notFound();

  // Internal-linking preserved at the category level: the goals every service here helps with,
  // de-duplicated and source-first, so the ranking signal points at one strong page.
  const relatedGoals: RelatedGoal[] = [...new Set(items.flatMap((s) => s.goalSlugs))]
    .map((gs) => goalBySlug.get(gs))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ slug: g.slug, title: g.title, outcome: g.outcome }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: category.name, path: `/services/${category.slug}` },
        ])}
      />
      {/* Service node: each category page is a real, provider-backed service offering. */}
      <JsonLd
        data={serviceJsonLd({
          name: category.name,
          description: category.intro,
          path: `/services/${category.slug}`,
        })}
      />
      {items.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            category.name,
            items.map((s) => ({ name: s.name, path: `/services/${category.slug}#${s.slug}` })),
          )}
        />
      )}

      <ServiceDomainTemplate
        config={config}
        category={category}
        services={items}
        activeStage={activeStage}
        nextCategory={nextCategory}
        relatedGoals={relatedGoals}
      />
    </>
  );
}
