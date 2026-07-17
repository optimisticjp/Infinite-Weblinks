import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  /** Accent used for the top rail, number badge and hover glow. */
  accent?: string;
  variant?: "raised" | "glass" | "outline";
  /** Adds a colour-coded top rail (3px) in the accent. */
  railed?: boolean;
  /** Optional ordinal badge (01, 02…) shown top-left. */
  index?: string;
  /** Lifts on hover — for interactive/linked cards. */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "article";
};

/**
 * Card — the recurring premium panel: generous radius, hairline border, optional accent
 * rail and ordinal badge. Colours come from the enclosing section theme tokens, so it
 * reads correctly on dark and daylight surfaces. Padding is always ≥ radius + 12px.
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
