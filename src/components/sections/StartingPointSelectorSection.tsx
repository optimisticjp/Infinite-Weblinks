import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getStages, getStartingPoints } from "@/lib/content";
import styles from "./StartingPointSelectorSection.module.css";

/**
 * StartingPointSelectorSection — "Where are you right now?" (theme-band-bright, ref 08).
 *
 * A daylight spectrum of situations: numbered, ring-lit nodes threaded by a connection
 * line, each one a real link into a plan built around that starting point. Static and
 * links-based — nothing here depends on JavaScript or hover, and every node is keyboard
 * operable because it is an anchor. Most brands recognise themselves in more than one row,
 * and that's normal.
 */
export async function StartingPointSelectorSection({ anchorId }: { anchorId?: string }) {
  const [startingPoints, stages] = await Promise.all([getStartingPoints(), getStages()]);
  if (startingPoints.length === 0) return null;

  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));

  return (
    <section
      id={anchorId}
      className={`theme-band-bright iw-section ${styles.section}`}
      aria-labelledby="starting-point-heading"
    >
      <div className="iw-container iw-container--wide">
        <SectionHeader
          id="starting-point-heading"
          eyebrow="Where are you now?"
          title="Where are you right now?"
          intro="Choose the point that sounds most like your business. Whichever is closest is where we'd start — there's no wrong answer."
        />

        <div className={styles.rail}>
          <span className={styles.spectrum} aria-hidden="true" />
          <ol className={styles.points} aria-label="Starting points, from just an idea through to automation">
            {startingPoints.map((sp, i) => {
              const stage = stageBySlug.get(sp.recommendedStageSlug);
              return (
                <li key={sp.slug} className={styles.point} style={{ ["--accent" as string]: sp.color }}>
                  <Link href={sp.cta.route} className={styles.pointLink}>
                    <span className={styles.node} aria-hidden="true">
                      <Icon name={sp.icon} />
                    </span>
                    <span className={styles.label}>
                      <span className={styles.order} aria-hidden="true">
                        {i + 1}.
                      </span>
                      {sp.label}
                    </span>
                    <span className={styles.situation}>{sp.situation}</span>
                    {stage && (
                      <Badge color={sp.color} className={styles.stageBadge}>
                        Start at: {stage.name}
                      </Badge>
                    )}
                    <span className={styles.go}>
                      See the plan
                      <ArrowRight aria-hidden="true" size={15} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaText}>Fit more than one? Start where it counts and we&apos;ll map the rest.</p>
          <Button
            href="/growth-plan"
            variant="primary"
            size="lg"
            iconRight={<ArrowRight aria-hidden="true" size={18} />}
          >
            Build My Digital Growth Plan
          </Button>
        </div>
      </div>
    </section>
  );
}
