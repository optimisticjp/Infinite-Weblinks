import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import styles from "./ProcessStepList.module.css";

export type ProcessStepItem = {
  order: number;
  title: string;
  description: string;
  icon: string;
};

/** One coherent V2 accent for the whole process (the step data carries no colour of its own) —
 *  no per-index legacy palette cycle. */
const PROCESS_INK = "var(--v2-brand-strong)";

/**
 * ProcessStepList — the agency's steady workflow as a semantic ordered list, in exact source
 * order. Each step has a compact visible number, a flat IconTile in one consistent V2 accent, an
 * H3 title and its exact description. A restrained vertical sequence with a neutral connector — no
 * per-index legacy colour cycle, theme-band, giant node, glow, gradient, fake progress, fixed
 * height, duration or completion percentage. Server Component.
 */
export function ProcessStepList({ steps }: { steps: ProcessStepItem[] }) {
  return (
    <ol className={styles.list}>
      {steps.map((step) => (
        <li key={step.order} className={styles.step}>
          <span className={styles.marker} aria-hidden="true">
            {String(step.order).padStart(2, "0")}
          </span>
          <div className={styles.body}>
            <span className={styles.head}>
              <IconTile color={PROCESS_INK} size="md">
                <Icon name={step.icon} />
              </IconTile>
              <h3 className={styles.title}>{step.title}</h3>
            </span>
            <p className={styles.description}>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
