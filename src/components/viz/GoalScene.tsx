import { Icon } from "@/components/primitives/Icon";
import styles from "./GoalScene.module.css";

/**
 * GoalScene — an original, luminous illustrated scene per goal, built as layered SVG + CSS
 * (ref 10, brief §REF-10). Not a copied 3D asset: concentric orbit rings, drifting nodes and
 * a glowing centre glyph, all tinted to the goal's accent colour so each card reads as a
 * distinct lit "destination" rather than a flat icon tile. Fully decorative (`aria-hidden`)
 * — the card's real heading/outcome text carries all meaning. Cheap and fast (vector, no
 * raster), and it scales down cleanly on mobile.
 */
export function GoalScene({
  icon,
  color,
  size = "compact",
}: {
  icon: string;
  color: string;
  size?: "featured" | "compact";
}) {
  return (
    <div
      className={[styles.scene, size === "featured" ? styles.featured : styles.compact].join(" ")}
      style={{ ["--accent" as string]: color }}
      aria-hidden="true"
    >
      <svg className={styles.orbits} viewBox="0 0 200 200" role="presentation" focusable="false">
        <defs>
          <radialGradient id={`goalGlow-${icon}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill={`url(#goalGlow-${icon})`} />
        <ellipse className={styles.ring} cx="100" cy="100" rx="78" ry="42" />
        <ellipse className={styles.ring} cx="100" cy="100" rx="56" ry="80" />
        <ellipse className={styles.ringDim} cx="100" cy="100" rx="88" ry="66" />
        {/* orbiting nodes */}
        <circle className={styles.node} cx="178" cy="100" r="4" />
        <circle className={styles.node} cx="100" cy="20" r="3" />
        <circle className={styles.nodeDim} cx="44" cy="150" r="3" />
        <circle className={styles.nodeDim} cx="150" cy="170" r="2.5" />
      </svg>
      <span className={styles.core}>
        <Icon name={icon} className={styles.glyph} />
      </span>
    </div>
  );
}
