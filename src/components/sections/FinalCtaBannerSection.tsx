import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import styles from "./FinalCtaBannerSection.module.css";

/**
 * FinalCtaBannerSection — the closing conversion banner (theme-statement).
 * Email-led conversion only: no "Book a Call", no phone number. The support
 * email is a visible fallback beneath the primary action, never the primary
 * action itself.
 */
export async function FinalCtaBannerSection({ anchorId }: { anchorId?: string }) {
  return (
    <section
      id={anchorId}
      className={`theme-statement iw-section ${styles.section}`}
      aria-labelledby="final-cta-heading"
    >
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className="iw-container">
        <div className={styles.inner}>
          <SectionHeader
            align="center"
            eyebrow="Ready when you are"
            id="final-cta-heading"
            title="Build your digital growth plan, one connected step at a time"
            intro="Answer a few questions about your business and your goal, and we'll map out what to build first, what to connect next, and what can safely wait."
            className={styles.header}
          />

          <div className={styles.ctas}>
            <Button
              href="/growth-plan"
              variant="primary"
              size="lg"
              iconRight={<ArrowRight aria-hidden="true" />}
            >
              Build My Digital Growth Plan
            </Button>
            <Button
              href="/how-it-works"
              variant="secondary"
              size="lg"
              iconLeft={<Compass aria-hidden="true" />}
            >
              See How It All Works
            </Button>
          </div>

          <p className={styles.fallback}>
            Prefer email? Reach us any time at{" "}
            <a href="mailto:support@infiniteweblinks.com" className={styles.fallbackLink}>
              support@infiniteweblinks.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
