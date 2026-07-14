import { Icon } from "@/components/primitives/Icon";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getStages, getSystems } from "@/lib/content";
import styles from "./GrowthJourneySection.module.css";

/**
 * The Online Growth Journey — the 8 locked stages rendered as one connected
 * spectrum path, with the 3 cross-cutting systems shown running *across* the whole
 * journey (Growth Guide p.3). Server-rendered and fully static: the "connected"
 * feeling comes from the spectrum rail and numbered nodes, so there is nothing to
 * animate and nothing to break under `prefers-reduced-motion`.
 *
 * Theme: dark. Marked up as an ordered list so the sequence is conveyed to assistive
 * tech, not only by colour.
 */
export async function GrowthJourneySection({ anchorId }: { anchorId?: string }) {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);
  if (stages.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="growth-journey-heading"
    >
      <div className="iw-container iw-container--wide">
        <SectionHeader
          id="growth-journey-heading"
          eyebrow="The Online Growth Journey"
          title={
            <>
              Eight stages, <span className="iw-gradient-text">one connected path</span>
            </>
          }
          intro="Every business moves through the same journey — even if a single project only touches one or two stages at a time. Seeing the whole path is what tells you where to start, and what can wait."
          align="center"
        />

        <div className={styles.rail} role="presentation">
          <span className={styles.spectrum} aria-hidden="true" />
          <ol className={styles.stages}>
            {stages.map((stage) => (
              <li
                key={stage.slug}
                className={styles.stage}
                style={{ ["--stage" as string]: stage.color }}
              >
                <div className={styles.node}>
                  <span className={styles.order} aria-hidden="true">
                    {stage.order}
                  </span>
                  <span className={styles.stageIcon}>
                    <Icon name={stage.icon} />
                  </span>
                </div>
                <h3 className={styles.stageName}>{stage.name}</h3>
                <p className={styles.stageSummary}>{stage.summary}</p>
                <p className={styles.stageOutcome}>
                  <span className={styles.outcomeLabel}>Outcome</span>
                  {stage.outcome}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {systems.length > 0 && (
          <div className={styles.systems}>
            <p className={styles.systemsLead}>
              <span className={styles.systemsLeadAccent}>Three systems run across every stage</span>{" "}
              — not bolted on at the end, but built into the journey from the start.
            </p>
            <ul className={styles.systemGrid}>
              {systems.map((system) => (
                <li
                  key={system.key}
                  className={styles.system}
                  style={{ ["--stage" as string]: system.color }}
                >
                  <span className={styles.systemIcon}>
                    <Icon name={system.icon} />
                  </span>
                  <div>
                    <h4 className={styles.systemName}>{system.name}</h4>
                    <p className={styles.systemDesc}>{system.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
