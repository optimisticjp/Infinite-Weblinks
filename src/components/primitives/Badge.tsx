import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeProps = {
  children: ReactNode;
  /** Accent colour token, e.g. "var(--cyan)". */
  color?: string;
  variant?: "soft" | "outline";
  className?: string;
};

/** Small meaning-coded pill (delivery model, tag, category). Decorative colour only. */
export function Badge({ children, color = "var(--violet)", variant = "soft", className }: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className].filter(Boolean).join(" ")}
      style={{ ["--badge-color" as string]: color }}
    >
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
