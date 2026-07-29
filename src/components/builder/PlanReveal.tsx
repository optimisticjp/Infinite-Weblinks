import type { CSSProperties } from "react";
import { Sparkles, Rocket, GitBranch, Clock, Wrench, Target, HeartHandshake, Check } from "lucide-react";
import { IconTile } from "@/components/primitives/IconTile";
import { Panel } from "@/components/primitives/Panel";
import { domainInk } from "@/lib/design/domainColor";
import type { GrowthPlanResult } from "@/lib/growth-plan/types";
import styles from "./PlanReveal.module.css";

type Phase = {
  key: "startHere" | "connectNext" | "addLater";
  eyebrow: string;
  title: string;
  /** Wayfinding tone (legacy token) mapped to an accessible V2 ink. */
  tone: string;
  icon: typeof Rocket;
};

const PHASES: Phase[] = [
  { key: "startHere", eyebrow: "Do this first", title: "Start here", tone: "var(--domain-strategy)", icon: Rocket },
  { key: "connectNext", eyebrow: "Then connect", title: "Connect next", tone: "var(--domain-discover)", icon: GitBranch },
  { key: "addLater", eyebrow: "Later", title: "Add later", tone: "var(--domain-operate)", icon: Clock },
];

/**
 * PlanReveal — presents the deterministic Growth Plan recommendation on the V2 light-first system:
 * the recommended starting point, a connected roadmap in phases, what the work involves, the tools
 * that fit, what the plan is designed to help you build, and an honest "how we'd help" note. Pure
 * presentation on flat V2 cards — no NodeOrb, ConnectorPath, gradient word or featured-phase glow.
 * The wayfinding tones are mapped through the domain bridge to accessible V2 ink. It never renders
 * the internal rule id, and never promises a number or a date. The email capture lives in the
 * builder. Server-safe and understandable with CSS disabled.
 */
export function PlanReveal({ result }: { result: GrowthPlanResult }) {
  return (
    <Panel padded>
      <div className={styles.wrap} data-testid="growth-plan-result">
        <header className={styles.head}>
          <div className={styles.headRow}>
            <IconTile color="var(--v2-brand-strong)" size="sm">
              <Sparkles aria-hidden="true" />
            </IconTile>
            <div className={styles.headText}>
              <p className={styles.eyebrow}>Your growth plan</p>
              <h2 className={styles.title}>Here&apos;s where we&apos;d start.</h2>
            </div>
            <span className={styles.tag}>Ready</span>
          </div>
          <p className={styles.intro}>
            A guided first read of your answers. Your recommendations are mapped from a reviewed
            framework we use across many businesses — which stages you see depends on what you told
            us, and not every business needs every stage. It&apos;s a sensible starting point, not a
            guarantee. Talk it through with us any time.
          </p>
        </header>

      <ol className={styles.roadmap}>
        {PHASES.map((phase) => {
          const items = result[phase.key];
          if (!items || items.length === 0) return null;
          const PhaseIcon = phase.icon;
          const ink = domainInk(phase.tone);
          return (
            <li
              key={phase.key}
              className={styles.phase}
              style={{ ["--phase-ink" as string]: ink } as CSSProperties}
            >
              <div className={styles.phaseHead}>
                <IconTile color={ink} size="sm">
                  <PhaseIcon aria-hidden="true" />
                </IconTile>
                <div>
                  <p className={styles.phaseEyebrow}>{phase.eyebrow}</p>
                  <h3 className={styles.phaseTitle}>{phase.title}</h3>
                </div>
              </div>
              <ul className={styles.phaseList}>
                {items.map((item, i) => (
                  <li key={item} className={styles.phaseItem}>
                    {phase.key === "startHere" && i === 0 ? (
                      <span className={styles.recommended}>Recommended starting point</span>
                    ) : null}
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className={styles.detailGrid}>
        <section className={styles.detail} aria-labelledby="plan-involves">
          <div className={styles.detailHead}>
            <IconTile color={domainInk("var(--domain-convert)")} size="sm">
              <Wrench aria-hidden="true" />
            </IconTile>
            <h3 id="plan-involves" className={styles.detailTitle}>
              What this involves
            </h3>
          </div>
          <ul className={styles.chips}>
            {result.relevantCapabilities.map((c) => (
              <li key={c} className={styles.chip}>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {result.exampleTools.length > 0 ? (
          <section className={styles.detail} aria-labelledby="plan-tools">
            <div className={styles.detailHead}>
              <IconTile color={domainInk("var(--domain-build)")} size="sm">
                <Target aria-hidden="true" />
              </IconTile>
              <h3 id="plan-tools" className={styles.detailTitle}>
                Tools that fit your setup
              </h3>
            </div>
            <ul className={styles.chips}>
              {result.exampleTools.map((t) => (
                <li key={t} className={`${styles.chip} ${styles.chipTool}`}>
                  {t}
                </li>
              ))}
            </ul>
            <p className={styles.toolsNote}>
              Example tools are illustrative. No partnership or endorsement is implied.
            </p>
          </section>
        ) : null}
      </div>

      {result.expectedOutcomes.length > 0 ? (
        <section className={styles.outcomes} aria-labelledby="plan-outcomes">
          <h3 id="plan-outcomes" className={styles.detailTitle}>
            What this plan is designed to help you build
          </h3>
          <ul className={styles.outcomeList}>
            {result.expectedOutcomes.map((o) => (
              <li key={o} className={styles.outcome}>
                <IconTile color="var(--v2-success)" size="sm">
                  <Check aria-hidden="true" strokeWidth={2.5} />
                </IconTile>
                {o}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.howWeHelp}>
        <IconTile color={domainInk("var(--domain-strategy)")} size="md">
          <HeartHandshake aria-hidden="true" />
        </IconTile>
        <div>
          <p className={styles.howTitle}>How we&apos;d help</p>
          <p className={styles.howBody}>{result.howWeHelp}</p>
        </div>
      </div>
    </div>
    </Panel>
  );
}
