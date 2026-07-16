import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getBusinessTypes,
  getServices,
  getStages,
  getTool,
  getToolCategories,
  getTools,
} from "@/lib/content";
import styles from "./tool.module.css";

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return pageMetadata({
    title: tool.name,
    description: tool.whatItDoes,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tool, categories, tools, services, stages, businessTypes] = await Promise.all([
    getTool(slug),
    getToolCategories(),
    getTools(),
    getServices(),
    getStages(),
    getBusinessTypes(),
  ]);
  if (!tool) notFound();

  const category = categories.find((c) => c.slug === tool.categorySlug);

  // connectsWith holds tool-category slugs → resolve to the tool whose categorySlug matches.
  const connectsWith = tool.connectsWith
    .map((catSlug) => tools.find((t) => t.categorySlug === catSlug && t.slug !== tool.slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ name: t.name, href: `/tools/${t.slug}`, hint: t.whatItDoes }));

  const relatedServices = tool.relatedServiceSlugs
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => ({ name: sv.name, href: `/services/${sv.categorySlug}#${sv.slug}`, hint: sv.plainDescription }));

  const relatedStages = tool.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st))
    .map((st) => ({ name: st.name, href: `/how-it-works#${st.slug}`, hint: st.summary }));

  const suitsBusinessTypes = tool.suitsBusinessTypeSlugs
    .map((s) => businessTypes.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .map((b) => ({ name: b.name, href: `/business-types/${b.slug}`, hint: b.summary }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ])}
      />

      <PageHero
        eyebrow={category ? category.name : "Tool"}
        title={tool.name}
        intro={tool.whatItDoes}
        breadcrumbs={[
          { name: "Tools", path: "/tools" },
          ...(category ? [{ name: category.name, path: `/tools#${category.slug}` }] : []),
          { name: tool.name },
        ]}
        aside={
          <div className={styles.ownAside}>
            <p className={styles.ownTitle}>Always in your name</p>
            <p className={styles.ownBody}>
              We set tools up in your name and never lock them to us.
            </p>
          </div>
        }
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="tool-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 id="tool-body-heading" className={styles.h2}>
                Why it&apos;s useful
              </h2>
              <p className={styles.lead}>{tool.whyUseful}</p>

              <div className={styles.callout}>
                <Info className={styles.calloutIcon} aria-hidden="true" />
                <div>
                  <p className={styles.calloutLabel}>When you might not need this yet</p>
                  <p className={styles.calloutBody}>{tool.whenNotNeeded}</p>
                </div>
              </div>

              {tool.exampleTools.length > 0 && (
                <div className={styles.tools}>
                  <h3 className={styles.h3}>Example tools we can connect</h3>
                  <p className={styles.toolsNote}>
                    Example tools we can connect — set up in your name, never locked to us. The right
                    stack depends on your size, budget, and goals, not on which platform is trending.
                  </p>
                  <ul className={styles.chips}>
                    {tool.exampleTools.map((example) => (
                      <li key={example} className={styles.chip}>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className={styles.side}>
              <RelatedLinks title="Connects with" links={connectsWith} columns={1} />
              <RelatedLinks title="Related services" links={relatedServices} columns={1} />
              <RelatedLinks title="Where it fits" links={relatedStages} columns={1} />
              <RelatedLinks title="Suits" links={suitsBusinessTypes} columns={1} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
