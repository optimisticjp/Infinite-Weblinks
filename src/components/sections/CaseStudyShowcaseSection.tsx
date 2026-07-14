import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getCaseStudies } from "@/lib/content";
import styles from "./CaseStudyShowcaseSection.module.css";

/**
 * CaseStudyShowcaseSection (theme-band) — proof is placeholder-gated. Renders
 * nothing at all until case studies are verified, so no empty "coming soon"
 * shell ever ships publicly.
 */
export async function CaseStudyShowcaseSection({ anchorId }: { anchorId?: string }) {
  const caseStudies = await getCaseStudies();
  if (caseStudies.length === 0) return null;

  const [featured, ...rest] = caseStudies;

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section ${styles.section}`}
      aria-labelledby="case-studies-heading"
    >
      <div className="iw-container">
        <SectionHeader
          eyebrow="Case studies"
          id="case-studies-heading"
          title="Real projects, real outcomes"
        />

        <article className={styles.featured}>
          <h3 className={styles.featuredTitle}>
            <Link href={`/case-studies/${featured.slug}`}>{featured.title}</Link>
          </h3>
          {featured.client && <p className={styles.client}>{featured.client}</p>}
          <p className={styles.summary}>{featured.summary}</p>
          <Button
            href={`/case-studies/${featured.slug}`}
            variant="text"
            size="sm"
            iconRight={<ArrowRight aria-hidden="true" size={16} />}
          >
            Read the case study
          </Button>
        </article>

        {rest.length > 0 && (
          <ul className={styles.grid}>
            {rest.map((cs) => (
              <li key={cs.slug} className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <Link href={`/case-studies/${cs.slug}`}>{cs.title}</Link>
                </h3>
                {cs.client && <p className={styles.client}>{cs.client}</p>}
                <p className={styles.cardSummary}>{cs.summary}</p>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.cta}>
          <Button href="/case-studies" variant="secondary">
            See all case studies
          </Button>
        </div>
      </div>
    </section>
  );
}
