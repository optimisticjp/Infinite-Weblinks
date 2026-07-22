import { Fragment, type ReactNode } from "react";
import { Clock } from "lucide-react";
import styles from "./ArticleMetaLine.module.css";

type ArticleMetaLineProps = {
  /** Reading time in minutes (shown only when present). */
  readMinutes?: number;
  /** ISO publication date — a `<time>` is emitted only when it parses to a real date. */
  publishedAt?: string;
  /** Organisation author label. Defaults to "Infinite Weblinks" — never a named individual. */
  authorLabel?: string;
  className?: string;
};

/** Format an ISO date as readable en-GB, keeping the original ISO for the `dateTime` attribute.
 *  Returns null (so the date is safely omitted) when the value doesn't parse to a real date. */
function formatDate(iso: string): { label: string; dateTime: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return { label, dateTime: iso };
}

/**
 * ArticleMetaLine — an inline-safe article meta line (reading time · date · organisation author),
 * built from inline elements only so it can live inside PageHeader's trustNote `<p>`. The reading
 * time shows only when present; a `<time dateTime>` is emitted only for a real, parseable
 * publication date (invalid or absent dates are safely omitted, never invented); the author is
 * always the organisation, never a fabricated individual, and there is no avatar and no "updated"
 * date. Server Component. Restrained decorative icons; accessible middle-dot separators.
 */
export function ArticleMetaLine({
  readMinutes,
  publishedAt,
  authorLabel = "Infinite Weblinks",
  className,
}: ArticleMetaLineProps) {
  const date = publishedAt ? formatDate(publishedAt) : null;

  const parts: ReactNode[] = [];
  if (readMinutes) {
    parts.push(
      <span key="read" className={styles.item}>
        <Clock className={styles.icon} aria-hidden="true" />
        {readMinutes} min read
      </span>,
    );
  }
  if (date) {
    parts.push(
      <time key="date" className={styles.item} dateTime={date.dateTime}>
        {date.label}
      </time>,
    );
  }
  parts.push(
    <span key="author" className={styles.item}>
      By {authorLabel}
    </span>,
  );

  return (
    <span className={[styles.meta, className].filter(Boolean).join(" ")}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
          ) : null}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
