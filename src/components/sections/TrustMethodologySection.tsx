import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { getTrustNarrative } from "@/lib/content";
import styles from "./TrustMethodologySection.module.css";

/**
 * TrustMethodologySection — "How we work" (theme-band-bright; interim trust layer,
 * review §3/§5/§14, brief §P1-01/§P3-05).
 *
 * The honest stand-in for social proof the business does not yet have: it states method,
 * standards and an ownership-linked promise, with NO fabricated client, quote, metric or
 * partnership. It sits right after the ownership claim and above the (status-gated) proof
 * slots + final CTA, so a sceptical visitor gets a concrete answer to "can you deliver?"
 * before the ask. `theme-band-bright` (not `theme-band`) keeps the homepage's two-cream-band
 * rhythm intact.
 */
export async function TrustMethodologySection({ anchorId }: { anchorId?: string }) {
  const trust = await getTrustNarrative();

  return (
    <section
      id={anchorId}
      className={`theme-band-bright iw-section ${styles.section}`}
      aria-labelledby="how-we-work-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="how-we-work-heading"
          eyebrow={trust.eyebrow}
          title={trust.title}
          intro={trust.lead}
          aside={
            <Button href={trust.secondary.href} variant="secondary" size="sm">
              {trust.secondary.label}
            </Button>
          }
        />

        <ol className={styles.steps}>
          {trust.steps.map((step, i) => (
            <Reveal as="li" key={step.title} className={styles.step} delay={i * 70}>
              <span className={styles.stepNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <ul className={styles.standards} aria-label="Our standards">
          {trust.standards.map((standard, i) => (
            <Reveal as="li" key={standard.title} className={styles.standard} delay={i * 60}>
              <IconTile color={standard.color} variant="outline" size={44}>
                <Icon name={standard.icon} />
              </IconTile>
              <div>
                <h3 className={styles.standardTitle}>{standard.title}</h3>
                <p className={styles.standardBody}>{standard.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className={styles.footerRow}>
          <p className={styles.reassurance}>{trust.reassurance}</p>
          <Button href={trust.cta.href} variant="primary">
            {trust.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
