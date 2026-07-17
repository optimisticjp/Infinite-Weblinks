import styles from "./InfinityMark.module.css";

type InfinityMarkProps = {
  /** Rendered width in px (height follows the 2:1 sprite ratio). */
  size?: number;
  /** Soft radial glow behind the mark. A faked gradient, never a per-frame blur —
      the one true bloom pass is reserved for the hero (CLAUDE.md). */
  glow?: boolean;
  className?: string;
};

/**
 * InfinityMark — the Signature Crossover, reused everywhere from the global BrandSprite
 * symbol (`#iw-infinity`). The crossover point (where one strand passes under the other)
 * is the most on-brand pixel on the site, so this is the recurring hero object of every
 * connected-system visual. Decorative; always paired with real text elsewhere.
 */
export function InfinityMark({ size = 120, glow = true, className }: InfinityMarkProps) {
  return (
    <span
      className={[styles.mark, glow ? styles.glow : "", className].filter(Boolean).join(" ")}
      style={{ ["--mark-w" as string]: `${size}px` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 50" width={size} height={size / 2} className={styles.svg}>
        <use href="#iw-infinity" width="100" height="50" />
      </svg>
    </span>
  );
}
