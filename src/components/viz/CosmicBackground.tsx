import { GlobeArc } from "./GlobeArc";
import { StarfieldLazy } from "./StarfieldLazy";
import styles from "./CosmicBackground.module.css";

type CosmicBackgroundProps = {
  /** Adds the lit-Earth horizon glow (GlobeArc) along the bottom of the section. */
  horizon?: boolean;
  /** Renders the animated starfield canvas. Off = aurora + horizon only (lighter still). */
  stars?: boolean;
  /** Density passed through to the Starfield (lower = calmer). */
  density?: number;
  className?: string;
};

/**
 * CosmicBackground — the shared deep-space background layer: a soft aurora (CSS radial
 * gradients), an optional capped starfield, and an optional lit horizon. Entirely
 * decorative and aria-hidden; sits behind section content with pointer-events off. Reused
 * across the rebrand wherever a section wants the cosmic canvas.
 */
export function CosmicBackground({
  horizon = false,
  stars = true,
  density,
  className,
}: CosmicBackgroundProps) {
  return (
    <div className={[styles.bg, className].filter(Boolean).join(" ")} aria-hidden="true">
      <div className={styles.aurora} />
      {stars ? <StarfieldLazy density={density} /> : null}
      {horizon ? <GlobeArc className={styles.horizon} /> : null}
    </div>
  );
}
