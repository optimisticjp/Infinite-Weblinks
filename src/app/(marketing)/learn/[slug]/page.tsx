import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
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
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, goals] = await Promise.all([getLearnArticle(slug), getGoals()]);
  if (!article) notFound();

  const relatedGoals = (article.relatedGoalSlugs ?? [])
    .map((s) => goals.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ name: g.title, href: `/goals/${g.slug}`, hint: g.outcome }));

  return (
    <>
      <JsonLd
        data={articleJsonLd({
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

      <PageHero
        eyebrow="Learn"
        title={article.title}
        intro={article.excerpt}
        breadcrumbs={[{ name: "Learn", path: "/learn" }, { name: article.title }]}
        aside={
          (article.readMinutes || article.publishedAt) && (
            <div className={styles.meta}>
              {article.readMinutes && (
                <span className={styles.metaItem}>
                  <Clock className={styles.metaIcon} aria-hidden="true" />
                  {article.readMinutes} min read
                </span>
              )}
              {article.publishedAt && (
                <time className={styles.metaItem} dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              )}
            </div>
          )
        }
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="article-body-heading">
        <div className="iw-container">
          <h2 id="article-body-heading" className="iw-visually-hidden">
            {article.title}
          </h2>
          <article className={styles.prose}>
            {article.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </article>

          {relatedGoals.length > 0 && (
            <div className={styles.related}>
              <RelatedLinks title="Related goals" links={relatedGoals} columns={2} />
            </div>
          )}

          <div className={styles.closing}>
            <p className={styles.closingText}>
              Want this mapped to your own situation? We&apos;ll turn it into a clear, tailored plan.
            </p>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
