import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Case studies",
  description: "Real projects and the results they produced.",
  path: "/case-studies",
});

export default async function CaseStudiesIndexPage() {
  const caseStudies = await getCaseStudies();
  // Proof stays hidden until a record is Verified / Ready to Publish. With none published,
  // the whole section 404s rather than showing an empty shell or placeholder proof.
  if (caseStudies.length === 0) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          "Case studies",
          caseStudies.map((c) => ({ name: c.title, path: `/case-studies/${c.slug}` })),
        )}
      />

      <PageHero
        eyebrow="Proof"
        title="Case studies"
        intro="A closer look at projects we've delivered and what they achieved."
        breadcrumbs={[{ name: "Case studies" }]}
      />

      <section className="theme-band iw-section" aria-labelledby="cs-index-heading">
        <div className="iw-container">
          <h2 id="cs-index-heading" className="iw-visually-hidden">
            All case studies
          </h2>
          <HubGrid>
            {caseStudies.map((cs) => (
              <HubGridItem key={cs.slug}>
                <IndexCard
                  href={`/case-studies/${cs.slug}`}
                  title={cs.title}
                  description={cs.summary}
                  footer={cs.client}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>
    </>
  );
}
