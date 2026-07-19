"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./StageTimeline.module.css";

export type TimelineStage = {
  slug: string;
  name: string;
  color: string;
  icon: string;
  summary?: string;
  detail?: string;
  outcome?: string;
};

type StageTimelineProps = {
  stages: TimelineStage[];
  ariaLabel?: string;
  className?: string;
};

/**
 * StageTimeline — the connected growth journey: domain-tinted node orbs strung along a
 * connector that lights up as the row scrolls into view, with an expandable detail card
 * for the selected stage. Fully keyboard-operable: each stage is a real <button> in a
 * horizontally scrollable list, the detail panel is wired via aria-controls, and the
 * connector's resting state is fully lit so reduced-motion and no-JS both read complete.
 */
export function StageTimeline({ stages, ariaLabel, className }: StageTimelineProps) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId().replace(/:/g, "");

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = "true";
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeStage = stages[active];
  const panelId = `${baseId}-panel`;

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.track} role="group" aria-label={ariaLabel ?? "Growth journey stages"}>
        <span className={styles.line} aria-hidden="true">
          <span className={styles.lineLit} />
        </span>
        <ol className={styles.stages}>
          {stages.map((stage, i) => {
            const selected = i === active;
            return (
              <li key={stage.slug} className={styles.stageItem}>
                <button
                  type="button"
                  className={[styles.stageBtn, selected ? styles.stageBtnActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ ["--stage-hue" as string]: stage.color }}
                  aria-pressed={selected}
                  aria-controls={panelId}
                  onClick={() => setActive(i)}
                >
                  <NodeOrb hue={stage.color} size={52} emphasis={selected ? "bright" : "soft"}>
                    <Icon name={stage.icon} />
                  </NodeOrb>
                  <span className={styles.stageMeta}>
                    <span className={styles.stageNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.stageName}>{stage.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div id={panelId} className={styles.panel} style={{ ["--stage-hue" as string]: activeStage.color }} aria-live="polite">
        <div className={styles.panelHead}>
          <NodeOrb hue={activeStage.color} size={44} emphasis="bright">
            <Icon name={activeStage.icon} />
          </NodeOrb>
          <div>
            <p className={styles.panelStep}>
              Stage {active + 1} of {stages.length}
            </p>
            <h3 className={styles.panelName}>{activeStage.name}</h3>
          </div>
        </div>
        {activeStage.summary ? <p className={styles.panelSummary}>{activeStage.summary}</p> : null}
        {activeStage.detail ? <p className={styles.panelDetail}>{activeStage.detail}</p> : null}
        {activeStage.outcome ? (
          <p className={styles.panelOutcome}>
            <span className={styles.panelOutcomeLabel}>What you end up with</span>
            {activeStage.outcome}
          </p>
        ) : null}
      </div>
    </div>
  );
}
