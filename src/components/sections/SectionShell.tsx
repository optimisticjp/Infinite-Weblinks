import { useId, type ReactNode } from "react";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import styles from "./SectionShell.module.css";

/**
 * Section surface.
 * - `legacy` (default): the existing Constellation behaviour — `.theme-cosmic`, the optional
 *   CosmicBackground layer, and the gradient eyebrow. Unchanged, so current callers are
 *   byte-identical. (The cosmic `background` options are DEPRECATED for new V2 use.)
 * - `light` / `alt` / `night`: V2 surfaces — no cosmic layer, no gradient eyebrow.
 *
 * The default stays `legacy` during the phased migration; it becomes `light` only at final
 * convergence, once every consumer has migrated.
 */
type Surface = "legacy" | "light" | "alt" | "night";

const SURFACE_THEME: Record<Surface, string> = {
  legacy: "theme-cosmic",
  light: "theme-light",
  alt: "theme-light-alt",
  night: "theme-night",
};

type SectionShellProps = {
  children: ReactNode;
  /** DOM id for the section (used for in-page anchors). */
  id?: string;
  /** Small uppercase kicker above the title. Gradient on `legacy`; plain accent on V2. */
  eyebrow?: ReactNode;
  /** Section title. Pass a node so a word can be wrapped in `.iw-gradient-word` (legacy only). */
  title?: ReactNode;
  /** Heading level for the title — 1 for a page hero, 2 elsewhere. */
  titleLevel?: 1 | 2;
  /** Supporting line under the title. */
  lead?: ReactNode;
  /** When there is no built-in title, point the section's label at an existing id. */
  labelledBy?: string;
  /** Accessible name for a headingless section (used only when no title/labelledBy is set). */
  ariaLabel?: string;
  /** V2 surface. Defaults to `legacy` (current behaviour). */
  surface?: Surface;
  /** Cosmic deep-space background — LEGACY ONLY. Ignored on V2 surfaces. */
  background?: boolean | "horizon";
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
 * SectionShell — the reusable section wrapper. It owns the surface theme, an optional header
 * (eyebrow + title + lead), consistent vertical rhythm, and the container. On `legacy` it
 * keeps the Constellation cosmic surface + optional deep-space background; on the V2 surfaces
 * it renders a clean light/alt/night band with no cosmic layer.
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
  surface = "legacy",
  background = false,
  align = "center",
  container = "wide",
  spacing = "default",
  className,
  contentClassName,
}: SectionShellProps) {
  const isV2 = surface !== "legacy";
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
    surface === "legacy" ? styles.legacyClip : "",
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
      {/* Cosmic background is legacy-only and never rendered on V2 surfaces. */}
      {surface === "legacy" && background ? (
        <CosmicBackground horizon={background === "horizon"} />
      ) : null}
      <div className={containerClass}>
        {title || eyebrow || lead ? (
          <header className={[styles.head, align === "center" ? styles.center : styles.start].join(" ")}>
            {eyebrow ? (
              <p className={isV2 ? styles.eyebrowV2 : styles.eyebrow}>{eyebrow}</p>
            ) : null}
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
