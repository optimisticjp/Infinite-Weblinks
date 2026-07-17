import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { getConnectedExamples } from "@/lib/content";
import styles from "./ConnectedExamplesSection.module.css";

/**
 * "See what works together" (ref 16) — honest example combinations built around a clear
 * goal. Dark theme with a featured card that owns the brightest value; the rest are
 * ambient. Some cards render as daylight tiles (matching the reference mix), still
 * legible and glow-free. No results, metrics or client names — these describe what
 * connects, not what it delivered.
 */
export async function ConnectedExamplesSection({ anchorId }: { anchorId?: string }) {
  const examples = await getConnectedExamples();
  if (examples.length === 0) return null;

  const [featured, ...rest] = examples;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="examples-heading"
    >
      <div className="iw-container iw-container--wide">
        <div className={styles.head}>
          <div>
            <p className="iw-eyebrow">Connected growth examples</p>
            <h2 id="examples-heading" className={styles.heading}>
              See what works together.
            </h2>
          </div>
          <p className={`iw-lead ${styles.intro}`}>
            Results rarely come from one service alone. These are simple combinations, each built around a
            clear business goal — you can start with one and connect the rest as you grow.
          </p>
        </div>

        <ul className={styles.grid}>
          <li
            className={`${styles.card} ${styles.featured}`}
            style={{ ["--accent" as string]: featured.color }}
          >
            <p className={styles.goalHint}>Featured · {featured.goalHint}</p>
            <h3 className={styles.cardTitle}>{featured.title}</h3>
            <p className={styles.cardSummary}>{featured.summary}</p>
            <ul className={styles.chips}>
              {featured.services.map((s) => (
                <li key={s} className={styles.chip}>
                  {s}
                </li>
              ))}
            </ul>
            <span className={styles.seeHow}>
              See how it works <ArrowUpRight aria-hidden="true" />
            </span>
          </li>

          {rest.map((ex) => (
            <li
              key={ex.slug}
              className={`${styles.card} ${ex.theme === "band" ? styles.light : ""}`}
              style={{ ["--accent" as string]: ex.color }}
            >
              <p className={styles.goalHint}>{ex.goalHint}</p>
              <h3 className={styles.cardTitle}>{ex.title}</h3>
              <p className={styles.cardSummary}>{ex.summary}</p>
              <ul className={styles.chips}>
                {ex.services.map((s) => (
                  <li key={s} className={styles.chip}>
                    {s}
                  </li>
                ))}
              </ul>
              <span className={styles.seeHow}>
                See how it works <ArrowUpRight aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <p className={styles.footerNote}>You do not need everything at once — start where it counts, connect the rest as you grow.</p>
          <Button href="/growth-plan" variant="primary" size="lg" iconRight={<ArrowRight aria-hidden="true" />}>
            Build My Prioritised Growth Plan
          </Button>
        </div>
      </div>
    </section>
  );
}
