import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BuilderExplainer } from "@/components/builder/BuilderExplainer";
import type { HeroContent } from "@/lib/content/types";
import { HeroUniverse } from "./HeroUniverse";
import styles from "./Hero.module.css";

/**
 * Hero — the cinematic connected-universe opening.
 * All copy is server-rendered (SEO/AEO critical); the animated infinity universe is a
 * client island layered over it. The five connected domains are listed as real text
 * below the CTAs, so the message never depends on the animation, and the platform rail
 * shows real, locally-stored brand logos for an illustrative "works with" display
 * (approved integration marks — see public/brand-logos; never partners or endorsements).
 */
export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className={`theme-dark ${styles.hero}`} aria-labelledby="hero-heading">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={`iw-container iw-container--wide ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`iw-eyebrow ${styles.eyebrow}`}>
            <Sparkles className={styles.eyebrowIcon} aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <p className={styles.slogan}>{hero.slogan}</p>
          <h1 id="hero-heading" className={styles.headline}>
            {hero.headline.pre}
            <span className="iw-gradient-text">{hero.headline.accent}</span>
            {hero.headline.post}
          </h1>
          <p className={`iw-lead ${styles.support}`}>{hero.support}</p>

          <div className={styles.ctas}>
            <Button
              href={hero.primaryCta.route}
              variant="primary"
              size="lg"
              iconRight={<ArrowRight aria-hidden="true" />}
            >
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.route}
              variant="secondary"
              size="lg"
              iconLeft={<Compass aria-hidden="true" />}
            >
              {hero.secondaryCta.label}
            </Button>
          </div>

          <BuilderExplainer variant="hero" className={styles.explainer} />

          <p className={styles.reassurance}>{hero.reassurance}</p>

          <div className={styles.areas}>
            <span className={styles.areasLabel}>Connected across</span>
            <ul className={styles.areasList}>
              {hero.areas.map((a) => (
                <li key={a.key} className={styles.areaChip} style={{ ["--dot" as string]: a.color }}>
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <HeroUniverse areas={hero.areas} />
      </div>

      <PlatformRail platforms={hero.platforms} />
    </section>
  );
}

/**
 * Platform rail — the tools your business already uses, as plain text. Neutral framing
 * (never "partners" or "clients"); names are the approved exampleTools from the content.
 */
function PlatformRail({ platforms }: { platforms: HeroContent["platforms"] }) {
  return (
    <div className={styles.railWrap}>
      <div className={`iw-container iw-container--wide ${styles.rail}`}>
        <p className={styles.railLabel}>Works with the tools your business already uses.</p>
        {/* Slow, continuous marquee (brief §P5-05). The visible list is real, labelled text;
            the second copy is aria-hidden so the seamless loop never double-reads to a screen
            reader. Reduced-motion collapses to a single static rail. Pauses on hover/focus. */}
        <div className={styles.railViewport}>
          <div className={styles.railTrack}>
            <ul className={styles.railList} aria-label="Example tools we can connect">
              {platforms.map((p) => (
                <li key={p.slug} className={styles.railItem}>
                  <BrandLogo slug={p.slug} name={p.name} />
                </li>
              ))}
            </ul>
            <ul className={styles.railList} aria-hidden="true">
              {platforms.map((p) => (
                <li key={`dup-${p.slug}`} className={styles.railItem}>
                  <BrandLogo slug={p.slug} name={p.name} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
