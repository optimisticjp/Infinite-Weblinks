import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { PhoneFrame } from "@/components/viz/PhoneFrame";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { getCustomerJourney } from "@/lib/content";
import type { CustomerJourneyStep } from "@/lib/content/types";
import styles from "./CustomerJourneySection.module.css";

/**
 * "How everything connects" (ref 15) — one customer followed from discovery to repeat
 * purchase, shown as a connected strip of phone screens. Dark theme. The connecting light
 * path is the one bright element; the phones are ambient until you look at each. Screens
 * are generic interface states (no fabricated brand, price or metric). The horizontal
 * strip scrolls inside its own container and becomes a vertical stack on narrow screens.
 */
export async function CustomerJourneySection({ anchorId }: { anchorId?: string }) {
  const steps = await getCustomerJourney();
  if (steps.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="customer-journey-heading"
    >
      <div className={`iw-container iw-container--wide ${styles.inner}`}>
        <div className={styles.lead}>
          <p className="iw-eyebrow">Customer journey</p>
          <h2 id="customer-journey-heading" className={styles.heading}>
            How everything connects for one customer.
          </h2>
          <p className={`iw-lead ${styles.intro}`}>
            Follow a single customer from the first advert to a repeat purchase. Every step hands off to
            the next — that hand-off is the whole point of a connected system.
          </p>
          <Button href="/how-it-works" variant="primary" iconRight={<ArrowUpRight aria-hidden="true" />}>
            Explore the full journey
          </Button>
        </div>

        {/* tabIndex so the horizontally-scrolling strip is keyboard-operable
            (WCAG 2.1.1 / axe scrollable-region-focusable). */}
        <div className={styles.strip} role="list" tabIndex={0} aria-label="Six connected customer-journey stages">
          {steps.map((step, i) => (
            <div key={step.order} className={styles.stepCol} role="listitem" style={{ ["--accent" as string]: step.color }}>
              <span className={styles.stepBadge} aria-hidden="true">
                {String(step.order).padStart(2, "0")}
              </span>
              <PhoneFrame color={step.color} active={i === 3}>
                <Screen step={step} />
              </PhoneFrame>
              <h3 className={styles.phase}>{step.phase}</h3>
              <p className={styles.caption}>{step.caption}</p>
            </div>
          ))}
          <span className={styles.path} aria-hidden="true" />
          <span className={styles.endMark} aria-hidden="true">
            <InfinityMark size={64} />
          </span>
        </div>
      </div>
    </section>
  );
}

/** A stylised, generic phone screen. Layout varies a little by step kind so the strip
    reads as a real journey, but nothing here is a real brand, price or metric. */
function Screen({ step }: { step: CustomerJourneyStep }) {
  const { screen } = step;
  return (
    <div className={styles.screen} style={{ ["--accent" as string]: step.color }}>
      <div className={styles.screenBar} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.screenBody}>
        <p className={styles.screenHeading}>{screen.heading}</p>
        {screen.kind === "store" || screen.kind === "loyalty" ? (
          <div className={styles.tiles} aria-hidden="true">
            {screen.lines?.map((l) => (
              <span key={l} className={styles.tile}>
                {l}
              </span>
            ))}
          </div>
        ) : (
          <ul className={styles.lines}>
            {screen.lines?.map((l, idx) => (
              <li key={l} className={idx === (screen.lines?.length ?? 0) - 1 ? styles.lineCta : styles.line}>
                {l}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
