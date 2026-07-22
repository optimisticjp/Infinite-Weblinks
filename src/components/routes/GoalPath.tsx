import type { CSSProperties } from "react";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./GoalPath.module.css";

type GoalPathProps = {
  /** Verbatim "what you need" text from the goal. */
  need: string;
  /** Verbatim "how we help" text from the goal. */
  help: string;
  /** Verbatim intended-outcome text from the goal (the kind of result, never a promised number). */
  outcome: string;
  /** Wayfinding tone (legacy or V2 domain-role token); mapped to an accessible V2 ink. */
  tone?: string;
  className?: string;
};

/** The three fixed steps, in their locked order. Headings are the component's own labels; the
 *  step VALUE is the goal's own verbatim copy. */
const STEPS = [
  { key: "need", heading: "What you need" },
  { key: "help", heading: "How we help" },
  { key: "outcome", heading: "Intended outcome" },
] as const;

/**
 * GoalPath — a goal-detail server component that presents the three parts of a goal as a
 * semantic ordered list: What you need → How we help → Intended outcome, in that fixed order.
 * Each item is a restrained light panel with a compact visible sequence marker (decorative and
 * aria-hidden — the `<ol>` already carries the order, so it is not announced twice), an H3
 * heading and the goal's own verbatim copy. The three panels wrap 1 → 3 columns as space
 * allows; none is enlarged or featured. Meaning is carried by number, heading and text, not
 * colour alone, and it stays readable with CSS disabled. No node-orb, connector path, gradient,
 * glow, progress bar, fixed height, or any guarantee — the intended outcome describes the kind
 * of result the work is built to produce, never a promised figure.
 */
export function GoalPath({ need, help, outcome, tone, className }: GoalPathProps) {
  const ink = domainInk(tone);
  const values: Record<(typeof STEPS)[number]["key"], string> = { need, help, outcome };
  return (
    <ol
      className={[styles.path, className].filter(Boolean).join(" ")}
      style={{ ["--path-ink" as string]: ink } as CSSProperties}
    >
      {STEPS.map((step, i) => (
        <li key={step.key} className={styles.step}>
          <span className={styles.marker} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className={styles.heading}>{step.heading}</h3>
          <p className={styles.detail}>{values[step.key]}</p>
        </li>
      ))}
    </ol>
  );
}
