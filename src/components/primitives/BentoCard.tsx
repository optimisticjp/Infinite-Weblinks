import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NodeOrb } from "./NodeOrb";
import { Icon } from "./Icon";
import styles from "./Bento.module.css";

type BentoCardProps = {
  title: string;
  /** One-line supporting copy. */
  blurb?: string;
  href: string;
  /** Domain hue token, e.g. "var(--domain-strategy)". */
  hue?: string;
  variant?: "featured" | "medium" | "compact";
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  /** Ordinal badge (e.g. "01"). */
  index?: string;
  /** Icon name (resolved via the Icon primitive) shown in a domain-tinted node orb. */
  icon?: string;
  className?: string;
};

/**
 * BentoCard — a domain-tinted bento tile: an optional numbered badge and node-orb icon, an
 * eyebrow, a title, a one-line blurb, and a circular arrow button. The whole tile is one
 * link (the arrow is decorative), so it has a single tab stop and an accessible name from
 * its heading. Hover lifts and adds a coloured glow; reduced motion drops the lift.
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
  className,
}: BentoCardProps) {
  return (
    <li className={[styles.cell, styles[variant], className].filter(Boolean).join(" ")}>
      <Link href={href} className={styles.card} style={{ ["--bento-hue" as string]: hue }}>
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
          <span className={styles.arrow} aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
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
        </span>
      </Link>
    </li>
  );
}
