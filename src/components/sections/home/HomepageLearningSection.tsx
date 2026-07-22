import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { getLearnArticles, getGoals } from "@/lib/content";
import styles from "./HomepageLearningSection.module.css";

const PREVIEW_COUNT = 3;

/**
 * HomepageLearningSection — the compact V2 Learn preview (id="learn", explicit V2 surface). The
 * first three renderable articles in current source order as ArticleCards, each with its real
 * related-goal label + mapped tone and real reading time, plus a CTA to /learn. No decorative
 * glyph assigned by array position, no featured first article, no invented date or author, no
 * theme-band, and it renders nothing when there are no articles. Server Component.
 */
export async function HomepageLearningSection({ surface = "alt" }: { surface?: "light" | "alt" }) {
  const [articles, goals] = await Promise.all([getLearnArticles(), getGoals()]);
  const preview = articles.slice(0, PREVIEW_COUNT);
  if (preview.length === 0) return null;

  const goalBySlug = new Map(goals.map((g) => [g.slug, g] as const));

  return (
    <SectionShell
      surface={surface}
      id="learn"
      eyebrow="Learn"
      title="Practical guides to help you grow"
      lead="Short, plain-English reads that explain what things are, why they matter, and what to do about them — before any sales pitch."
      align="start"
      spacing="tight"
    >
      <CardGrid layout="equal" aria-label="Recent guides">
        {preview.map((article) => {
          const goal = article.relatedGoalSlugs?.[0] ? goalBySlug.get(article.relatedGoalSlugs[0]) : undefined;
          return (
            <ArticleCard
              key={article.slug}
              href={`/learn/${article.slug}`}
              title={article.title}
              excerpt={article.excerpt}
              goalLabel={goal?.title ?? "Guide"}
              goalTone={goal?.color}
              readingTime={article.readMinutes ? `${article.readMinutes} min read` : undefined}
            />
          );
        })}
      </CardGrid>

      <div className={styles.cta}>
        <Button href="/learn" variant="secondary" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
          See all guides
        </Button>
      </div>
    </SectionShell>
  );
}
