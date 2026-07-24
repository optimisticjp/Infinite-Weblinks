import Link from "next/link";
import type { ReactNode } from "react";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./LinkChip.module.css";

type LinkChipProps = {
  /** Internal destination. */
  href: string;
  children: ReactNode;
  /** Optional decorative leading icon. */
  icon?: ReactNode;
  /** Optional wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink accent. */
  tone?: string;
  className?: string;
  /** Optional accessible name where the visible label needs clarification. */
  "aria-label"?: string;
};

/**
 * LinkChip — a compact INTERNAL navigation link for related services, goals, stages, tools and
 * business types. Unlike Chip (static informational text), this is a real `<Link>` with a ≥44px
 * pointer target, a visible focus ring, focus/hover parity, a clear pressed state, and hover
 * enhancement only on fine-pointer devices. Long labels wrap safely and are never truncated.
 * `tone` (when given) becomes the accent — passed through the central domain-colour bridge — used
 * for the icon and the hover/focus border, never as body-text colour or a raw value. No glow,
 * glass or gradient; reduced-motion-safe. Must NOT be nested inside a whole-card link.
 */
export function LinkChip({ href, children, icon, tone, className, ...rest }: LinkChipProps) {
  const style = tone ? ({ ["--chip-accent"]: domainInk(tone) } as React.CSSProperties) : undefined;
  return (
    <Link
      href={href}
      className={[styles.chip, className].filter(Boolean).join(" ")}
      style={style}
      aria-label={rest["aria-label"]}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
