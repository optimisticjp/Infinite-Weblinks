import type { ReactNode } from "react";
import { Icon } from "@/components/primitives/Icon";
import styles from "./Constellation.module.css";

export type ConstellationNode = {
  key: string;
  label: string;
  icon: string;
  color: string;
  /** Optional sublabel shown under the label on wider layouts. */
  hint?: string;
};

type ConstellationProps = {
  nodes: ConstellationNode[];
  /** Centre content — usually an <InfinityMark />. */
  children: ReactNode;
  /** Accessible name for the whole diagram (it is otherwise decorative). */
  ariaLabel?: string;
  className?: string;
};

/** Even distribution around an ellipse, starting at the top and going clockwise. */
function place(i: number, n: number) {
  const angle = -90 + (360 / n) * i; // degrees, 0 = right, -90 = top
  const rad = (angle * Math.PI) / 180;
  const rx = 42;
  const ry = 38;
  return { x: 50 + rx * Math.cos(rad), y: 50 + ry * Math.sin(rad) };
}

/**
 * Constellation — the central mark ringed by orbiting, colour-coded service nodes with a
 * connection curve back to the centre (refs 07, 12, 16). The orbit rings and curves are
 * decorative SVG; every node label is real text. One bright element only — the centre
 * mark — with the nodes running as ambient supporting lights.
 *
 * Responsive: on narrow screens the orbit collapses (the section renders the mark alone)
 * and the nodes reflow into a simple wrapped list, so nothing depends on absolute layout.
 */
export function Constellation({ nodes, children, ariaLabel, className }: ConstellationProps) {
  const positions = nodes.map((_, i) => place(i, nodes.length));

  return (
    <div
      className={[styles.stage, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      <svg className={styles.orbits} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <ellipse className={styles.orbit} cx="50" cy="50" rx="42" ry="38" />
        <ellipse className={styles.orbit} cx="50" cy="50" rx="27" ry="24" />
        {positions.map((p, i) => (
          <path
            key={nodes[i].key}
            className={styles.link}
            d={`M50 50 Q ${(50 + p.x) / 2} ${(50 + p.y) / 2 - 4} ${p.x} ${p.y}`}
            style={{ ["--link-color" as string]: nodes[i].color }}
          />
        ))}
      </svg>

      <span className={styles.center}>{children}</span>

      <ul className={styles.nodes}>
        {nodes.map((node, i) => (
          <li
            key={node.key}
            className={styles.node}
            style={{
              ["--node-color" as string]: node.color,
              ["--x" as string]: `${positions[i].x}%`,
              ["--y" as string]: `${positions[i].y}%`,
            }}
          >
            <span className={styles.tile} aria-hidden="true">
              <Icon name={node.icon} />
            </span>
            <span className={styles.label}>
              <span className={styles.labelText}>{node.label}</span>
              {node.hint ? <span className={styles.hint}>{node.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
