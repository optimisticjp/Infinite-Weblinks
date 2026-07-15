import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProofDetail } from "@/components/routes/ProofDetail";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseStudies, getCaseStudy } from "@/lib/content";

/** Only Verified / Ready-to-Publish case studies get a static page; everything else 404s. */
export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) return { title: "Case study not found", robots: { index: false, follow: false } };
  return pageMetadata({
    title: caseStudy.title,
    description: caseStudy.summary,
    path: `/case-studies/${caseStudy.slug}`,
  });
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <ProofDetail
      collectionName="Case studies"
      collectionPath="/case-studies"
      title={caseStudy.title}
      path={`/case-studies/${caseStudy.slug}`}
      summary={caseStudy.summary}
      meta={caseStudy.client ? `Client — ${caseStudy.client}` : undefined}
    />
  );
}
