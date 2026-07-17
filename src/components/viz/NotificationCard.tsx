import type { ReactNode } from "react";
import styles from "./NotificationCard.module.css";

type NotificationCardProps = {
  icon: ReactNode;
  title: string;
  /** Small status/detail line (a generic system state — never a real metric). */
  detail?: string;
  color?: string;
  /** Light chips sit over bright illustrations; dark chips over the cosmic field. */
  tone?: "dark" | "light";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * NotificationCard — a floating glass "system state" chip (Campaign ready, Order synced,
 * Tracking active…). Generic interface states only, never business metrics or fabricated
 * numbers. Decorative, so aria-hidden.
 */
export function NotificationCard({
  icon,
  title,
  detail,
  color = "var(--violet)",
  tone = "dark",
  className,
  style,
}: NotificationCardProps) {
  return (
    <div
      className={[styles.card, styles[tone], className].filter(Boolean).join(" ")}
      style={{ ["--nc-color" as string]: color, ...style }}
      aria-hidden="true"
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {detail ? <span className={styles.detail}>{detail}</span> : null}
      </span>
    </div>
  );
}
