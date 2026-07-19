import type { ReactNode } from "react";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import styles from "./SectionShell.module.css";

type SectionShellProps = {
  children: ReactNode;
  /** DOM id for the section (used for in-page anchors). */
  id?: string;
  /** Small uppercase kicker above the title; rendered in the brand gradient. */
  eyebrow?: ReactNode;
  /** Section title. Pass a node so a word can be wrapped in `.iw-gradient-word`. */
  title?: ReactNode;
  /** Heading level for the title — 1 for a page hero, 2 elsewhere. */
  titleLevel?: 1 | 2;
  /** Supporting line under the title. */
  lead?: ReactNode;
  /** When there is no built-in title, point the section's label at an existing id. */
  labelledBy?: string;
  /** Cosmic deep-space background: `true` for aurora + stars, `"horizon"` to add the globe. */
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
 * SectionShell — the reusable section wrapper for the Constellation system. It owns the
 * cosmic surface (`.theme-cosmic`), the optional deep-space background layer, consistent
 * vertical rhythm, and an optional header (eyebrow + gradient-capable title + lead). Page
 * content is passed as children and rendered inside the container, below the header.
 *
 * Accessibility: when a `title` is provided the section is labelled by that heading; a
 * headingless section must pass `labelledBy` so the landmark still has an accessible name.
 */
export function SectionShell({
  children,
  id,
  eyebrow,
  title,
  titleLevel = 2,
  lead,
  labelledBy,
  background = false,
  align = "center",
  container = "wide",
  spacing = "default",
  className,
  contentClassName,
}: SectionShellProps) {
  const headingId = title ? (id ? `${id}-title` : "section-title") : undefined;
  const Heading = (titleLevel === 1 ? "h1" : "h2") as "h1" | "h2";

  const sectionClass = [
    "theme-cosmic",
    "iw-section",
    spacing === "tight" ? "iw-section--tight" : spacing === "loose" ? "iw-section--loose" : "",
    styles.section,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Base `iw-container` stays on the same token as the `--wide` modifier so the modifier is
  // never emitted alone (see container-contract.test.ts — a modifier-only container loses its
  // gutter + centring and goes flush to the viewport edge).
  const containerClass = [
    container === "wide" ? "iw-container iw-container--wide" : "iw-container",
    styles.inner,
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={sectionClass} aria-labelledby={headingId ?? labelledBy}>
      {background ? <CosmicBackground horizon={background === "horizon"} /> : null}
      <div className={containerClass}>
        {title || eyebrow || lead ? (
          <header className={[styles.head, align === "center" ? styles.center : styles.start].join(" ")}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
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
