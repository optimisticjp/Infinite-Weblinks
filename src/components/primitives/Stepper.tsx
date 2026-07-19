import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

type StepperProps = {
  steps: string[];
  /** 0-based index of the current step. */
  current: number;
  ariaLabel?: string;
  className?: string;
};

/**
 * Stepper — a horizontal numbered progress indicator. Completed steps show a check, the
 * current step is highlighted (and marked `aria-current="step"`), and every step carries a
 * visually-hidden status ("completed" / "current step" / "not started") so screen readers
 * get the full picture. On mobile it collapses to a compact dotted row that keeps only the
 * current step's label. Reusable across any multi-step flow.
 */
export function Stepper({ steps, current, ariaLabel = "Progress", className }: StepperProps) {
  return (
    <ol className={[styles.stepper, className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "pending";
        return (
          <li
            key={label}
            className={`${styles.step} ${styles[state]}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className={styles.node} aria-hidden="true">
              {state === "done" ? <Check size={15} strokeWidth={3} /> : i + 1}
            </span>
            <span className={styles.label}>
              <span className={styles.stepNum}>Step {i + 1}</span>
              <span className={styles.stepName}>{label}</span>
            </span>
            <span className="iw-visually-hidden">
              {state === "done"
                ? "completed"
                : state === "current"
                  ? "current step"
                  : "not started"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
