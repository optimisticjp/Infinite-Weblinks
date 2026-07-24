import { useId, type ReactNode } from "react";
import styles from "./SectionShell.module.css";

/**
 * Section surface (V2, converged). `light` (default) / `alt` (alternating band) / `night` (the
 * reserved dark signature section). No cosmic layer, no gradient eyebrow — the legacy Constellation
 * surface was removed at Phase 2S convergence once every consumer had migrated.
 */
type Surface = "light" | "alt" | "night";

const SURFACE_THEME: Record<Surface, string> = {
  light: "theme-light",
  alt: "theme-light-alt",
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
  /** V2 surface. Defaults to `light`. */
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
