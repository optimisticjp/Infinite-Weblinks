import { PageHero } from "@/components/routes/PageHero";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./ProofDetail.module.css";

/**
 * Shared renderer for a single proof record (case study / example). Only reached for
 * Verified / Ready-to-Publish records — the page components 404 anything else, so this
 * never displays placeholder proof. Renders the fields the app type actually carries
 * (title, an optional meta line, summary) plus the standard breadcrumb + CTA.
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: collectionName, path: collectionPath },
          { name: title, path },
        ])}
      />

      <PageHero
        eyebrow="Proof"
        title={title}
        intro={summary}
        breadcrumbs={[{ name: collectionName, path: collectionPath }, { name: title }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build my growth plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="proof-body-heading">
        <div className="iw-container">
          <h2 id="proof-body-heading" className="iw-visually-hidden">
            {title} details
          </h2>
          {meta && <p className={styles.meta}>{meta}</p>}
          <p className={styles.prose}>{summary}</p>
        </div>
      </section>
    </>
  );
}
