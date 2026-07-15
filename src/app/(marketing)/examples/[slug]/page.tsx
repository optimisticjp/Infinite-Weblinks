import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProofDetail } from "@/components/routes/ProofDetail";
import { pageMetadata } from "@/lib/seo/metadata";
import { getExample, getExamples } from "@/lib/content";

/** Only Verified / Ready-to-Publish examples get a static page; everything else 404s. */
export async function generateStaticParams() {
  const examples = await getExamples();
  return examples.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const example = await getExample(slug);
  if (!example) return { title: "Example not found", robots: { index: false, follow: false } };
  return pageMetadata({
    title: example.title,
    description: example.summary,
    path: `/examples/${example.slug}`,
  });
}

export default async function ExampleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const example = await getExample(slug);
  if (!example) notFound();

  return (
    <ProofDetail
      collectionName="Examples"
      collectionPath="/examples"
      title={example.title}
      path={`/examples/${example.slug}`}
      summary={example.summary}
    />
  );
}
