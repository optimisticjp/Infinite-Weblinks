import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getStages, getStartingPoints } from "@/lib/content";
import styles from "./StartingPointSelectorSection.module.css";

/**
 * StartingPointSelectorSection — "Where are you now?" (theme-band).
 *
 * A plain accessible list of situations (most brands recognise themselves in more
 * than one row, and that's normal). Every row is fully readable and its CTA is a
 * real link — nothing here depends on JavaScript or hover.
 */
export async function StartingPointSelectorSection({ anchorId }: { anchorId?: string }) {
  const [startingPoints, stages] = await Promise.all([getStartingPoints(), getStages()]);
  if (startingPoints.length === 0) return null;

  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section ${styles.section}`}
      aria-labelledby="starting-point-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="starting-point-heading"
          eyebrow="Where are you now?"
          title="Find the row that sounds like you"
          intro="There's no wrong answer here, and most businesses fit more than one. Whichever sounds closest is where we'd start."
        />

        <ul className={styles.list}>
          {startingPoints.map((sp) => {
            const stage = stageBySlug.get(sp.recommendedStageSlug);
            return (
              <li key={sp.slug} className={styles.row} style={{ ["--accent" as string]: sp.color }}>
                <div className={styles.rowIcon}>
                  <IconTile color={sp.color} variant="filled" size={48}>
                    <Icon name={sp.icon} />
                  </IconTile>
                </div>
                <div className={styles.rowBody}>
                  <h3 className={styles.label}>{sp.label}</h3>
                  <p className={styles.situation}>{sp.situation}</p>
                  <p className={styles.recommendation}>{sp.recommendation}</p>
                  {stage && (
                    <Badge color={sp.color} className={styles.stageBadge}>
                      Start at: {stage.name}
                    </Badge>
                  )}
                </div>
                <div className={styles.rowCta}>
                  <Button
                    href={sp.cta.route}
                    variant={sp.cta.style}
                    size="sm"
                    iconRight={<ArrowRight aria-hidden="true" size={16} />}
                  >
                    {sp.cta.label}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
