import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { getLegalPage } from "@/lib/content";
import styles from "./LegalPageView.module.css";

/** Stable, readable anchor id from a block heading. */
function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Shared renderer for the legal pages (privacy / cookies / terms / refunds / accessibility).
 * Content is status-gated, code-authoritative seed data; if a page isn't renderable it 404s
 * rather than showing an empty shell.
 *
 * These are deliberately a QUIET reading surface: the V2 "Clear Systems" light band
 * (`.theme-light`, no starfield, globe or decorative wash), a comfortable measure, and a
 * clear heading hierarchy, so long legal copy stays legible. On longer pages a sticky table
 * of contents rides alongside the text. The `reviewNote` is surfaced as a visible editorial
 * notice so the draft wording is never mistaken for finalised legal terms.
 */
export async function LegalPageView({ slug }: { slug: string }) {
  const page = await getLegalPage(slug);
  if (!page) notFound();

  const toc = page.blocks
    .filter((b) => b.heading)
    .map((b) => ({ id: slugify(b.heading as string), label: b.heading as string }));
  const showToc = toc.length >= 4;

  return (
    <section className={`theme-light iw-section ${styles.page}`} aria-labelledby="legal-heading">
      <div className={`iw-container ${styles.container}`}>
        <header className={styles.header}>
          <Breadcrumbs trail={[{ name: page.title }]} />
          <p className={styles.eyebrow}>Legal</p>
          <h1 id="legal-heading" className={styles.title}>
            {page.title}
          </h1>
          <p className={styles.intro}>{page.intro}</p>
          <p className={styles.updated}>Last updated: {page.updated}</p>
          {/* Review state is driven by the EXPLICIT `legalReviewStatus`, never inferred from the
              render status. Drafts carry a visible, accessible notice; a professionally-reviewed page
              (owner-confirmed only) states that plainly instead. */}
          {page.legalReviewStatus === "professionallyReviewed" ? (
            <p className={styles.reviewNote} role="note">
              <Info aria-hidden="true" className={styles.reviewIcon} />
              <span>
                <span className="iw-visually-hidden">Legal review status: </span>
                Professionally reviewed
                {page.reviewedAt ? ` (${page.reviewedAt})` : ""}.
              </span>
            </p>
          ) : (
            <p className={styles.reviewNote} role="note">
              <Info aria-hidden="true" className={styles.reviewIcon} />
              <span>
                <span className="iw-visually-hidden">Legal review status: </span>
                {page.reviewNote ?? "Draft — requires professional legal review before launch."}
              </span>
            </p>
          )}
        </header>

        <div className={showToc ? styles.layout : undefined}>
          {showToc && (
            <nav className={styles.toc} aria-label="On this page">
              <p className={styles.tocTitle}>On this page</p>
              <ol className={styles.tocList}>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={styles.tocLink}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className={styles.body}>
            {page.blocks.map((block, i) => {
              const id = block.heading ? slugify(block.heading) : undefined;
              return (
                <div key={i} id={id} className={styles.block}>
                  {block.heading && <h2 className={styles.blockHeading}>{block.heading}</h2>}
                  {block.paragraphs.map((p, j) => (
                    <p key={j} className={styles.para}>
                      {p}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
