import type { ReactNode } from "react";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import { Breadcrumbs, type Crumb } from "@/components/primitives/Breadcrumbs";
import styles from "./CosmicPageHero.module.css";

interface CosmicPageHeroProps {
  /** Breadcrumb trail after Home (omit on the top-level front doors). */
  breadcrumbs?: Crumb[];
  /** Small uppercase kicker, tinted in the page's wayfinding hue. */
  eyebrow?: string;
  /** Wayfinding hue for the eyebrow + ambient glow. Defaults to brand violet. */
  hue?: string;
  /** The page H1 — plain server-rendered text, so it's the LCP element. Pass a node so a
   *  word can be wrapped in <span className="iw-gradient-word">. */
  title: ReactNode;
  /** Supporting line under the H1. */
  lead?: ReactNode;
  /** Primary/secondary CTAs (GlowButtons). */
  actions?: ReactNode;
  /** Optional visual (NodeOrb / InfinityMark / mark). When present the hero splits copy-left,
   *  visual-right on wide screens; the visual must be decorative (aria-hidden by the caller). */
  aside?: ReactNode;
  /** DOM id for the hero section. */
  id?: string;
  /** Labelled-by id for the H1. Defaults to `${id ?? "page"}-heading`. */
  headingId?: string;
}

/**
 * CosmicPageHero — the shared Constellation page opener for the router/story routes. One dark
 * cosmic band (`theme-cosmic` + horizon background) carrying an optional breadcrumb, a
 * hue-tinted eyebrow, the page H1 as server-rendered text (the LCP element — never gated
 * behind motion), a lead, CTAs, and an optional decorative visual. It standardises the hero
 * that the domain template, contact and growth-plan each hand-rolled, so every route reads as
 * a sibling. Server Component; the H1 paints immediately.
 */
export function CosmicPageHero({
  breadcrumbs,
  eyebrow,
  hue = "var(--violet)",
  title,
  lead,
  actions,
  aside,
  id = "hero",
  headingId,
}: CosmicPageHeroProps) {
  const hId = headingId ?? `${id}-heading`;
  return (
    <section
      id={id}
      className={`theme-cosmic iw-section ${styles.hero}`}
      aria-labelledby={hId}
      style={{ ["--hue" as string]: hue }}
    >
      <CosmicBackground horizon />
      <div className={`iw-container iw-container--wide ${styles.inner} ${aside ? styles.split : ""}`}>
        <div className={styles.copy}>
          {breadcrumbs ? <Breadcrumbs trail={breadcrumbs} /> : null}
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 id={hId} className={styles.title}>
            {title}
          </h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}
