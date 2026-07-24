import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { Button } from "@/components/primitives/Button";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import styles from "./ProofDetail.module.css";

/**
 * ProofDetail — the shared V2 renderer for a single proof record (case study / example). Only ever
 * reached for a Verified / Ready-to-Publish record — the page components 404 everything else, so this
 * never displays placeholder proof. It renders exactly the fields the app type carries (title, an
 * optional meta line, summary) with honest framing, and nothing invented. Light-first: a PageHeader
 * (its Breadcrumbs emits the single Home → collection → title BreadcrumbList), a restrained light
 * content surface, and the reserved-night FinalCtaSection. No cosmic hero, theme-band, glow, Review or
 * AggregateRating schema.
 */
export function ProofDetail({
  collectionName,
  collectionPath,
  title,
  path,
  summary,
  meta,
}: {
  collectionName: string;
  collectionPath: string;
  title: string;
  path: string;
  summary: string;
  meta?: string;
}) {
  return (
    <>
      <PageHeader
        id="proof-hero"
        surface="light"
        breadcrumbs={[
          { name: collectionName, path: collectionPath },
          { name: title, path },
        ]}
        eyebrow="Proof"
        title={title}
        lead={summary}
        actions={
          <Button href="/growth-plan" variant="signature" size="lg">
            Build my growth plan
          </Button>
        }
      />

      <SectionShell surface="light" id="proof-body" ariaLabel={`${title} details`} spacing="tight">
        <div className={styles.body}>
          {meta ? <p className={styles.meta}>{meta}</p> : null}
          <p className={styles.prose}>{summary}</p>
        </div>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Want a plan like this for your business?"
        lead="Tell us where you are and what you want to achieve, and we'll map what to build first and what to connect next."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
