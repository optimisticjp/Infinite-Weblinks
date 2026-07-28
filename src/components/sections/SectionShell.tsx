import { useId, type ReactNode } from "react";
import styles from "./SectionShell.module.css";

/**
 * Section surface. The tone NAMES are kept from V2 (they are used at 90+ call sites, so renaming
 * ripples too far — see the map note), but under the V3 "Instrument" flip they now resolve to the
 * DARK surfaces. So, spelled out to defuse the misleading names: a `light` section is DARK.
 *   `light` → theme-deep (the base deep canvas · default)
 *   `alt`   → theme-deep-alt (the alternating deep band)
 *   `night` → theme-night (the deepest signature surface · already dark, unchanged)
 */
type Surface = "light" | "alt" | "night";

// V2 tone name → V3 theme class. `light`/`alt` moved from theme-light/-alt to the dark equivalents
// (this is the change that actually makes the site render dark); `night` was already dark.
const SURFACE_THEME: Record<Surface, string> = {
  light: "theme-deep",
  alt: "theme-deep-alt",
  night: "theme-night",
};

type SectionShellProps = {
  children: ReactNode;
  /** DOM id for the section (used for in-page anchors). */
  id?: string;
  /** Small uppercase kicker above the title (plain accent). */
  eyebrow?: ReactNode;
  /** Section title. */
  title?: ReactNode;
  /** Heading level for the title — 1 for a page hero, 2 elsewhere. */
  titleLevel?: 1 | 2;
  /** Supporting line under the title. */
  lead?: ReactNode;
  /** When there is no built-in title, point the section's label at an existing id. */
  labelledBy?: string;
  /** Accessible name for a headingless section (used only when no title/labelledBy is set). */
  ariaLabel?: string;
  /** Surface tone. Names are V2 heritage but resolve to V3 dark surfaces — `light` (default) is the
   *  deep base canvas, `alt` the alternating deep band, `night` the deepest signature surface. */
  surface?: Surface;
  /** Header alignment. */
  align?: "center" | "start";
  container?: "default" | "wide";
  /** Vertical rhythm. */
  spacing?: "default" | "tight" | "loose";
  className?: string;
  /** Class applied to the inner container (for page-specific grid layouts). */
  contentClassName?: string;
};

/**
 * SectionShell — the reusable V2 section wrapper. It owns the surface theme (light/alt/night), an
 * optional header (eyebrow + title + lead), consistent vertical rhythm, and the container. No
 * cosmic layer.
 *
 * Accessibility: a titled section is labelled by its heading; a headingless section passes
 * `labelledBy` or `ariaLabel` so the landmark still has an accessible name.
 */
export function SectionShell({
  children,
  id,
  eyebrow,
  title,
  titleLevel = 2,
  lead,
  labelledBy,
  ariaLabel,
  surface = "light",
  align = "center",
  container = "wide",
  spacing = "default",
  className,
  contentClassName,
}: SectionShellProps) {
  // Stable, unique heading id via useId (SSR/hydration-safe, never derived from title
  // content). An explicit `id` still yields a readable `${id}-title`; without one, several
  // untitled shells on a page never collide. useId's colons are stripped so the value is a
  // valid CSS/aria id fragment.
  const reactId = useId().replace(/:/g, "");
  const headingId = title ? (id ? `${id}-title` : `section-${reactId}-title`) : undefined;
  const Heading = (titleLevel === 1 ? "h1" : "h2") as "h1" | "h2";

  const sectionClass = [
    SURFACE_THEME[surface],
    "iw-section",
    spacing === "tight" ? "iw-section--tight" : spacing === "loose" ? "iw-section--loose" : "",
    styles.section,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClass = [
    container === "wide" ? "iw-container iw-container--wide" : "iw-container",
    styles.inner,
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      className={sectionClass}
      aria-labelledby={headingId ?? labelledBy}
      aria-label={!headingId && !labelledBy ? ariaLabel : undefined}
    >
      <div className={containerClass}>
        {title || eyebrow || lead ? (
          <header className={[styles.head, align === "center" ? styles.center : styles.start].join(" ")}>
            {eyebrow ? <p className={styles.eyebrowV2}>{eyebrow}</p> : null}
            {title ? (
              <Heading id={headingId} className={styles.title}>
                {title}
              </Heading>
            ) : null}
            {lead ? <p className={styles.lead}>{lead}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
