import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PlanPanel } from "@/components/routes/PlanPanel";
import { growthPlanHeroTrustPoints } from "@/lib/content/data/growth-plan";
import type { HeroContent } from "@/lib/content/types";
import styles from "./HomepageHeroSection.module.css";

/**
 * HomepageHeroSection — the V3 "Instrument" homepage hero: a split layout on a deep surface. The
 * left column carries all the copy that does not depend on JavaScript (eyebrow, the complete H1 in
 * original word order, the supporting line, both CTAs and the reassurance line); the right column
 * is the server-rendered <PlanPanel> — the reused product-surface mockup showing the real growth-plan
 * engine output, with its floating cards.
 *
 * Source order is deliberate: the copy column (and therefore the CTAs) comes first in the DOM, so
 * when the grid collapses to one column on mobile the primary action sits ABOVE the tall plan panel
 * rather than being pushed below the fold by it.
 *
 * The H1 is the LCP element and is plain server HTML (no gradient, no canvas, no animation gating it).
 * The PlanPanel's markup ships in the HTML too; its entrance animation lives in a thin client wrapper
 * that reveals in place, and its floating cards are absolutely positioned (out of flow → no CLS).
 * Server Component.
 */
export function HomepageHeroSection({ hero }: { hero: HeroContent }) {
  return (
    <section className={`theme-deep ${styles.hero}`} aria-labelledby="hero-heading">
      <div className={`iw-container iw-container--wide ${styles.grid}`}>
        {/* Copy column — FIRST in source order so the CTAs land above the plan panel on mobile. */}
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 id="hero-heading" className={styles.headline}>
            {hero.headline.pre}
            <span className={styles.accent}>{hero.headline.accent}</span>
            {hero.headline.post}
          </h1>
          <p className={styles.support}>{hero.support}</p>

          <div className={styles.ctas}>
            <Button href={hero.primaryCta.route} size="lg" iconRight={<ArrowRight aria-hidden="true" />}>
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.route} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>

          {/* "Takes a few minutes · no sign-up, no cost" — the approved growth-plan reassurances,
              read from the content layer (never hard-coded) so they stay in step with /growth-plan. */}
          <ul className={styles.trust} aria-label="What to expect">
            {growthPlanHeroTrustPoints.map((point) => (
              <li key={point} className={styles.trustItem}>
                <Check className={styles.trustIcon} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plan panel — server-rendered, SECOND in source order (below the CTAs when stacked). */}
        <div className={styles.aside}>
          <PlanPanel />
        </div>
      </div>

      <PlatformRail platforms={hero.platforms} />
    </section>
  );
}

/**
 * Works-with rail — real, locally-stored full-colour brand logos on raised tiles, with the existing
 * neutral label and a visible non-endorsement clarification. Kept from the previous hero (restyled
 * onto the deep surface via the shared tokens). No marquee, auto-scroll or logo animation; the list
 * has an accessible name and each logo carries its brand name.
 */
function PlatformRail({ platforms }: { platforms: HeroContent["platforms"] }) {
  return (
    <div className={styles.railWrap}>
      <div className={`iw-container iw-container--wide ${styles.rail}`}>
        <p className={styles.railLabel}>Works with the tools your business already uses.</p>
        <ul className={styles.railList} aria-label="Example tools we can connect">
          {platforms.map((p) => (
            <li key={p.slug} className={styles.railItem}>
              <BrandLogo slug={p.slug} name={p.name} className={styles.railLogo} />
            </li>
          ))}
        </ul>
        <p className={styles.railNote}>Examples only. No partnership or endorsement implied.</p>
      </div>
    </div>
  );
}
