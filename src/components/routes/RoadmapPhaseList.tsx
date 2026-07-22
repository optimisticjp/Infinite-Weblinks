import { LinkChip } from "@/components/primitives/LinkChip";
import styles from "./RoadmapPhaseList.module.css";

/** A single resolved phase for the roadmap detail sequence. */
export type RoadmapPhaseItem = {
  /** Stable anchor id (e.g. "phase-1"). */
  id: string;
  /** 1-based sequence number. */
  number: number;
  title: string;
  summary: string;
  /** Resolved stage (linked when present). */
  stage?: { slug: string; name: string; tone?: string } | null;
  /** Resolved services (linked to their category anchor). */
  services: { slug: string; categorySlug: string; name: string }[];
  /** Resolved goals (linked to their goal page). */
  goals: { slug: string; title: string }[];
};

/**
 * RoadmapPhaseList — a roadmap-specific server component that renders the suggested phase
 * sequence as a semantic ordered list. Each phase keeps its stable anchor id, a compact
 * numbered marker (decorative — order is carried by the list semantics, so it is not announced
 * twice), an H3 title, a summary, and LinkChips to its resolved stage, services and goals.
 *
 * A restrained vertical sequence with a neutral connector line — no node-orb, glow, gradient
 * connector, starfield, timeline illustration, sticky scroll-jacking, animated path drawing,
 * fixed viewport height, fake progress, completion percentages or invented durations. It is a
 * suggested sequence, not project progress, and it stays understandable with CSS disabled.
 */
export function RoadmapPhaseList({ phases }: { phases: RoadmapPhaseItem[] }) {
  return (
    <ol className={styles.list}>
      {phases.map((phase) => (
        <li key={phase.id} id={phase.id} className={styles.item}>
          <span className={styles.marker} aria-hidden="true">
            {String(phase.number).padStart(2, "0")}
          </span>
          <div className={styles.body}>
            <h3 className={styles.title}>{phase.title}</h3>
            <p className={styles.summary}>{phase.summary}</p>

            {phase.stage ? (
              <div className={styles.group}>
                <span className={styles.groupLabel}>Stage</span>
                <div className={styles.chips}>
                  <LinkChip href={`/how-it-works#${phase.stage.slug}`} tone={phase.stage.tone}>
                    {phase.stage.name}
                  </LinkChip>
                </div>
              </div>
            ) : null}

            {phase.services.length > 0 ? (
              <div className={styles.group}>
                <span className={styles.groupLabel}>Services in this phase</span>
                <div className={styles.chips}>
                  {phase.services.map((sv) => (
                    <LinkChip key={sv.slug} href={`/services/${sv.categorySlug}#${sv.slug}`}>
                      {sv.name}
                    </LinkChip>
                  ))}
                </div>
              </div>
            ) : null}

            {phase.goals.length > 0 ? (
              <div className={styles.group}>
                <span className={styles.groupLabel}>Goals this moves</span>
                <div className={styles.chips}>
                  {phase.goals.map((go) => (
                    <LinkChip key={go.slug} href={`/goals/${go.slug}`}>
                      {go.title}
                    </LinkChip>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
