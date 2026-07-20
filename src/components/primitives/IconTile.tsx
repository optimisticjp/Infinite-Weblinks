import type { ReactNode } from "react";
import styles from "./IconTile.module.css";

type NamedSize = "sm" | "md" | "lg";
type IconTileProps = {
  children: ReactNode;
  /** Accent/ink colour — a token like "var(--v2-domain-strategy-ink)" or a hex. */
  color?: string;
  variant?: "filled" | "outline";
  /** Tile size: a px number (legacy) or a named V2 size (sm 40 · md 48 · lg 56). */
  size?: number | NamedSize;
  className?: string;
};

const NAMED: Record<NamedSize, number> = { sm: 40, md: 48, lg: 56 };

/**
 * IconTile — the recurring colour-coded tile wrapping a single glyph. Decorative by default
 * (aria-hidden); colour is never the sole carrier of meaning (the parent supplies the label).
 *
 * On V2 surfaces (.theme-light / -alt / .theme-night) it renders FLAT — a tinted background
 * with an accessible ink glyph, no bloom/glow/gloss. On legacy surfaces the existing glowing
 * treatment is unchanged.
 */
export function IconTile({
  children,
  color = "var(--violet)",
  variant = "outline",
  size = 48,
  className,
}: IconTileProps) {
  const px = typeof size === "number" ? size : NAMED[size];
  return (
    <span
      className={[styles.tile, styles[variant], className].filter(Boolean).join(" ")}
      style={{ ["--tile-color" as string]: color, ["--tile-size" as string]: `${px}px` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
