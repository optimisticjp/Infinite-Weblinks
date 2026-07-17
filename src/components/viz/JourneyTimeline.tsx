import { Icon } from "@/components/primitives/Icon";
import styles from "./JourneyTimeline.module.css";

export type JourneyStep = {
  order: number | string;
  name: string;
  summary?: string;
  color: string;
  icon: string;
};
export type JourneyRail = {
  name: string;
  description: string;
  color: string;
  icon: string;
};

type JourneyTimelineProps = {
  steps: JourneyStep[];
  /** Cross-cutting rails that run beneath the whole journey (ref 05/17). */
  rails?: JourneyRail[];
  ariaLabel?: string;
  className?: string;
};

/**
 * JourneyTimeline — the connected numbered path (refs 05, 17). A full-spectrum line
 * threads the ordered nodes; the three optional rails run beneath to show the systems
 * that support every stage. Marked up as an ordered list so the sequence reaches assistive
 * tech, and horizontally scrollable inside its own container (never the page). Static —
 * nothing to break under reduced motion.
 */
export function JourneyTimeline({ steps, rails, ariaLabel, className }: JourneyTimelineProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.rail}>
        <span className={styles.spectrum} aria-hidden="true" />
        <ol className={styles.steps} tabIndex={0} aria-label={ariaLabel ?? "Connected journey stages"}>
          {steps.map((step) => (
            <li key={String(step.order)} className={styles.step} style={{ ["--step" as string]: step.color }}>
              <div className={styles.node}>
                <span className={styles.order} aria-hidden="true">
                  {step.order}
                </span>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Icon name={step.icon} />
                </span>
              </div>
              <h3 className={styles.stepName}>{step.name}</h3>
              {step.summary ? <p className={styles.stepSummary}>{step.summary}</p> : null}
            </li>
          ))}
        </ol>
      </div>

      {rails && rails.length > 0 ? (
        <ul className={styles.rails} aria-label="Systems that run across every stage">
          {rails.map((r) => (
            <li key={r.name} className={styles.railRow} style={{ ["--step" as string]: r.color }}>
              <span className={styles.railIcon} aria-hidden="true">
                <Icon name={r.icon} />
              </span>
              <span className={styles.railName}>{r.name}</span>
              <span className={styles.railTrack} aria-hidden="true" />
              <span className={styles.railDesc}>{r.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
