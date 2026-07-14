import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { IndexCard } from "@/components/routes/IndexCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getLearnArticles } from "@/lib/content";
import styles from "./learn.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Learn",
  description:
    "Short, plain-English articles on how online growth fits together as one connected system — the reasoning behind the work, with no hype and no invented statistics.",
  path: "/learn",
});

export default async function LearnIndexPage() {
  const articles = await getLearnArticles();

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Learn",
          articles.map((a) => ({ name: a.title, path: `/learn/${a.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />

      <PageHero
        eyebrow="Learn"
        title="Understand how it all fits together"
        intro="Short reads on the thinking behind the work — how growth works as one connected system, how to choose the right first step, and what connected tools actually mean in practice. Educational first, no hard sell."
        breadcrumbs={[{ name: "Learn" }]}
      />

      <section className="theme-band iw-section" aria-label="Articles">
        <div className="iw-container">
          <ul className={styles.grid}>
            {articles.map((article) => (
              <li key={article.slug}>
                <IndexCard
                  href={`/learn/${article.slug}`}
                  title={article.title}
                  description={article.excerpt}
                  icon="book-open"
                  color="var(--cyan)"
                  footer={
                    article.readMinutes ? `${article.readMinutes} min read` : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
