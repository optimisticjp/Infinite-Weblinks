import type { Metadata } from "next";
import { MessageSquare, Compass, Lock, Users } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { GlobeArc } from "@/components/viz/GlobeArc";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { ContactForm } from "@/components/forms/ContactForm";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/validation/forms";
import { canonical } from "@/lib/seo/metadata";
import styles from "./contact.module.css";

/**
 * /contact — "Send Us Your Goals". Honours `?subject=growth-goals` (and the other known
 * subjects) to prefill the form. `noindex, follow` per the SEO spec (conversion utility,
 * not evergreen content); the self-canonical to the clean `/contact` URL consolidates
 * every `?subject=` variant onto one indexable target.
 */
export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us where you are and what you want to achieve — we reply by email with a practical next step.",
  robots: { index: false, follow: true },
  alternates: { canonical: canonical("/contact") },
};

function isContactSubject(value: string | undefined): value is ContactSubject {
  return Boolean(value) && (CONTACT_SUBJECTS as readonly string[]).includes(value as string);
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string }>;
}

const TRUST = [
  { icon: MessageSquare, label: "Clear advice", color: "var(--violet)" },
  { icon: Compass, label: "No pressure", color: "var(--pink)" },
  { icon: Lock, label: "Your data stays private", color: "var(--orange)" },
  { icon: Users, label: "Real people review your message", color: "var(--cyan)" },
] as const;

const PINS = [
  { label: "Canada", color: "var(--violet)", x: "9%", y: "44%" },
  { label: "UK", color: "var(--cyan)", x: "41%", y: "28%" },
  { label: "Europe", color: "var(--violet-bright)", x: "54%", y: "50%" },
  { label: "US", color: "var(--pink)", x: "17%", y: "66%" },
  { label: "India", color: "var(--orange)", x: "78%", y: "26%" },
  { label: "Australia", color: "var(--blue)", x: "72%", y: "82%" },
] as const;

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const subject = isContactSubject(params.subject) ? params.subject : undefined;

  return (
    <section className={`theme-dark iw-section ${styles.section}`} aria-labelledby="contact-heading">
      <div className={`iw-container iw-container--wide ${styles.layout}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Let&apos;s connect</p>
          <h1 id="contact-heading" className={styles.heading}>
            Let&apos;s build your next connected step<span className={styles.dot}>.</span>
          </h1>
          <p className={styles.subhead}>
            Tell us where you are and what you want to achieve. We&apos;ll review your situation and
            reply by email with a practical next step.
          </p>

          <ul className={styles.trust}>
            {TRUST.map(({ icon: TrustIcon, label, color }) => (
              <li key={label} className={styles.trustItem}>
                <IconTile color={color} size={40}>
                  <TrustIcon aria-hidden="true" />
                </IconTile>
                <span className={styles.trustLabel}>{label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.visual} aria-hidden="true">
            <GlobeArc />
            <span className={styles.infinity}>
              <InfinityMark size={104} />
            </span>
            <ul className={styles.pins}>
              {PINS.map((pin) => (
                <li
                  key={pin.label}
                  className={styles.pin}
                  style={{ left: pin.x, top: pin.y, ["--pin-color" as string]: pin.color }}
                >
                  <span className={styles.pinDot} />
                  <span className={styles.pinLabel}>{pin.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Card variant="glass" className={styles.formCard}>
          <div className={styles.formHead}>
            <h2 className={styles.formTitle}>Send Us Your Goals</h2>
            <span className={styles.formRule} aria-hidden="true" />
          </div>
          <ContactForm subject={subject} />
        </Card>
      </div>
    </section>
  );
}
