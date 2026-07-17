import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getLearnArticles } from "@/lib/content";
import styles from "./LearningResourcesSection.module.css";

const PREVIEW_COUNT = 3;

/** Decorative glyph + accent per card slot — the articles carry no icon of their own. */
const GLYPHS = [
  { icon: "book-open", color: "var(--violet)" },
  { icon: "compass", color: "var(--cyan)" },
  { icon: "sparkles", color: "var(--orange)" },
];

/**
 * LearningResourcesSection — "Practical guides to help you grow" (theme-band, ref 11).
 * A homepage preview of the Learn hub: tidy daylight cards, a small coloured glyph, the
 * title, a plain blurb, and a "Read guide" affordance. Renders nothing until at least one
 * article is verified/ready to publish.
 */
export async function LearningResourcesSection({ anchorId }: { anchorId?: string }) {
  const articles = await getLearnArticles();
  if (articles.length === 0) return null;

  const preview = articles.slice(0, PREVIEW_COUNT);

  return (
    <section
      id={anchorId}
      className="theme-band iw-section iw-section--tight"
      aria-labelledby="learn-heading"
    >
      <div className="iw-container">
        <SectionHeader
          eyebrow="Learn"
          id="learn-heading"
          title="Practical guides to help you grow"
          intro="Short, plain-English reads that explain what things are, why they matter, and what to do about them — before any sales pitch."
          aside={
            <Button href="/learn" variant="secondary" size="sm">
              Visit the Learn hub
            </Button>
          }
        />

        <ul className={styles.grid}>
          {preview.map((article, i) => {
            const glyph = GLYPHS[i % GLYPHS.length];
            return (
              <li key={article.slug} className={styles.card}>
                <Link href={`/learn/${article.slug}`} className={styles.cardLink}>
                  <IconTile color={glyph.color} variant="outline" size={42}>
                    <Icon name={glyph.icon} />
                  </IconTile>
                  <h3 className={styles.title}>{article.title}</h3>
                  <p className={styles.excerpt}>{article.excerpt}</p>
                  {typeof article.readMinutes === "number" && (
                    <p className={styles.meta}>{article.readMinutes} min read</p>
                  )}
                  <span className={styles.readMore}>
                    Read guide
                    <ArrowRight aria-hidden="true" size={15} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
