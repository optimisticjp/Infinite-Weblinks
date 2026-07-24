import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamplesIndex } from "@/components/routes/ExamplesIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListJsonLd } from "@/lib/seo/jsonld";
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
      {/* The single Home → Examples BreadcrumbList is emitted by the PageHeader's Breadcrumbs
          (inside ExamplesIndex); the page adds only the ItemList of the published examples. */}
      <JsonLd
        data={itemListJsonLd(
          "Examples",
          examples.map((e) => ({ name: e.title, path: `/examples/${e.slug}` })),
        )}
      />
      <ExamplesIndex examples={examples} />
    </>
  );
}
