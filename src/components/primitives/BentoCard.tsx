import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { NodeOrb } from "./NodeOrb";
import { Icon } from "./Icon";
import styles from "./Bento.module.css";

type BentoCardProps = {
  title: string;
  /** One-line supporting copy. */
  blurb?: string;
  /** When set, the whole tile is a link (with a corner arrow). Omit for an informational tile. */
  href?: string;
  /** Domain hue token, e.g. "var(--domain-strategy)". */
  hue?: string;
  variant?: "featured" | "medium" | "compact";
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  /** Ordinal badge (e.g. "01"). */
  index?: string;
  /** Icon name (resolved via the Icon primitive) shown in a domain-tinted node orb. */
  icon?: string;
  /** Optional pill rendered under the copy (e.g. a delivery-model badge). */
  badge?: ReactNode;
  /** DOM id on the tile (for in-page anchors). */
  id?: string;
  className?: string;
};

/**
 * BentoCard — a domain-tinted bento tile: an optional numbered badge and node-orb icon, an
 * eyebrow, a title, a one-line blurb, and an optional badge (e.g. a delivery model). When
 * `href` is set the whole tile is one link with a corner arrow (a single tab stop, named by
 * its heading); without `href` it is an informational tile (and can carry an `id` anchor).
 * Hover lifts and adds a coloured glow; reduced motion drops the lift.
 */
export function BentoCard({
  title,
  blurb,
  href,
  hue = "var(--domain-strategy)",
  variant = "medium",
  eyebrow,
  index,
  icon,
  badge,
  id,
  className,
}: BentoCardProps) {
  const inner = (
    <>
      <span className={styles.top}>
        {icon ? (
          <NodeOrb
            hue={hue}
            size={variant === "featured" ? 54 : 44}
            emphasis={variant === "featured" ? "bright" : "soft"}
          >
            <Icon name={icon} />
          </NodeOrb>
        ) : (
          <span />
        )}
        {href ? (
          <span className={styles.arrow} aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        ) : null}
      </span>

      <span className={styles.body}>
        {eyebrow || index ? (
          <span className={styles.eyebrow}>
            {index ? <span className={styles.index}>{index}</span> : null}
            {eyebrow}
          </span>
        ) : null}
        <span className={styles.title}>{title}</span>
        {blurb ? <span className={styles.blurb}>{blurb}</span> : null}
        {badge ? <span className={styles.badgeRow}>{badge}</span> : null}
      </span>
    </>
  );

  const cellClass = [styles.cell, styles[variant], className].filter(Boolean).join(" ");
  const cardStyle = { ["--bento-hue" as string]: hue };

  return (
    <li id={id} className={cellClass}>
      {href ? (
        <Link href={href} className={styles.card} style={cardStyle}>
          {inner}
        </Link>
      ) : (
        <div className={styles.card} style={cardStyle}>
          {inner}
        </div>
      )}
    </li>
  );
}
