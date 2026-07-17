import type { ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

type PhoneFrameProps = {
  children: ReactNode;
  color?: string;
  /** The active step in a journey gets the brighter frame; the rest are ambient. */
  active?: boolean;
  className?: string;
};

/**
 * PhoneFrame — a CSS phone bezel used by the customer-journey strip (ref 15). Pure
 * HTML/CSS, no image: the "screen" is real markup passed as children, so it scales and
 * stays crisp. Decorative chrome is aria-hidden; the meaningful caption lives outside.
 */
export function PhoneFrame({ children, color = "var(--violet)", active = false, className }: PhoneFrameProps) {
  return (
    <div
      className={[styles.phone, active ? styles.active : "", className].filter(Boolean).join(" ")}
      style={{ ["--phone-color" as string]: color }}
    >
      <span className={styles.notch} aria-hidden="true" />
      <div className={styles.screen}>{children}</div>
    </div>
  );
}
