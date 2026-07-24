import type { PricingQuoteStep } from "@/lib/content/data/pricing";
import styles from "./QuoteProcessList.module.css";

type QuoteProcessListProps = {
  /** The quote steps, in source order. */
  steps: PricingQuoteStep[];
  className?: string;
};

/**
 * QuoteProcessList — a semantic ordered list of the steps to a written quote. Each step shows a
 * compact, decorative step number (the `<ol>` already carries the order), the step title as its H3
 * and the exact blurb. A restrained neutral panel per step, reflowing 1-col → 2-col with no
 * horizontal scroll. No fake progress/completion state, no invented duration, no selected step, no
 * buttons, no client state, no giant nodes, no glow, no animation. Server Component; every step is
 * available without JavaScript.
 */
export function QuoteProcessList({ steps, className }: QuoteProcessListProps) {
  return (
    <ol className={[styles.list, className].filter(Boolean).join(" ")}>
      {steps.map((step, i) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.index} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className={styles.content}>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.blurb}>{step.blurb}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
