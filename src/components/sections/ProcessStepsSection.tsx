import { Icon } from "@/components/primitives/Icon";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getProcessSteps } from "@/lib/content";
import styles from "./ProcessStepsSection.module.css";

/** Colour cycle for the rail — ProcessStep carries no colour of its own. */
const PALETTE = [
  "var(--violet)",
  "var(--cyan)",
  "var(--pink)",
  "var(--orange)",
  "var(--lime)",
  "var(--blue)",
  "var(--violet-bright)",
  "var(--violet-deep)",
];

/**
 * ProcessStepsSection — the connected process, as a numbered rail (theme-band).
 * A single vertical spine with numbered nodes, not a grid of equal cards — the
 * layout itself communicates that the steps are one sequence, not independent
 * options.
 */
export async function ProcessStepsSection({ anchorId }: { anchorId?: string }) {
  const steps = await getProcessSteps();
  if (steps.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section ${styles.section}`}
      aria-labelledby="process-steps-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="process-steps-heading"
          eyebrow="How we work"
          title="One connected process, start to finish"
          intro="The same sequence runs behind every project, whether it covers one stage or the whole journey."
        />

        <ol className={styles.rail}>
          {steps.map((step, i) => {
            const color = PALETTE[i % PALETTE.length];
            return (
              <li
                key={step.order}
                className={styles.step}
                style={{ ["--accent" as string]: color }}
              >
                <div className={styles.marker}>
                  <span className={styles.markerNumber}>{step.order}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.iconTile}>
                    <Icon name={step.icon} />
                  </div>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
