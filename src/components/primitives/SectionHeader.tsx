import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  eyebrow?: string;
  /** Heading text; wrap the emphasised word in `accent`. */
  title: ReactNode;
  intro?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

/**
 * Shared section heading — eyebrow + heading + optional intro. Colours come from the
 * enclosing section theme tokens, so it reads correctly on dark, band and statement.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "start",
  as = "h2",
  id,
  className,
}: SectionHeaderProps) {
  const Heading = as;
  return (
    <div
      className={[styles.header, align === "center" ? styles.center : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow && <p className="iw-eyebrow">{eyebrow}</p>}
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  );
}
