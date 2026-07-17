import type { Metadata } from "next";
import { ShieldCheck, ArrowDown } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { GlobeArc } from "@/components/viz/GlobeArc";
import { GrowthTroubleshooter } from "@/components/troubleshooter/GrowthTroubleshooter";
import { getTroubleshooterProblems } from "@/lib/content";
import { canonical } from "@/lib/seo/metadata";
import styles from "./troubleshooter.module.css";

// A conversion utility, like the growth-plan builder — crawlable but noindex.
export const metadata: Metadata = {
  title: "Growth Troubleshooter — find where to look first",
  description:
    "Tell us what is not working and we'll show you where to look first — a plain explanation, useful checks and a sensible next step. No email required.",
  alternates: { canonical: canonical("/troubleshooter") },
  robots: { index: false, follow: true },
};

const JOURNEY = [
  { label: "Traffic", icon: "users", broken: false },
  { label: "Website", icon: "monitor", broken: false },
  { label: "Product page", icon: "shopping-bag", broken: false },
  { label: "Checkout", icon: "credit-card", broken: true },
  { label: "Purchase", icon: "check", broken: false },
];

export default async function TroubleshooterPage() {
  const problems = await getTroubleshooterProblems();

  return (
    <>
      <section className={`theme-dark iw-section ${styles.hero}`} aria-labelledby="ts-hero-heading">
        <GlobeArc />
        <div className={`iw-container iw-container--wide ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="iw-eyebrow">The digital growth troubleshooter</p>
            <h1 id="ts-hero-heading" className={styles.heroHeading}>
              Tell us what is not working.
              <br />
              <span className={styles.heroAccent}>We&apos;ll show you where to look first.</span>
            </h1>
            <p className={`iw-lead ${styles.heroLead}`}>
              Choose a business problem and get a simple explanation, useful checks and a sensible next step —
              built around the connected growth journey.
            </p>
            <div className={styles.heroActions}>
              <Button
                href="#ts-select-heading"
                variant="primary"
                size="lg"
                iconRight={<ArrowDown aria-hidden="true" />}
              >
                Diagnose my growth problem
              </Button>
            </div>
            <p className={styles.heroReassure}>
              <ShieldCheck aria-hidden="true" />
              See useful guidance without entering an email address.
            </p>
          </div>

          {/* Decorative journey with one broken link. */}
          <div className={styles.diagram} aria-hidden="true">
            <ul className={styles.diagramRow}>
              {JOURNEY.map((n) => (
                <li key={n.label} className={`${styles.diagramNode} ${n.broken ? styles.broken : ""}`}>
                  <span className={styles.diagramIcon}>
                    <Icon name={n.icon} />
                  </span>
                  <span className={styles.diagramLabel}>{n.label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.diagramNote}>Finding the break. Reconnecting the path.</p>
          </div>
        </div>
      </section>

      <GrowthTroubleshooter problems={problems} />
    </>
  );
}
