import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { GrowthPlanPreview } from "@/components/routes/GrowthPlanPreview";
import type { HeroContent } from "@/lib/content/types";
import styles from "./HomepageHeroSection.module.css";

/**
 * HomepageHeroSection — the V2 light-first homepage hero. All copy is server-rendered from the
 * existing HeroContent (unchanged): eyebrow, slogan, the complete headline in original word order,
 * support, reassurance, both CTAs, all five connected areas, and the works-with rail with every
 * example platform in source order. A restrained two-column layout — copy first in the DOM and
 * visually, the static GrowthPlanPreview alongside/below — with no background canvas, HeroUniverse,
 * starfield, InfinityMark bloom, ambient animation, gradient H1 or full-screen minimum height.
 * Server Component; the H1 and all hero copy do not depend on JavaScript.
 */
export function HomepageHeroSection({ hero }: { hero: HeroContent }) {
  return (
    <section className={`theme-light ${styles.hero}`} aria-labelledby="hero-heading">
      <div className={`iw-container iw-container--wide ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <p className={styles.slogan}>{hero.slogan}</p>
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

          <p className={styles.reassurance}>{hero.reassurance}</p>

          <div className={styles.areas}>
            <span className={styles.areasLabel}>Connected across</span>
            <ul className={styles.areasList}>
              {hero.areas.map((a) => (
                <li key={a.key} className={styles.areaChip}>
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.aside}>
          <GrowthPlanPreview />
        </div>
      </div>

      <PlatformRail platforms={hero.platforms} />
    </section>
  );
}

/**
 * Works-with rail — real, locally-stored full-colour brand logos on light tiles, with the existing
 * neutral label and a visible non-endorsement clarification. No marquee, auto-scroll or logo
 * animation; the list has an accessible name and each logo carries its brand name.
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
