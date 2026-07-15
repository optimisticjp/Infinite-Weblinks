import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Solutions by business type",
  description:
    "How we help different kinds of business grow online — ecommerce, creators, local and service businesses, B2B, software and more.",
  path: "/business-types",
});

export default async function BusinessTypesIndexPage() {
  const businessTypes = await getBusinessTypes();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Business types", path: "/business-types" },
        ])}
      />
      {businessTypes.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            "Business types",
            businessTypes.map((b) => ({ name: b.name, path: `/business-types/${b.slug}` })),
          )}
        />
      )}

      <PageHero
        eyebrow="By business type"
        title="Built around how your business actually works"
        intro="The right first step depends on what you're running. Pick the closest fit to see how the growth journey applies to you — and the goals and services that usually matter most."
        breadcrumbs={[{ name: "Business types" }]}
      />

      <section className="theme-band iw-section" aria-labelledby="bt-index-heading">
        <div className="iw-container">
          <h2 id="bt-index-heading" className="iw-visually-hidden">
            All business types
          </h2>
          <HubGrid>
            {businessTypes.map((type) => (
              <HubGridItem key={type.slug}>
                <IndexCard
                  href={`/business-types/${type.slug}`}
                  title={type.name}
                  description={type.summary}
                  icon={type.icon}
                  color={type.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>
    </>
  );
}
