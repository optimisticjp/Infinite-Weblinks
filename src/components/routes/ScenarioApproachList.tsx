import type { CSSProperties } from "react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ScenarioApproachList.module.css";

/** A single resolved approach step for a case scenario. */
export type ApproachStep = {
  /** 1-based sequence number. */
  number: number;
  label: string;
  detail: string;
  icon: string;
  /** Wayfinding tone (legacy or V2 domain-role token); mapped to an accessible V2 ink. */
  tone?: string;
};

/**
 * ScenarioApproachList — a case-scenario-specific server component that renders the connected
 * approach as a semantic ordered list. Each step is a restrained light paper panel with a
 * compact visible sequence number (decorative — the `<ol>` carries the order, so it is not
 * announced twice), a flat IconTile in the step's mapped V2 tone, an H3 step label and its
 * detail. A simple wrapping grid rhythm (1 → 2 → 3 columns), never a forced single row — no
 * ConnectorPath, SVG path animation, node-orb, glow, starfield, fixed viewport height,
 * scroll-jacking, fake progress or outcome claim. Steps are distinguished by number, label,
 * icon and text (not colour alone), and it stays understandable with CSS disabled. Server
 * Component.
 */
export function ScenarioApproachList({ steps }: { steps: ApproachStep[] }) {
  return (
    <ol className={styles.list}>
      {steps.map((step) => {
        const ink = domainInk(step.tone);
        return (
          <li key={step.label} className={styles.step} style={{ ["--step-ink"]: ink } as CSSProperties}>
            <span className={styles.top}>
              <span className={styles.num} aria-hidden="true">
                {String(step.number).padStart(2, "0")}
              </span>
              <IconTile color={ink} size="md">
                <Icon name={step.icon} />
              </IconTile>
            </span>
            <h3 className={styles.label}>{step.label}</h3>
            <p className={styles.detail}>{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
