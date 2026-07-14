import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Icon, hasIcon } from "@/components/primitives/Icon";
import styles from "./IndexCard.module.css";

export interface IndexCardProps {
  /** Internal detail-route href (always a real route). */
  href: string;
  title: string;
  /** Plain-English description; visually clamped to a few lines. */
  description?: string;
  /** icon-name string from seed data; renders a colour-coded tile when known. */
  icon?: string;
  /** Accent colour token, e.g. "var(--cyan)". */
  color?: string;
  /** Small pill shown in the card header (e.g. a delivery-model Badge). */
  badge?: ReactNode;
  /** Footer row — a chip, read time, or other short meta. */
  footer?: ReactNode;
}

/**
 * IndexCard — the shared listing-card link used across the services, tools,
 * roadmaps, learn and solutions index pages. A real internal <Link> to a detail
 * route, so every card reinforces the "everything connects" model. Reads the
 * enclosing section theme tokens, so the same card is correct on dark and band
 * surfaces. Purely a composition helper over existing primitives — it does not
 * restyle Badge, Icon or RelatedLinks.
 */
export function IndexCard({ href, title, description, icon, color, badge, footer }: IndexCardProps) {
  const showTile = Boolean(icon && hasIcon(icon));
  return (
    <Link
      href={href}
      className={styles.card}
      style={color ? { ["--card-accent" as string]: color } : undefined}
    >
      {(showTile || badge) && (
        <span className={styles.head}>
          {showTile ? (
            <span className={styles.tile} aria-hidden="true">
              <Icon name={icon as string} />
            </span>
          ) : (
            <span />
          )}
          {badge}
        </span>
      )}
      <span className={styles.title}>
        <span className={styles.titleText}>{title}</span>
        <ArrowUpRight className={styles.arrow} aria-hidden="true" />
      </span>
      {description && <span className={styles.desc}>{description}</span>}
      {footer && <span className={styles.footer}>{footer}</span>}
    </Link>
  );
}
