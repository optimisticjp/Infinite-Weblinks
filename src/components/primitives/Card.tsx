import type { ReactNode } from "react";
import styles from "./Card.module.css";

/**
 * Card variants.
 * V2 set: plain · raised · outlined · tinted · night (+ the `interactive` modifier below).
 * `glass` is DEPRECATED for V2 (backdrop-blur glass panel) — retained ONLY for its one
 * legacy consumer (the contact page); do not use it on V2 surfaces.
 * `outline` is the legacy translucent outline; V2 code should prefer `outlined`.
 */
type Variant = "raised" | "glass" | "outline" | "plain" | "outlined" | "tinted" | "night";

type CardProps = {
  children: ReactNode;
  /** Accent used for the top rail, number badge, and (V2) the `tinted` surface. */
  accent?: string;
  variant?: Variant;
  /** Adds a colour-coded top rail (3px) in the accent. */
  railed?: boolean;
  /** Optional ordinal badge (01, 02…) shown top-left. */
  index?: string;
  /** Lifts on hover — for genuinely interactive/linked cards (needs a nested link/button). */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "article";
};

/**
 * Card — the recurring panel: generous radius, hairline border, optional accent rail and
 * ordinal badge. Colours come from the enclosing theme tokens, so it reads correctly on dark,
 * daylight and the V2 surfaces. On V2 surfaces the interactive hover is a soft neutral lift
 * (≤ 2px) with focus-within parity — no coloured glow. Padding is always ≥ radius + 12px.
 */
export function Card({
  children,
  accent = "var(--violet)",
  variant = "raised",
  railed = false,
  index,
  interactive = false,
  className,
  style,
  as = "div",
}: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={[
        styles.card,
        styles[variant],
        railed ? styles.railed : "",
        interactive ? styles.interactive : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--card-accent" as string]: accent, ...style }}
    >
      {index ? (
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
      ) : null}
      {children}
    </Tag>
  );
}
