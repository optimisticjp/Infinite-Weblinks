import type { ReactNode } from "react";
import { SectionShell } from "@/components/sections/SectionShell";
import { Button } from "@/components/primitives/Button";
import styles from "./FinalCtaSection.module.css";

type FinalCtaSectionProps = {
  /** DOM id / in-page anchor (e.g. "get-started"). */
  id?: string;
  /** The section heading — rendered as an <h2> (never an <h1>). */
  title: ReactNode;
  /** Supporting line under the heading. */
  lead?: ReactNode;
  /** The signature primary action. */
  primary: { href: string; label: string };
  /** Optional quieter secondary action. */
  secondary?: { href: string; label: string };
  className?: string;
};

/**
 * FinalCtaSection — the reusable V2 closing call-to-action band. A single reserved
 * `theme-night` SectionShell (no cosmic layer, starfield, globe or node-orb): heading, lead,
 * the signature-gradient primary Button and an optional restrained secondary Button. This is
 * the V2 replacement for the per-page duplicated night CTA; the legacy cosmic
 * FinalCtaBannerSection is left untouched for the routes still using it.
 */
export function FinalCtaSection({
  id,
  title,
  lead,
  primary,
  secondary,
  className,
}: FinalCtaSectionProps) {
  return (
    <SectionShell
      surface="night"
      id={id}
      title={title}
      lead={lead}
      align="center"
      spacing="loose"
      className={className}
    >
      <div className={styles.actions}>
        <Button href={primary.href} variant="signature" size="lg">
          {primary.label}
        </Button>
        {secondary ? (
          <Button href={secondary.href} variant="secondary" size="lg">
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </SectionShell>
  );
}
