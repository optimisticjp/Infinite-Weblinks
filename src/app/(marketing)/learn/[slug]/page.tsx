import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { ScrollThread } from "@/components/viz/ScrollThread";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getGoals, getLearnArticle, getLearnArticles } from "@/lib/content";
import styles from "./article.module.css";

const HUE = "var(--domain-discover)";

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
  const relatedGoal = article.relatedGoalSlugs?.map((s) => goalBySlug.get(s)).find(Boolean);
  const tag = relatedGoal ? relatedGoal.title : "Guide";

  // Up to three other guides, so the read ends with somewhere to go next.
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <ScrollThread hue={HUE} />
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

      <article className={styles.article} style={{ ["--hue" as string]: HUE }}>
        <header className={`theme-cosmic iw-section iw-section--tight ${styles.header}`}>
          <CosmicBackground />
          <div className={`iw-container ${styles.narrow} ${styles.headerInner}`}>
            <Breadcrumbs trail={[{ name: "Learn", path: "/learn" }, { name: article.title }]} />
            <p className={styles.eyebrow}>{tag}</p>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.meta}>
              {article.readMinutes ? (
                <span className={styles.metaItem}>
                  <Clock className={styles.metaIcon} aria-hidden="true" />
                  {article.readMinutes} min read
                </span>
              ) : null}
              <span className={styles.metaItem}>By Infinite Weblinks</span>
            </div>
          </div>
        </header>

        <div className={`theme-cosmic iw-section ${styles.body}`}>
          <div className={`iw-container ${styles.narrow}`}>
            <p className={styles.standfirst}>{article.excerpt}</p>
            <div className={styles.prose}>
              {article.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className={styles.byline}>
              <InfinityMark size={40} glow aria-hidden="true" />
              <span className={styles.bylineText}>
                <span className={styles.bylineName}>Infinite Weblinks</span>
                <span className={styles.bylineRole}>Your digital growth partner</span>
              </span>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <SectionShell
          id="related"
          eyebrow="Keep reading"
          title="More on connected growth"
          align="start"
        >
          <BentoGrid>
            {related.map((a) => {
              const g = a.relatedGoalSlugs?.map((s) => goalBySlug.get(s)).find(Boolean);
              const read = a.readMinutes ? `${a.readMinutes} min read` : "Guide";
              return (
                <BentoCard
                  key={a.slug}
                  href={`/learn/${a.slug}`}
                  hue={g ? g.color : HUE}
                  icon="book-open"
                  eyebrow={`${g ? g.title : "Guide"} · ${read}`}
                  title={a.title}
                  blurb={a.excerpt}
                  variant="medium"
                />
              );
            })}
          </BentoGrid>
        </SectionShell>
      ) : null}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
