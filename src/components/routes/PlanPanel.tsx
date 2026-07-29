import type { CSSProperties } from "react";
import { Sparkles, Rocket, GitBranch, Clock } from "lucide-react";
import { Panel } from "@/components/primitives/Panel";
import { FloatingCard } from "@/components/primitives/FloatingCard";
import { IconTile } from "@/components/primitives/IconTile";
import { RevealOnView } from "@/components/primitives/RevealOnView";
import { domainInk } from "@/lib/design/domainColor";
import { resolve } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";
import type { GrowthPlanInput } from "@/lib/growth-plan/types";
import { businessTypes } from "@/lib/content/data/business-types";
import { goals } from "@/lib/content/data/goals";
import styles from "./PlanPanel.module.css";

/**
 * PlanPanel — a product-surface mockup of the Growth Plan, showing the engine's REAL output rather
 * than an assembled arrangement of content. The contents are derived at build time by resolving one
 * fixed, representative input against the reviewed rule set (deterministic — the same plan every
 * build). Server Component; the entrance animation lives in the thin <RevealOnView> client wrapper,
 * and the CSS carries a complete prefers-reduced-motion static state.
 *
 * The floating cards show facts DERIVED FROM THE PLAN (its first step and its roadmap size), never
 * an outcome, a number-as-result or a performance claim — the constitution's evidence rule.
 */

// Fixed representative input: a local & service business that wants more leads and already has a
// website (a WordPress site → "I have a website or store"). It matches the `local-bookings` rule.
const FIXED_INPUT: GrowthPlanInput = {
  businessType: "local-service",
  mainGoal: "get-leads-and-bookings",
  existingSetup: "I have a website or store",
};
const PLAN = resolve(FIXED_INPUT, growthPlanRuleSet);

// "Built from" chips — the real inputs, titled from the content layer so they stay truthful.
const BUILT_FROM = [
  {
    label: businessTypes.find((b) => b.slug === FIXED_INPUT.businessType)?.name ?? "Local & service business",
    tone: "var(--domain-strategy)",
  },
  {
    label: goals.find((g) => g.slug === FIXED_INPUT.mainGoal)?.title ?? "More leads and bookings",
    tone: "var(--domain-convert)",
  },
  { label: "Existing website", tone: "var(--domain-build)" },
];

const PHASES = [
  { key: "startHere", eyebrow: "Do this first", title: "Start here", tone: "var(--domain-strategy)", icon: Rocket },
  { key: "connectNext", eyebrow: "Then connect", title: "Connect next", tone: "var(--domain-discover)", icon: GitBranch },
  { key: "addLater", eyebrow: "Later", title: "Add later", tone: "var(--domain-operate)", icon: Clock },
] as const;

// Facts derived from the resolved plan — structural counts + the first step, never an outcome/metric.
const STEP_COUNT = PLAN.startHere.length + PLAN.connectNext.length + PLAN.addLater.length;
const STAGE_COUNT = [PLAN.startHere, PLAN.connectNext, PLAN.addLater].filter((p) => p.length > 0).length;
const FIRST_STEP = PLAN.startHere[0];

export function PlanPanel() {
  let order = 0;
  return (
    <RevealOnView className={styles.stage}>
      <Panel className={styles.panel}>
        <div className={styles.head}>
          <IconTile color="var(--v2-brand-strong)" size="sm">
            <Sparkles aria-hidden="true" />
          </IconTile>
          <h3 className={styles.title}>Your growth plan</h3>
          <span className={styles.tag}>Ready</span>
        </div>

        <div className={styles.body}>
          <p className={styles.builtFrom}>Built from</p>
          <ul className={styles.context}>
            {BUILT_FROM.map((c) => (
              <li
                key={c.label}
                className={`${styles.chip} ${styles.revealItem}`}
                style={{ ["--chip-ink" as string]: domainInk(c.tone), ["--reveal-order" as string]: order++ } as CSSProperties}
              >
                <span className={styles.chipDot} aria-hidden="true" />
                {c.label}
              </li>
            ))}
          </ul>

          <ol className={styles.steps}>
            {PHASES.map((phase) => {
              const items = PLAN[phase.key];
              if (!items || items.length === 0) return null;
              const ink = domainInk(phase.tone);
              const PhaseIcon = phase.icon;
              return (
                <li
                  key={phase.key}
                  className={`${styles.step} ${styles.revealItem}`}
                  style={{ ["--step-ink" as string]: ink, ["--reveal-order" as string]: order++ } as CSSProperties}
                >
                  <IconTile color={ink} size="sm">
                    <PhaseIcon aria-hidden="true" />
                  </IconTile>
                  <div className={styles.stepBody}>
                    <span className={styles.stepWhen}>{phase.eyebrow}</span>
                    <span className={styles.stepName}>{phase.title}</span>
                    <ul className={styles.stepItems}>
                      {items.map((item, i) => (
                        <li key={item} className={styles.stepItem}>
                          {phase.key === "startHere" && i === 0 ? (
                            <span className={styles.recommended}>Recommended start</span>
                          ) : null}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className={styles.foot}>Built in your name — you keep your accounts, data and tools.</p>
      </Panel>

      {/* Floating cards — facts derived from the plan (its first step and roadmap size), never an
          outcome or performance claim. */}
      <FloatingCard
        className={`${styles.floatA} ${styles.revealItem}`}
        style={{ ["--reveal-order" as string]: order++ } as CSSProperties}
      >
        <span className={styles.floatLabel}>First step</span>
        <span className={styles.floatValue}>{FIRST_STEP}</span>
      </FloatingCard>
      <FloatingCard
        className={`${styles.floatB} ${styles.revealItem}`}
        style={{ ["--reveal-order" as string]: order++ } as CSSProperties}
      >
        <span className={styles.floatLabel}>Your roadmap</span>
        <span className={styles.floatValue}>{STEP_COUNT} steps</span>
        <span className={styles.floatCap}>across {STAGE_COUNT} stages</span>
      </FloatingCard>
    </RevealOnView>
  );
}
