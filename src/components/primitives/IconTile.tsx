import type { ReactNode } from "react";
import styles from "./IconTile.module.css";

type IconTileProps = {
  children: ReactNode;
  /** Accent colour — a token like "var(--domain-website)" or a hex. */
  color?: string;
  variant?: "filled" | "outline";
  /** Tile size in px. Default 48. */
  size?: number;
  className?: string;
};

/**
 * IconTile — the recurring glowing, colour-coded "node" that wraps a single
 * Lucide glyph. Decorative by default (aria-hidden); colour comes from the tile,
 * so it is never the sole carrier of meaning.
 */
export function IconTile({
  children,
  color = "var(--violet)",
  variant = "outline",
  size = 48,
  className,
}: IconTileProps) {
  return (
    <span
      className={[styles.tile, styles[variant], className].filter(Boolean).join(" ")}
      style={{ ["--tile-color" as string]: color, ["--tile-size" as string]: `${size}px` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
