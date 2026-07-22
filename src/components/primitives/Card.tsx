import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "./Card.module.css";

/**
 * Card variants.
 * V2 set: plain · raised · outlined · tinted · night (+ the `interactive` modifier below).
 * `glass` is DEPRECATED for V2 (backdrop-blur glass panel) — retained ONLY for its one
 * legacy consumer (the contact page); do not use it on V2 surfaces.
 * `outline` is the legacy translucent outline; V2 code should prefer `outlined`.
 */
type Variant = "raised" | "glass" | "outline" | "plain" | "outlined" | "tinted" | "night";

type BaseCardProps = {
  children: ReactNode;
  /** Accent used for the top rail, number badge, and (V2) the `tinted` surface. */
  accent?: string;
  variant?: Variant;
  /** Adds a colour-coded top rail (3px) in the accent. */
  railed?: boolean;
  /** Optional ordinal badge (01, 02…) shown top-left. */
  index?: string;
  /** Optional DOM id — e.g. a deep-link fragment target on a static explanatory card. */
  id?: string;
  className?: string;
  style?: CSSProperties;
};

type StaticCardProps = BaseCardProps & {
  href?: undefined;
  /** Lifts on hover — for cards that contain their OWN link/button (not a link themselves). */
  interactive?: boolean;
  as?: "div" | "li" | "article";
};

type LinkCardProps = BaseCardProps & {
  /**
   * Internal path. Renders the WHOLE card as a single Next <Link> (no nested link), which is
   * automatically interactive with focus-visible/hover parity. `as` is not accepted — the root
   * is always the anchor. Internal links only.
   */
  href: string;
  prefetch?: boolean;
  interactive?: never;
  as?: never;
};

export type CardProps = StaticCardProps | LinkCardProps;

/**
 * Card — the recurring panel: generous radius, hairline border, optional accent rail and
 * ordinal badge. Colours come from the enclosing theme tokens, so it reads correctly on dark,
 * daylight and the V2 surfaces. On V2 surfaces the interactive hover is a soft neutral lift
 * (≤ 2px) with focus-within parity — no coloured glow. Padding is always ≥ radius + 12px.
 *
 * With `href`, the whole card becomes ONE Next <Link> (a single tab stop, no nested link),
 * auto-interactive, with a clear focus-visible ring matching the hover lift. Without `href` it
 * renders a `div`/`li`/`article` (via `as`) exactly as before, so every existing consumer is
 * unchanged.
 */
export function Card(props: CardProps) {
  const {
    children,
    accent = "var(--violet)",
    variant = "raised",
    railed = false,
    index,
    id,
    className,
    style,
  } = props;

  const isLink = props.href !== undefined;
  const interactive = isLink || (props as StaticCardProps).interactive === true;

  const classNames = [
    styles.card,
    styles[variant],
    railed ? styles.railed : "",
    interactive ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = { ["--card-accent" as string]: accent, ...style } as CSSProperties;

  const inner = (
    <>
      {index ? (
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
      ) : null}
      {children}
    </>
  );

  if (isLink) {
    const { href, prefetch } = props as LinkCardProps;
    return (
      <Link href={href} prefetch={prefetch} id={id} className={classNames} style={mergedStyle}>
        {inner}
      </Link>
    );
  }

  const Tag = (props as StaticCardProps).as ?? "div";
  return (
    <Tag id={id} className={classNames} style={mergedStyle}>
      {inner}
    </Tag>
  );
}
