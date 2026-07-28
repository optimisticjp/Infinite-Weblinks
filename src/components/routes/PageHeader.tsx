import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/primitives/Breadcrumbs";
import styles from "./PageHeader.module.css";

type Surface = "light" | "alt" | "night";

// V2 tone name → V3 theme class. Names are kept (used across many page headers) but now resolve to
// the DARK surfaces under the V3 flip: `light` is the deep base canvas, `alt` the alternating deep
// band, `night` the deepest signature surface (already dark). A `light` header is DARK.
const SURFACE_CLASS: Record<Surface, string> = {
  light: "theme-deep",
  alt: "theme-deep-alt",
  night: "theme-night",
};

interface PageHeaderProps {
  /** Breadcrumb trail after Home (omit on top-level front doors). */
  breadcrumbs?: Crumb[];
  /** Small uppercase kicker (accent-coloured, never gradient text). */
  eyebrow?: string;
  /** The page H1 — plain server-rendered text (the LCP element, never motion-gated). */
  title: ReactNode;
  /** Supporting line under the H1. */
  lead?: ReactNode;
  /** Primary/secondary actions (V2 Buttons). */
  actions?: ReactNode;
  /** Optional short trust note or badge under the actions. */
  trustNote?: ReactNode;
  /** Optional visual (product mockup, card group, restrained diagram). Decorative; the caller
   *  makes it aria-hidden where appropriate. On mobile it renders AFTER the copy + CTA. */
  aside?: ReactNode;
  /** Surface tone (V2 names, now V3-dark). `light` (default) → deep base canvas; `night` → the
   *  deepest signature surface. Every value renders dark under V3. */
  surface?: Surface;
  /** The one restrained accent (eyebrow colour). Defaults to the theme link colour, which is
   *  always accessible; pass an accent only if it clears AA on the chosen surface. */
  accent?: string;
  /** Vertical rhythm. */
  spacing?: "standard" | "compact";
  id?: string;
  /** Labelled-by id for the H1. Defaults to `${id}-heading`. */
  headingId?: string;
  className?: string;
}

/**
 * PageHeader — the V2 light-first page opener (the replacement target for CosmicPageHero /
 * PageHero). One content-driven band carrying an optional breadcrumb, an accent eyebrow, the
 * page H1 as server-rendered text, a lead, actions, an optional trust note, and an optional
 * controlled-width aside. No cosmic background, starfield, globe, node-orb, full-screen wash,
 * gradient heading text or forced 100vh. Server Component; the H1 paints immediately and is
 * the section's single semantic heading.
 */
export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  actions,
  trustNote,
  aside,
  surface = "light",
  accent,
  spacing = "standard",
  id = "page",
  headingId,
  className,
}: PageHeaderProps) {
  const hId = headingId ?? `${id}-heading`;
  const sectionClass = [
    SURFACE_CLASS[surface],
    styles.header,
    spacing === "compact" ? styles.compact : "",
    aside ? styles.split : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      className={sectionClass}
      aria-labelledby={hId}
      style={accent ? { ["--ph-accent" as string]: accent } : undefined}
    >
      <div className={`iw-container iw-container--wide ${styles.inner}`}>
        <div className={styles.copy}>
          {breadcrumbs ? <Breadcrumbs trail={breadcrumbs} /> : null}
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 id={hId} className={styles.title}>
            {title}
          </h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
          {trustNote ? <p className={styles.trustNote}>{trustNote}</p> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}
