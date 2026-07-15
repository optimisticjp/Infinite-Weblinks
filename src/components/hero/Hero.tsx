import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import type { HeroContent } from "@/lib/content/types";
import { HeroUniverse } from "./HeroUniverse";
import styles from "./Hero.module.css";

/**
 * Hero — the connected-universe opening.
 * Copy is server-rendered (SEO/AEO critical); the animated infinity universe is a
 * client island layered over it. The six connected areas are also listed as real
 * text below the CTAs, so the message never depends on the animation.
 */
export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className={`theme-dark ${styles.hero}`} aria-labelledby="hero-heading">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`iw-container iw-container--wide ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`iw-eyebrow ${styles.eyebrow}`}>{hero.eyebrow}</p>
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
    </section>
  );
}
