import { Star } from "lucide-react";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getTestimonials } from "@/lib/content";
import styles from "./TestimonialWallSection.module.css";

/**
 * TestimonialWallSection (theme-band) — proof is placeholder-gated. Renders
 * nothing at all until testimonials are verified, so no fabricated or
 * placeholder quote ever ships publicly.
 */
export async function TestimonialWallSection({ anchorId }: { anchorId?: string }) {
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section iw-section--tight ${styles.section}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="iw-container">
        <SectionHeader
          eyebrow="From clients"
          id="testimonials-heading"
          title="What it's like to work with us"
        />

        <ul className={styles.wall}>
          {testimonials.map((t, i) => (
            <li key={`${t.attribution ?? "testimonial"}-${i}`} className={styles.card}>
              <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
              <div className={styles.foot}>
                {t.attribution && <cite className={styles.attribution}>{t.attribution}</cite>}
                {typeof t.rating === "number" && (
                  <span className={styles.rating} aria-label={`Rated ${t.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        aria-hidden="true"
                        size={16}
                        className={starIndex < t.rating! ? styles.starFilled : styles.starEmpty}
                      />
                    ))}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
