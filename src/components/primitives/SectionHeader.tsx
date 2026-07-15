import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  eyebrow?: string;
  /** Heading text. Emphasis comes from weight, not colour — gradient text is
      reserved site-wide for the hero H1 and the final CTA headline only. */
  title: ReactNode;
  intro?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  /** Optional right-hand slot: a filter control, a section-level CTA, a count.
      Left empty, the two-slot grid still holds the left alignment consistently —
      which is the point (see the header layout note). */
  aside?: ReactNode;
};

/**
 * Shared section heading — eyebrow + heading + optional intro, with an optional
 * right-hand aside. A two-slot row (text left, aside right) so left-aligned
 * headings sit on a consistent edge instead of stranding a dead column of air.
 * Colours come from the enclosing section theme tokens, so it reads correctly on
 * dark, band and statement.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "start",
  as = "h2",
  id,
  className,
  aside,
}: SectionHeaderProps) {
  const Heading = as;
  return (
    <div
      className={[styles.header, align === "center" ? styles.center : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.headerText}>
        {eyebrow && <p className="iw-eyebrow">{eyebrow}</p>}
        <Heading id={id} className={styles.title}>
          {title}
        </Heading>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
      {aside && <div className={styles.headerAside}>{aside}</div>}
    </div>
  );
}
