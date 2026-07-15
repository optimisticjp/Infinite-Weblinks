import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getExamples } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Examples",
  description: "Examples of the kind of work we do and the outcomes it's built to produce.",
  path: "/examples",
});

export default async function ExamplesIndexPage() {
  const examples = await getExamples();
  // Proof stays hidden until Verified / Ready to Publish — 404 while nothing is published.
  if (examples.length === 0) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Examples", path: "/examples" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          "Examples",
          examples.map((e) => ({ name: e.title, path: `/examples/${e.slug}` })),
        )}
      />

      <PageHero
        eyebrow="Proof"
        title="Examples"
        intro="A look at the kind of work we do and the outcomes it's built to produce."
        breadcrumbs={[{ name: "Examples" }]}
      />

      <section className="theme-band iw-section" aria-labelledby="ex-index-heading">
        <div className="iw-container">
          <h2 id="ex-index-heading" className="iw-visually-hidden">
            All examples
          </h2>
          <HubGrid>
            {examples.map((ex) => (
              <HubGridItem key={ex.slug}>
                <IndexCard
                  href={`/examples/${ex.slug}`}
                  title={ex.title}
                  description={ex.summary}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>
    </>
  );
}
