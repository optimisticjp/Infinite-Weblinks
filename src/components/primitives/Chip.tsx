import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipProps = {
  children: ReactNode;
  /** Optional leading icon (decorative). */
  icon?: ReactNode;
  className?: string;
};

/**
 * Chip — a static, non-interactive informational label (e.g. "Custom quote", "Connected").
 * Reads the semantic surface/text tokens, so it adapts to any V2 surface. For a clickable
 * filter, use FilterChip; for meaning-coded status/domain pills, use Badge.
 */
export function Chip({ children, icon, className }: ChipProps) {
  return (
    <span className={[styles.chip, className].filter(Boolean).join(" ")}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
