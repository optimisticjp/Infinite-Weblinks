import type { CSSProperties } from "react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./GrowthJourneyList.module.css";

export type GrowthJourneyStage = {
  /** The stage's position in the journey (1-based). */
  order: number;
  /** The stage slug — becomes the item's deep-link id. */
  slug: string;
  name: string;
  summary: string;
  whatHappens: string;
  outcome: string;
  icon: string;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
};

/**
 * GrowthJourneyList — the eight-stage growth journey as a semantic ordered list, for the
 * /how-it-works explainer. Each item carries its real stage slug as its id (the mega-menu's
 * deep-link target) with scroll-margin to clear the sticky header, a compact "Stage N" label, a
 * flat IconTile, an H3 stage name, the stage's summary and "what happens", and its intended
 * outcome — clearly labelled as the kind of result the stage is built for, never a guaranteed
 * one. Every field is verbatim seed content. It is a calm vertical reading sequence: no buttons,
 * no aria-pressed, no selected stage, no client panel hiding seven stages, no horizontal
 * scroller, carousel, NodeOrb, StageTimeline, animated connector, completion state, percentage or
 * duration — and it implies no requirement that a project run all eight. Understandable with CSS
 * disabled. Server Component.
 */
export function GrowthJourneyList({ stages }: { stages: GrowthJourneyStage[] }) {
  return (
    <ol className={styles.list}>
      {stages.map((stage) => {
        const ink = domainInk(stage.tone);
        return (
          <li
            key={stage.slug}
            id={stage.slug}
            className={styles.stage}
            style={{ ["--stage-ink" as string]: ink } as CSSProperties}
          >
            <div className={styles.head}>
              <span className={styles.marker}>Stage {stage.order}</span>
              <IconTile color={ink} size="md">
                <Icon name={stage.icon} />
              </IconTile>
            </div>
            <h3 className={styles.name}>{stage.name}</h3>
            <p className={styles.summary}>{stage.summary}</p>
            <p className={styles.whatHappens}>{stage.whatHappens}</p>
            <div className={styles.outcome}>
              <span className={styles.outcomeLabel}>Intended outcome</span>
              <p className={styles.outcomeText}>{stage.outcome}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
