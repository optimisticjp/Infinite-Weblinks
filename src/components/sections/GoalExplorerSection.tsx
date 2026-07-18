import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { GoalScene } from "@/components/viz/GoalScene";
import { Reveal } from "@/components/motion/Reveal";
import { getGoals } from "@/lib/content";
import styles from "./GoalExplorerSection.module.css";

/**
 * GoalExplorerSection — router #1, "Explore by goal" (theme-dark, ref 10).
 *
 * Educate-before-sell: visitors pick the outcome they want, not a product feature.
 * One large featured goal owns the section's single glow; the rest are compact cards
 * that each route straight into a plan built around that goal. The full facts live on
 * /goals/<slug> — the homepage summarises and routes.
 */
export async function GoalExplorerSection({ anchorId }: { anchorId?: string }) {
  const goals = await getGoals();
  if (goals.length === 0) return null;

  const [featured, ...rest] = goals;
  const num = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section
      id={anchorId}
      className="theme-dark iw-section"
      aria-labelledby="goal-explorer-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="goal-explorer-heading"
          eyebrow="Explore by goal"
          title="What do you want to achieve right now?"
          intro="Pick the outcome closest to yours and we'll show you the path, tools and services that get you there — starting from a goal, never a feature list."
          aside={
            <Button href="/goals" variant="secondary" size="sm">
              See all goals
            </Button>
          }
        />

        <div className={styles.grid}>
          <Link
            href={`/growth-plan?goal=${featured.slug}`}
            className={styles.featured}
            style={{ ["--accent" as string]: featured.color }}
          >
            <span className={styles.featuredGlow} aria-hidden="true" />
            <span className={styles.cardTop}>
              <span className={styles.index} aria-hidden="true">
                {num(0)}
              </span>
              <span className={styles.featuredTag}>
                <Star aria-hidden="true" size={13} />
                Featured
              </span>
            </span>
            <GoalScene icon={featured.icon} color={featured.color} size="featured" />
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            <p className={styles.featuredOutcome}>{featured.outcome}</p>
            <span className={styles.featuredCta}>
              Build a plan for this goal
              <ArrowRight aria-hidden="true" size={18} />
            </span>
          </Link>

          <ul className={styles.rest}>
            {rest.map((g, i) => (
              <Reveal
                as="li"
                key={g.slug}
                className={styles.card}
                delay={Math.min(i, 5) * 55}
                style={{ ["--accent" as string]: g.color }}
              >
                <Link href={`/growth-plan?goal=${g.slug}`} className={styles.cardLink}>
                  <span className={styles.cardTop}>
                    <span className={styles.index} aria-hidden="true">
                      {num(i + 1)}
                    </span>
                    <ArrowRight className={styles.cardArrow} aria-hidden="true" size={18} />
                  </span>
                  <GoalScene icon={g.icon} color={g.color} size="compact" />
                  <h3 className={styles.title}>{g.title}</h3>
                  <p className={styles.outcome}>{g.outcome}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className={styles.helper}>
          <p className={styles.helperText}>Not sure which goal fits? We&apos;ll help you work it out.</p>
          <Button
            href="/growth-plan"
            variant="primary"
            size="md"
            iconRight={<ArrowRight aria-hidden="true" size={18} />}
          >
            Build My Custom Growth Plan
          </Button>
        </div>
      </div>
    </section>
  );
}
