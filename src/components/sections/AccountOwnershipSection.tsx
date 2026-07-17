import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { getAccountOwnership } from "@/lib/content";
import styles from "./AccountOwnershipSection.module.css";

/**
 * "Your digital world, owned by you" (ref 13). The load-bearing ownership promise: we
 * build and connect everything in your name. Dark theme. The lit vault panel owns the
 * section's brightest value; the flow and guarantees run as ambient support. The closing
 * emphasis uses a solid accent word, not gradient text (reserved site-wide for the hero
 * and the final CTA only).
 */
export async function AccountOwnershipSection({ anchorId }: { anchorId?: string }) {
  const data = await getAccountOwnership();

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="ownership-heading"
    >
      <div className={`iw-container iw-container--wide ${styles.inner}`}>
        <div className={styles.head}>
          <p className="iw-eyebrow">{data.eyebrow}</p>
          <h2 id="ownership-heading" className={styles.heading}>
            {data.heading.pre}
            <span className={styles.accent}>{data.heading.accent}</span>
            {data.heading.post}
          </h2>
          <p className={`iw-lead ${styles.body}`}>{data.body}</p>
        </div>

        <div className={styles.stage}>
          {/* The lit vault — your business, owned and controlled by you. */}
          <div className={styles.vault}>
            <p className={styles.vaultLabel}>
              <Icon name="shield" />
              {data.vaultLabel}
            </p>
            <ul className={styles.assets}>
              {data.assets.map((a) => (
                <li key={a.label} className={styles.asset}>
                  <span className={styles.assetIcon} aria-hidden="true">
                    <Icon name={a.icon} />
                  </span>
                  {a.label}
                </li>
              ))}
            </ul>
            <p className={styles.owned}>Owned and controlled by you</p>
          </div>

          {/* The connect flow — plan → build → connect → support. */}
          <ol className={styles.flow} aria-label="How we build and connect your systems">
            {data.flow.map((s, i) => (
              <li key={s.label} className={styles.flowStep} style={{ ["--accent" as string]: s.color }}>
                <span className={styles.flowIcon} aria-hidden="true">
                  <Icon name={s.icon} />
                </span>
                <span className={styles.flowLabel}>{s.label}</span>
                {i < data.flow.length - 1 ? (
                  <ArrowRight className={styles.flowArrow} aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <ul className={styles.guarantees}>
          {data.guarantees.map((g, i) => (
            <li key={g.title} className={styles.guarantee} style={{ ["--accent" as string]: g.color }}>
              <span className={styles.gIcon} aria-hidden="true">
                <Icon name={g.icon} />
              </span>
              <div>
                <p className={styles.gTitle}>
                  <span className={styles.gNum} aria-hidden="true">
                    {i + 1}.
                  </span>
                  {g.title}
                </p>
                <p className={styles.gBody}>{g.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.closing}>
          <p className={styles.closingHeading}>
            {data.closing.pre}
            <span className={styles.accent}>{data.closing.accent}</span>
            {data.closing.post}
          </p>
          <div className={styles.ctas}>
            <Button href={data.primaryCta.route} variant="primary" size="lg" iconRight={<ArrowRight aria-hidden="true" />}>
              {data.primaryCta.label}
            </Button>
            <Button href={data.secondaryCta.route} variant="secondary" size="lg" iconRight={<ArrowUpRight aria-hidden="true" />}>
              {data.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
