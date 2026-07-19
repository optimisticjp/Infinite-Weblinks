import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import styles from "./FloatingCards.module.css";

/**
 * FloatingCard family — glossy glass "system state" chips that drift gently around a scene.
 * All are decorative (aria-hidden) and every number is generic, rounded and illustrative,
 * never a real client's result or our own stat. Pairs with the existing NotificationCard.
 */

type FloatBase = { hue?: string; tone?: "dark" | "light"; className?: string; style?: React.CSSProperties };

function Shell({
  hue = "var(--domain-strategy)",
  tone = "dark",
  className,
  style,
  children,
}: FloatBase & { children: ReactNode }) {
  return (
    <div
      className={[styles.card, styles[tone], className].filter(Boolean).join(" ")}
      style={{ ["--fc-hue" as string]: hue, ...style }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/** A single headline metric with a label (illustrative, e.g. "Repeat customers"). */
export function StatCard({
  label,
  value,
  trend,
  ...base
}: FloatBase & { label: string; value: string; trend?: string }) {
  return (
    <Shell {...base}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
      {trend ? (
        <p className={styles.statTrend}>
          <TrendingUp size={13} aria-hidden="true" />
          {trend}
        </p>
      ) : null}
    </Shell>
  );
}

/** A tiny generic bar sparkline. `bars` are relative heights 0..1. */
export function ChartCard({
  label,
  bars = [0.4, 0.6, 0.5, 0.8, 0.7, 1],
  ...base
}: FloatBase & { label: string; bars?: number[] }) {
  return (
    <Shell {...base}>
      <p className={styles.chartLabel}>{label}</p>
      <span className={styles.bars}>
        {bars.map((b, i) => (
          <span key={i} className={styles.bar} style={{ height: `${Math.max(12, b * 100)}%` }} />
        ))}
      </span>
    </Shell>
  );
}

/** A short lifecycle message chip. */
export function MessageCard({
  title,
  body,
  ...base
}: FloatBase & { title: string; body: string }) {
  return (
    <Shell {...base}>
      <span className={styles.msgDot} />
      <p className={styles.msgTitle}>{title}</p>
      <p className={styles.msgBody}>{body}</p>
    </Shell>
  );
}
