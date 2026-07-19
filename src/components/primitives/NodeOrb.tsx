import type { ReactNode } from "react";
import styles from "./NodeOrb.module.css";

type NodeOrbProps = {
  children: ReactNode;
  /** Domain hue — a token like "var(--domain-strategy)" or a hex. Tints fill, ring + glow. */
  hue?: string;
  /** Orb diameter in px. */
  size?: number;
  /** Full-strength glow (for the one bright orb) vs. the softer supporting glow. */
  emphasis?: "soft" | "bright";
  className?: string;
};

/**
 * NodeOrb — the glossy, domain-tinted "node" of the Constellation system: a circular badge
 * with a glass highlight, a tinted ring and a coloured glow, wrapping a single Lucide glyph.
 * Decorative by construction (aria-hidden); colour is never the sole carrier of meaning, so
 * every orb is paired with real text by its caller.
 */
export function NodeOrb({
  children,
  hue = "var(--domain-strategy)",
  size = 46,
  emphasis = "soft",
  className,
}: NodeOrbProps) {
  return (
    <span
      className={[styles.orb, styles[emphasis], className].filter(Boolean).join(" ")}
      style={{ ["--orb-hue" as string]: hue, ["--orb-size" as string]: `${size}px` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
