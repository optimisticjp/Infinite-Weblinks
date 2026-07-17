import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/primitives/Breadcrumbs";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  /** Breadcrumb trail *after* Home (Home is added automatically). */
  breadcrumbs?: Crumb[];
  /** Optional actions row (CTAs) rendered under the intro. */
  actions?: ReactNode;
  /** Optional aside rendered to the right on wide screens (e.g. a category tile, a mark). */
  aside?: ReactNode;
  align?: "start" | "center";
  /** Accent hue for the eyebrow + ambient glow. Lets a category/goal page tint its own
      header. Defaults to the brand violet. Never gradient text — that stays reserved for
      the homepage hero and the final CTA. */
  accent?: string;
};

/**
 * Shared route header — a premium dark cosmic band sitting directly under the sticky site
 * header. Consistent breadcrumb + eyebrow + H1 + intro for every listing and detail page,
 * so the whole site shares one page-opening rhythm. The H1 owns the brightest value in the
 * band (light budget); the ambient starfield + accent glow behind it run far quieter. Reads
 * the section theme tokens, so it stays correct if ever placed on a non-dark surface.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  actions,
  aside,
  align = "start",
  accent = "var(--violet)",
}: PageHeroProps) {
  return (
    <section
      className={`theme-dark ${styles.hero} ${align === "center" ? styles.center : ""}`}
      aria-labelledby="page-hero-title"
      style={{ ["--hero-accent" as string]: accent }}
    >
      <span className={styles.field} aria-hidden="true" />
      <div className="iw-container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className={styles.crumbs}>
            <Breadcrumbs trail={breadcrumbs} />
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.lead}>
            {eyebrow && <p className={`iw-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
            <h1 id="page-hero-title" className={styles.title}>
              {title}
            </h1>
            {intro && <p className={styles.intro}>{intro}</p>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
      </div>
    </section>
  );
}
