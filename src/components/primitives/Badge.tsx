import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type Variant = "soft" | "outline";
type Tone = "neutral" | "brand" | "domain" | "success" | "warning" | "danger" | "information";

type BadgeProps = {
  children: ReactNode;
  /** Accent colour token, e.g. "var(--v2-domain-strategy-ink)". Also the domain ink when tone="domain". */
  color?: string;
  /** Legacy visual style (used when `tone` is not set). */
  variant?: Variant;
  /**
   * V2 tone. When set, renders the V2 treatment (tinted surface + accessible ink) and
   * supersedes `variant`. `domain` reads `color` as the domain ink.
   */
  tone?: Tone;
  /** Optional leading icon (decorative). */
  icon?: ReactNode;
  className?: string;
};

/**
 * Small meaning-coded pill. Legacy `variant` (soft/outline) + `color` are unchanged, so
 * existing dark/band consumers render exactly as before. Passing a V2 `tone` opts into the
 * light-first tinted treatment (measured AA on white and on its own tint). Colour is
 * decorative — meaning is carried by the label text.
 */
export function Badge({ children, color = "var(--violet)", variant = "soft", tone, icon, className }: BadgeProps) {
  const toneClass = tone ? styles[tone] : styles[variant];
  return (
    <span
      className={[styles.badge, toneClass, className].filter(Boolean).join(" ")}
      style={{ ["--badge-color" as string]: color }}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** Delivery-model → colour, for consistent tagging across services/tools. */
export const DELIVERY_COLOR: Record<string, string> = {
  "we-do": "var(--violet)",
  "we-expert": "var(--cyan)",
  "we-run": "var(--orange)",
  "you-run": "var(--lime)",
};
