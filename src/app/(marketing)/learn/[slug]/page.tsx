import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { LinkChip } from "@/components/primitives/LinkChip";
import { ArticleMetaLine } from "@/components/routes/ArticleMetaLine";
import { Icon } from "@/components/primitives/Icon";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import { getGoals, getLearnArticle, getLearnArticles } from "@/lib/content";
import styles from "./article.module.css";

export async function generateStaticParams() {
  const articles = await getLearnArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getLearnArticle(slug);
  if (!article) return { title: "Article not found" };
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/learn/${article.slug}`,
    article: article.publishedAt ? { publishedTime: article.publishedAt } : {},
  });
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, articles, goals] = await Promise.all([
    getLearnArticle(slug),
    getLearnArticles(),
    getGoals(),
  ]);
  if (!article) notFound();

  const goalBySlug = new Map(goals.map((g) => [g.slug, g] as const));
  // All resolved related goals (not only the first); the first drives the header eyebrow/accent.
  const relatedGoals = (article.relatedGoalSlugs ?? [])
    .map((s) => goalBySlug.get(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const primaryGoal = relatedGoals[0];
  const eyebrow = primaryGoal ? primaryGoal.title : "Guide";
  const accent = domainInk(primaryGoal?.color ?? "var(--domain-discover)");

  // The current deterministic selection: up to three other guides in source order.
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={blogPostingJsonLd({
          title: article.title,
          description: article.excerpt,
          path: `/learn/${article.slug}`,
          datePublished: article.publishedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: article.title, path: `/learn/${article.slug}` },
        ])}
      />

      <article className={styles.article}>
        <PageHeader
          id="article-hero"
          spacing="compact"
          breadcrumbs={[{ name: "Learn", path: "/learn" }, { name: article.title }]}
          eyebrow={eyebrow}
          accent={accent}
          title={article.title}
          lead={article.excerpt}
          trustNote={<ArticleMetaLine readMinutes={article.readMinutes} publishedAt={article.publishedAt} />}
        />

        <section className={`theme-light iw-section ${styles.reading}`} aria-label="Article">
          <div className={`iw-container ${styles.narrow}`}>
            <div className={styles.prose}>
              {article.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <footer className={styles.byline}>
              <InfinityMark size={32} glow={false} className={styles.bylineMark} />
              <span className={styles.bylineText}>
                <span className={styles.bylineName}>Infinite Weblinks</span>
                <span className={styles.bylineRole}>Your digital growth partner</span>
              </span>
            </footer>
          </div>
        </section>
      </article>

      {relatedGoals.length > 0 || related.length > 0 ? (
        <SectionShell surface="alt" id="keep-going" eyebrow="Where next" title="Keep going" align="start">
          <div className={styles.keepGoing}>
            {relatedGoals.length > 0 ? (
              <RelationshipCard
                title="Put this guide into practice"
                description="The goals this guide relates to."
                icon={<Icon name="target" />}
                tone={primaryGoal?.color}
              >
                {relatedGoals.map((g) => (
                  <LinkChip key={g.slug} href={`/goals/${g.slug}`} tone={g.color}>
                    {g.title}
                  </LinkChip>
                ))}
              </RelationshipCard>
            ) : null}

            {related.length > 0 ? (
              <CardGrid layout="equal" aria-label="More guides">
                {related.map((a) => {
                  const g = a.relatedGoalSlugs?.map((s) => goalBySlug.get(s)).find(Boolean);
                  return (
                    <ArticleCard
                      key={a.slug}
                      href={`/learn/${a.slug}`}
                      title={a.title}
                      excerpt={a.excerpt}
                      goalLabel={g ? g.title : "Guide"}
                      goalTone={g ? g.color : "var(--domain-discover)"}
                      readingTime={a.readMinutes ? `${a.readMinutes} min read` : undefined}
                      icon="book-open"
                    />
                  );
                })}
              </CardGrid>
            ) : null}
          </div>
        </SectionShell>
      ) : null}

      <FinalCtaSection
        id="get-started"
        title="Turn the thinking into a plan"
        lead="Reading is a start — the next step is a plan built around your goals. We'll help you find the smallest useful first move. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/learn", label: "Back to the guides" }}
      />
    </>
  );
}
