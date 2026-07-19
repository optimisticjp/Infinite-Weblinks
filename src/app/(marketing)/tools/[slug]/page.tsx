import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info, Shield } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getBusinessTypes,
  getServiceCategories,
  getServices,
  getStages,
  getTool,
  getToolCategories,
  getTools,
} from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";
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
  const [tool, categories, tools, services, serviceCategories, stages, businessTypes] =
    await Promise.all([
      getTool(slug),
      getToolCategories(),
      getTools(),
      getServices(),
      getServiceCategories(),
      getStages(),
      getBusinessTypes(),
    ]);
  if (!tool) notFound();

  const category = categories.find((c) => c.slug === tool.categorySlug);
  const hue = category?.color ?? "var(--domain-build)";

  // Related service DOMAINS: resolve the related services, take their unique categories, and
  // link each to its domain page (in its hue).
  const relatedCategorySlugs = [
    ...new Set(
      tool.relatedServiceSlugs
        .map((s) => services.find((sv) => sv.slug === s)?.categorySlug)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  const relatedDomains = relatedCategorySlugs
    .map((cs) => serviceCategories.find((c) => c.slug === cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const connectsWith = tool.connectsWith
    .map((catSlug) => tools.find((t) => t.categorySlug === catSlug && t.slug !== tool.slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const relatedStages = tool.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st));

  const suitsBusinessTypes = tool.suitsBusinessTypeSlugs
    .map((s) => businessTypes.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: `${tool.name}: what it does and when you need it`,
          description: tool.whatItDoes,
          path: `/tools/${tool.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ])}
      />

      <CosmicPageHero
        id="tool-hero"
        breadcrumbs={[{ name: "Tools", path: "/tools" }, { name: tool.name }]}
        eyebrow={category ? category.name : "Tool"}
        hue={hue}
        title={tool.name}
        lead={tool.whatItDoes}
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#why" variant="ghost" size="lg">
              Why it matters
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={hue} size={128} emphasis="bright">
              <Icon name={category?.icon ?? "wrench"} />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="why"
        eyebrow="Why it matters"
        title="Why it's useful"
        align="start"
        contentClassName={undefined}
      >
        <div style={{ ["--hue" as string]: hue }}>
          <p className={styles.lead}>{tool.whyUseful}</p>

          <div className={styles.callout}>
            <Info className={styles.calloutIcon} size={20} aria-hidden="true" />
            <div>
              <p className={styles.calloutLabel}>When you might not need this yet</p>
              <p className={styles.calloutBody}>{tool.whenNotNeeded}</p>
            </div>
          </div>

          {tool.exampleTools.length > 0 ? (
            <div className={styles.chipsBlock}>
              <p className={styles.chipsLabel}>Example tools we can connect</p>
              <ul className={styles.chips} aria-label="Example tools we can connect">
                {tool.exampleTools.map((example) => (
                  <li key={example} className={styles.chip}>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.ownership}>
            <Shield className={styles.ownershipIcon} size={20} aria-hidden="true" />
            <p className={styles.ownershipText}>
              Whatever we set up here is created in your name, with billing under your control.
              The right stack depends on your size, budget and goals, not on which platform is
              trending.
            </p>
          </div>
        </div>
      </SectionShell>

      {relatedDomains.length > 0 ? (
        <SectionShell
          id="domains"
          eyebrow="Where the work lives"
          title="The service domains this connects to"
          lead="Choosing and connecting tools is one part of the wider system. These are the domains this area feeds into."
          align="start"
        >
          <BentoGrid>
            {relatedDomains.map((cat, i) => (
              <BentoCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                hue={getServiceDomainConfig(cat.slug)?.hue ?? cat.color}
                icon={cat.icon}
                title={cat.name}
                blurb={cat.intro}
                variant={i === 0 ? "featured" : "medium"}
              />
            ))}
          </BentoGrid>
        </SectionShell>
      ) : null}

      <SectionShell id="fits" eyebrow="How it fits" title="Where it fits, and who it suits" align="start">
        <div className={styles.facets}>
          {connectsWith.length > 0 ? (
            <div className={styles.facet}>
              <p className={styles.facetLabel}>Connects with</p>
              <ul className={styles.facetList}>
                {connectsWith.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className={styles.facetLink}>
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {relatedStages.length > 0 ? (
            <div className={styles.facet}>
              <p className={styles.facetLabel}>Where it fits in the journey</p>
              <ul className={styles.facetList}>
                {relatedStages.map((st) => (
                  <li key={st.slug}>
                    <Link href={`/how-it-works#${st.slug}`} className={styles.facetLink}>
                      {st.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {suitsBusinessTypes.length > 0 ? (
            <div className={styles.facet}>
              <p className={styles.facetLabel}>Suits</p>
              <ul className={styles.facetList}>
                {suitsBusinessTypes.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/business-types/${b.slug}`} className={styles.facetLink}>
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
