import { Rocket, GitBranch, Clock, Wrench, Target, HeartHandshake, Check } from "lucide-react";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import type { GrowthPlanResult } from "@/lib/growth-plan/types";
import styles from "./PlanReveal.module.css";

type Phase = { key: "startHere" | "connectNext" | "addLater"; eyebrow: string; title: string; hue: string; icon: typeof Rocket };

const PHASES: Phase[] = [
  { key: "startHere", eyebrow: "Do this first", title: "Start here", hue: "var(--domain-strategy)", icon: Rocket },
  { key: "connectNext", eyebrow: "Then connect", title: "Connect next", hue: "var(--domain-discover)", icon: GitBranch },
  { key: "addLater", eyebrow: "Later", title: "Add later", hue: "var(--domain-operate)", icon: Clock },
];

/**
 * PlanReveal — presents the deterministic Growth Plan recommendation: the recommended
 * starting point, a connected roadmap in three phases, what the work involves, the tools
 * that fit, the outcomes it's built to produce, and an honest "how we'd help" note. Pure
 * presentation; the email capture lives in the builder. Never renders the internal rule id,
 * and never promises a number or a date.
 */
export function PlanReveal({ result }: { result: GrowthPlanResult }) {
  return (
    <div className={styles.wrap} data-testid="growth-plan-result">
      <header className={styles.head}>
        <p className={styles.eyebrow}>Your growth plan</p>
        <h2 className={styles.title}>
          Here&apos;s where we&apos;d <span className="iw-gradient-word">start</span>.
        </h2>
        <p className={styles.intro}>
          A guided first read of your answers. It&apos;s a sensible starting point built from the
          same growth journey we use with everyone, not a guarantee. Talk it through with us any
          time.
        </p>
      </header>

      <ConnectorPath className={styles.roadmapConn} dots={2} />

      <ol className={styles.roadmap}>
        {PHASES.map((phase) => {
          const items = result[phase.key];
          if (!items || items.length === 0) return null;
          const PhaseIcon = phase.icon;
          return (
            <li
              key={phase.key}
              className={[styles.phase, phase.key === "startHere" ? styles.featured : ""]
                .filter(Boolean)
                .join(" ")}
              style={{ ["--phase-hue" as string]: phase.hue }}
            >
              <div className={styles.phaseHead}>
                <NodeOrb hue={phase.hue} size={44} emphasis={phase.key === "startHere" ? "bright" : "soft"}>
                  <PhaseIcon aria-hidden="true" />
                </NodeOrb>
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
            <NodeOrb hue="var(--domain-convert)" size={38}>
              <Wrench aria-hidden="true" />
            </NodeOrb>
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
              <NodeOrb hue="var(--domain-build)" size={38}>
                <Target aria-hidden="true" />
              </NodeOrb>
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
          </section>
        ) : null}
      </div>

      {result.expectedOutcomes.length > 0 ? (
        <section className={styles.outcomes} aria-labelledby="plan-outcomes">
          <h3 id="plan-outcomes" className={styles.detailTitle}>
            What you&apos;d end up with
          </h3>
          <ul className={styles.outcomeList}>
            {result.expectedOutcomes.map((o) => (
              <li key={o} className={styles.outcome}>
                <NodeOrb hue="var(--domain-retain)" size={30}>
                  <Check aria-hidden="true" strokeWidth={2.5} />
                </NodeOrb>
                {o}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.howWeHelp}>
        <NodeOrb hue="var(--domain-strategy)" size={44} emphasis="bright">
          <HeartHandshake aria-hidden="true" />
        </NodeOrb>
        <div>
          <p className={styles.howTitle}>How we&apos;d help</p>
          <p className={styles.howBody}>{result.howWeHelp}</p>
        </div>
      </div>
    </div>
  );
}
