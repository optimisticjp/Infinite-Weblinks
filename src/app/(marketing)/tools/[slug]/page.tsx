import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Card } from "@/components/primitives/Card";
import { Callout } from "@/components/primitives/Callout";
import { Chip } from "@/components/primitives/Chip";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Button } from "@/components/primitives/Button";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { LinkChip } from "@/components/primitives/LinkChip";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import {
  getBusinessTypes,
  getServiceCategories,
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

  // Resolve via maps rather than repeated array scans.
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));
  const toolByCategorySlug = new Map(tools.map((t) => [t.categorySlug, t] as const));
  const serviceBySlug = new Map(services.map((s) => [s.slug, s] as const));
  const serviceCategoryBySlug = new Map(serviceCategories.map((c) => [c.slug, c] as const));
  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));
  const businessTypeBySlug = new Map(businessTypes.map((b) => [b.slug, b] as const));

  const category = categoryBySlug.get(tool.categorySlug);
  const ink = domainInk(category?.color);
  const categoryLabel = category?.name ?? "Tool area";

  // Related service DOMAINS: related services → their unique categories → the domain pages.
  const relatedDomains = [
    ...new Set(
      tool.relatedServiceSlugs
        .map((s) => serviceBySlug.get(s)?.categorySlug)
        .filter((c): c is string => Boolean(c)),
    ),
  ]
    .map((cs) => serviceCategoryBySlug.get(cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  // connectsWith stores connected CATEGORY slugs → resolve each to the tool in that category.
  const connectsWith = tool.connectsWith
    .map((catSlug) => toolByCategorySlug.get(catSlug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t) && t!.slug !== tool.slug);

  const relatedStages = tool.stageSlugs
    .map((s) => stageBySlug.get(s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st));

  const suitsBusinessTypes = tool.suitsBusinessTypeSlugs
    .map((s) => businessTypeBySlug.get(s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const hasFits = connectsWith.length > 0 || relatedStages.length > 0 || suitsBusinessTypes.length > 0;

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

      <PageHeader
        id="tool-hero"
        breadcrumbs={[{ name: "Tools", path: "/tools" }, { name: tool.name }]}
        eyebrow={categoryLabel}
        accent={ink}
        title={tool.name}
        lead={tool.whatItDoes}
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#why" variant="secondary">
              Why it matters
            </Button>
          </>
        }
        trustNote="Accounts and billing stay in your name."
        aside={
          category ? (
            <Card variant="raised" accent={ink} className={styles.aside}>
              <IconTile color={ink} size="lg">
                <Icon name={category.icon} />
              </IconTile>
              <p className={styles.asideTitle}>{category.name}</p>
              <p className={styles.asideText}>{category.intro}</p>
            </Card>
          ) : undefined
        }
      />

      <SectionShell
        surface="alt"
        id="why"
        eyebrow="Why it matters"
        title="Why it's useful — and when it isn't"
        align="start"
      >
        <div className={styles.whyGrid}>
          <Card variant="raised" className={styles.whyCard}>
            <h3 className={styles.whyHeading}>Why it&apos;s useful</h3>
            <p className={styles.whyBody}>{tool.whyUseful}</p>
          </Card>
          <Callout tone="information" title="When you might not need this yet">
            {tool.whenNotNeeded}
          </Callout>
        </div>

        {tool.exampleTools.length > 0 ? (
          <div className={styles.examples}>
            <p className={styles.examplesLabel}>Example tools we can connect</p>
            <div className={styles.examplesChips}>
              {tool.exampleTools.map((example) => (
                <Chip key={example}>{example}</Chip>
              ))}
            </div>
            <p className={styles.examplesNote}>
              Examples only. This does not imply partnership or endorsement.
            </p>
          </div>
        ) : null}

        <Callout tone="neutral" title="Set up in your name" className={styles.ownership}>
          Whatever we set up here is created in your name, with billing under your control. The
          right stack depends on your size, budget and goals — not on which platform is trending.
        </Callout>
      </SectionShell>

      {relatedDomains.length > 0 ? (
        <SectionShell
          surface="light"
          id="domains"
          eyebrow="Where the work lives"
          title="The service domains this connects to"
          lead="Choosing and connecting tools is one part of the wider system. These are the domains this area feeds into."
          align="start"
        >
          <BentoGrid>
            {relatedDomains.map((cat) => (
              <BentoCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                hue={domainInk(cat.color)}
                icon={cat.icon}
                title={cat.name}
                blurb={cat.intro}
                variant="medium"
              />
            ))}
          </BentoGrid>
        </SectionShell>
      ) : null}

      {hasFits ? (
        <SectionShell
          surface="alt"
          id="fits"
          eyebrow="How it fits"
          title="Where it fits, and who it suits"
          align="start"
        >
          <CardGrid layout="equal" aria-label="Where this tool area fits">
            <RelationshipCard
              title="Connects with"
              description="Tool areas this joins up to cleanly."
              icon={<Icon name="link" />}
              tone={category?.color}
            >
              {connectsWith.map((t) => (
                <LinkChip key={t.slug} href={`/tools/${t.slug}`}>
                  {t.name}
                </LinkChip>
              ))}
            </RelationshipCard>

            <RelationshipCard
              title="Where it fits in the journey"
              description="The growth stage this area supports."
              icon={<Icon name="workflow" />}
              tone={category?.color}
            >
              {relatedStages.map((st) => (
                <LinkChip key={st.slug} href={`/how-it-works#${st.slug}`} tone={st.color}>
                  {st.name}
                </LinkChip>
              ))}
            </RelationshipCard>

            <RelationshipCard
              title="Suits these businesses"
              description="Kinds of business this area tends to suit."
              icon={<Icon name="users" />}
              tone={category?.color}
            >
              {suitsBusinessTypes.map((b) => (
                <LinkChip key={b.slug} href={`/business-types/${b.slug}`}>
                  {b.name}
                </LinkChip>
              ))}
            </RelationshipCard>
          </CardGrid>
        </SectionShell>
      ) : null}

      <FinalCtaSection
        id="get-started"
        title="Start with the smallest useful stack"
        lead="Tell us your goals and we'll help you choose the few tools worth connecting first — set up in your name. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/tools", label: "Browse the tool areas" }}
      />
    </>
  );
}
