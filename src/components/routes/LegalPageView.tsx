import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { getLegalPage } from "@/lib/content";
import styles from "./LegalPageView.module.css";

/**
 * Shared renderer for the four legal pages (privacy / cookies / terms / accessibility).
 * Content is status-gated seed data; if a page isn't renderable it 404s rather than
 * showing an empty shell. The `reviewNote` is surfaced as a visible editorial notice so
 * it's never mistaken for finalised legal wording.
 */
export async function LegalPageView({ slug }: { slug: string }) {
  const page = await getLegalPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={page.title}
        intro={page.intro}
        breadcrumbs={[{ name: page.title }]}
      />
      <section className="theme-band iw-section" aria-labelledby="legal-body-heading">
        <div className="iw-container">
          <h2 id="legal-body-heading" className="iw-visually-hidden">
            {page.title} details
          </h2>
          <p className={styles.updated}>Last updated: {page.updated}</p>

          {page.reviewNote && (
            <p className={styles.reviewNote} role="note">
              <Info aria-hidden="true" className={styles.reviewIcon} />
              <span>{page.reviewNote}</span>
            </p>
          )}

          <div className={styles.body}>
            {page.blocks.map((block, i) => (
              <section key={i} className={styles.block}>
                {block.heading && <h3 className={styles.blockHeading}>{block.heading}</h3>}
                {block.paragraphs.map((p, j) => (
                  <p key={j} className={styles.para}>
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
