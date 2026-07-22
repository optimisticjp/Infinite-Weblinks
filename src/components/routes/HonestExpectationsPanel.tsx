import { X, Check } from "lucide-react";
import {
  honestExpectationsWont,
  honestExpectationsPromise,
} from "@/lib/content/data/honest-expectations";
import styles from "./HonestExpectationsPanel.module.css";

type Level = 3 | 4;

/**
 * HonestExpectationsPanel — the reusable "what we won't do / what we do promise" presentation,
 * reading the CENTRALISED honest-expectations data (no duplicated local arrays). It has NO
 * <section> root and NO H1, so it composes inside a SectionShell (/about) or under an existing
 * heading (the homepage trust subsection). An optional visible heading + intro sit above two
 * semantic lists; meaning is carried by the text AND the X/check icons, never colour alone. No
 * NodeOrb, glowing panel or gradient heading.
 *
 * `columnLevel` sets the heading level of the two column titles (default 4, for the homepage
 * subsection under an H3); /about passes 3 so the columns sit correctly under the section's H2.
 * The optional panel `heading` renders one level above the columns.
 */
export function HonestExpectationsPanel({
  id,
  heading,
  intro,
  columnLevel = 4,
  className,
}: {
  id?: string;
  heading?: string;
  intro?: string;
  columnLevel?: Level;
  className?: string;
}) {
  const ColHeading = `h${columnLevel}` as "h3" | "h4";
  const LeadHeading = `h${columnLevel - 1}` as "h2" | "h3";

  return (
    <div id={id} className={[styles.root, className].filter(Boolean).join(" ")}>
      {heading ? <LeadHeading className={styles.heading}>{heading}</LeadHeading> : null}
      {intro ? <p className={styles.lead}>{intro}</p> : null}

      <div className={styles.grid}>
        <div className={styles.col}>
          <ColHeading className={styles.colHeading}>What we won&apos;t do</ColHeading>
          <ul className={styles.list}>
            {honestExpectationsWont.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={`${styles.icon} ${styles.wontIcon}`} aria-hidden="true">
                  <X size={15} strokeWidth={2.5} />
                </span>
                <span className={styles.text}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemBody}>{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <ColHeading className={styles.colHeading}>What we do promise</ColHeading>
          <ul className={styles.list}>
            {honestExpectationsPromise.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={`${styles.icon} ${styles.promiseIcon}`} aria-hidden="true">
                  <Check size={15} strokeWidth={2.5} />
                </span>
                <span className={styles.text}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemBody}>{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
