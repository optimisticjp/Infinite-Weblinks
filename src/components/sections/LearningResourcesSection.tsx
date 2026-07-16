import Link from "next/link";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getLearnArticles } from "@/lib/content";
import styles from "./LearningResourcesSection.module.css";

const PREVIEW_COUNT = 3;

/**
 * LearningResourcesSection (theme-band) — a homepage preview of the Learn hub.
 * Renders nothing until at least one article is verified/ready to publish.
 */
export async function LearningResourcesSection({ anchorId }: { anchorId?: string }) {
  const articles = await getLearnArticles();
  if (articles.length === 0) return null;

  const preview = articles.slice(0, PREVIEW_COUNT);

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section iw-section--tight ${styles.section}`}
      aria-labelledby="learn-heading"
    >
      <div className="iw-container">
        <SectionHeader
          eyebrow="Learn"
          id="learn-heading"
          title="Plain-English guides, before any sales pitch"
          intro="Short reads that explain what things are, why they matter, and what to do about them."
        />

        <ul className={styles.grid}>
          {preview.map((article) => (
            <li key={article.slug} className={styles.card}>
              <h3 className={styles.title}>
                <Link href={`/learn/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className={styles.excerpt}>{article.excerpt}</p>
              {typeof article.readMinutes === "number" && (
                <p className={styles.meta}>{article.readMinutes} min read</p>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Button href="/learn" variant="secondary">
            Visit the Learn hub
          </Button>
        </div>
      </div>
    </section>
  );
}
