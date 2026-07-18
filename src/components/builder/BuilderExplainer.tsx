import Link from "next/link";
import { ArrowUpRight, ListChecks, ShieldCheck, Zap } from "lucide-react";
import styles from "./BuilderExplainer.module.css";

/**
 * Single source of truth for the number of qualification questions the builder asks before
 * contact details. Keep it in step with STEP_ORDER in GrowthPlanBuilder so the hero/CTA
 * explainer stays factual (review §6 / brief §P1-02: "Update the wording if the builder is
 * shortened so it remains factual").
 */
export const BUILDER_QUESTION_COUNT = 5;

const FACTS = [
  { Icon: ListChecks, text: `${BUILDER_QUESTION_COUNT} quick questions` },
  { Icon: Zap, text: "See your plan on screen" },
  { Icon: ShieldCheck, text: "No email needed to start" },
];

/**
 * BuilderExplainer — a concise "what the growth-plan builder is" strip (review §2/§6, brief
 * §P1-02). Tells the visitor the format, time and reassurance before they commit, and
 * surfaces the lower-friction troubleshooter as an alternative (brief §P2-05). With
 * `preview`, it also shows an honest *shape* of the result (Now / Next / Later) — structure
 * only, never fabricated recommendations, so it can never read as fake proof.
 */
export function BuilderExplainer({
  variant = "hero",
  preview = false,
  className,
}: {
  variant?: "hero" | "banner";
  preview?: boolean;
  className?: string;
}) {
  return (
    <div className={[styles.wrap, styles[variant], className].filter(Boolean).join(" ")}>
      <ul className={styles.facts}>
        {FACTS.map(({ Icon, text }) => (
          <li key={text} className={styles.fact}>
            <Icon className={styles.factIcon} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {preview && <PlanPreview />}

      <p className={styles.troubleshoot}>
        Not ready to plan?{" "}
        <Link href="/troubleshooter" className={styles.troubleshootLink}>
          Try the quick troubleshooter
          <ArrowUpRight className={styles.troubleshootIcon} aria-hidden="true" />
        </Link>{" "}
        — see guidance with no email.
      </p>
    </div>
  );
}

const TIERS = [
  { label: "Now", accent: "var(--lime)" },
  { label: "Next", accent: "var(--cyan)" },
  { label: "Later", accent: "var(--violet)" },
];

/** Honest representation of the *result shape* — a prioritised plan. No real or fake data. */
function PlanPreview() {
  return (
    <figure
      className={styles.preview}
      aria-label="Your result is a prioritised plan with Now, Next and Later steps"
    >
      <figcaption className={styles.previewCap}>What you get — a prioritised plan</figcaption>
      <div className={styles.previewRows} aria-hidden="true">
        {TIERS.map((tier) => (
          <div
            key={tier.label}
            className={styles.previewRow}
            style={{ ["--tier" as string]: tier.accent }}
          >
            <span className={styles.previewTier}>{tier.label}</span>
            <span className={styles.previewBars}>
              <span className={styles.previewBar} />
              <span className={styles.previewBar} />
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
