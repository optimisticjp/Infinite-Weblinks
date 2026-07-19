"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import styles from "./ConstellationLayout.module.css";

export type ConstellationItem = {
  key: string;
  label: string;
  icon: string;
  color: string;
  /** Central-card content when this node is selected. */
  title: string;
  blurb: string;
  items?: string[];
  href?: string;
  cta?: string;
};

type ConstellationLayoutProps = {
  items: ConstellationItem[];
  ariaLabel?: string;
  className?: string;
};

/** Even distribution around an ellipse, starting at the top going clockwise. */
function place(i: number, n: number) {
  const angle = -90 + (360 / n) * i;
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + 44 * Math.cos(rad), y: 50 + 44 * Math.sin(rad) };
}

/**
 * ConstellationLayout — a central content card ringed by orbiting, domain-tinted node orbs.
 * Selecting a node (click or keyboard) swaps the central card. Accessible by construction:
 * the nodes are real <button>s in a labelled group, each with aria-pressed + aria-controls
 * pointing at the central card, which is an aria-live region. On narrow screens the orbit
 * collapses to a horizontal chip row above the card, so nothing depends on absolute layout.
 */
export function ConstellationLayout({ items, ariaLabel, className }: ConstellationLayoutProps) {
  const [active, setActive] = useState(0);
  const baseId = useId().replace(/:/g, "");
  const cardId = `${baseId}-card`;
  const positions = items.map((_, i) => place(i, items.length));
  const current = items[active];

  return (
    <div className={[styles.stage, className].filter(Boolean).join(" ")}>
      <svg className={styles.orbits} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <ellipse className={styles.orbit} cx="50" cy="50" rx="44" ry="44" />
        <ellipse className={styles.orbit} cx="50" cy="50" rx="30" ry="30" />
        {positions.map((p, i) => (
          <line
            key={items[i].key}
            className={styles.link}
            x1="50"
            y1="50"
            x2={p.x}
            y2={p.y}
            style={{ ["--link-color" as string]: items[i].color, opacity: i === active ? 0.9 : 0.28 }}
          />
        ))}
      </svg>

      <div id={cardId} className={styles.card} style={{ ["--card-hue" as string]: current.color }} aria-live="polite">
        <span className={styles.cardOrb} aria-hidden="true">
          <NodeOrb hue={current.color} size={52} emphasis="bright">
            <Icon name={current.icon} />
          </NodeOrb>
        </span>
        <p className={styles.cardEyebrow}>{current.label}</p>
        <h3 className={styles.cardTitle}>{current.title}</h3>
        <p className={styles.cardBlurb}>{current.blurb}</p>
        {current.items?.length ? (
          <ul className={styles.cardList}>
            {current.items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : null}
        {current.href ? (
          <Link href={current.href} className={styles.cardLink}>
            {current.cta ?? `Explore ${current.label}`}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <ul className={styles.nodes} aria-label={ariaLabel ?? "Service worlds"}>
        {items.map((item, i) => {
          const selected = i === active;
          return (
            <li
              key={item.key}
              className={styles.node}
              style={{ ["--x" as string]: `${positions[i].x}%`, ["--y" as string]: `${positions[i].y}%` }}
            >
              <button
                type="button"
                className={[styles.nodeBtn, selected ? styles.nodeBtnActive : ""].filter(Boolean).join(" ")}
                style={{ ["--node-hue" as string]: item.color }}
                aria-pressed={selected}
                aria-controls={cardId}
                onClick={() => setActive(i)}
              >
                <NodeOrb hue={item.color} size={44} emphasis={selected ? "bright" : "soft"}>
                  <Icon name={item.icon} />
                </NodeOrb>
                <span className={styles.nodeLabel}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
