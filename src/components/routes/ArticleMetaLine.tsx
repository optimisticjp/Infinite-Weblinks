import { Fragment, type ReactNode } from "react";
import { Clock } from "lucide-react";
import styles from "./ArticleMetaLine.module.css";

type ArticleMetaLineProps = {
  /** Reading time in minutes (shown only when present). */
  readMinutes?: number;
  /** Publication date — a strict `YYYY-MM-DD` calendar date, or an RFC3339/ISO timestamp with an
   *  explicit timezone. A `<time>` is emitted only when it validates; anything else is omitted. */
  publishedAt?: string;
  /** Organisation author label. Defaults to "Infinite Weblinks" — never a named individual. */
  authorLabel?: string;
  className?: string;
};

/** Strict date-only form: a zero-padded `YYYY-MM-DD` and nothing else. */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
/** RFC3339 / ISO date-time that MUST carry an explicit timezone — `Z` or a numeric `±HH:MM`
 *  offset. Seconds and a fractional part are optional; a naive local timestamp (no offset) is
 *  deliberately NOT matched, so it is rejected rather than guessed. */
const DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/;

/**
 * Validate a real calendar date and return the equivalent UTC `Date`, or null. Rejects an
 * impossible day (2025-02-30), a non-leap 29 February, and any value JS would silently roll
 * over into a different calendar date — by round-tripping the components through `Date.UTC` and
 * confirming they survive unchanged. (Years < 100 hit JS's two-digit-year legacy mapping and so
 * fail this round-trip; that is a safe rejection — no real publication date predates year 100.)
 */
function calendarDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return dt;
}

/** The written calendar date as readable en-GB, formatted in UTC so a date-only value never
 *  drifts a day across timezones. */
function labelFor(dt: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

/**
 * Validate and format a publication date, keeping the exact source string for the `dateTime`
 * attribute. It accepts ONLY a strict `YYYY-MM-DD` calendar date, or an RFC3339/ISO timestamp
 * that carries an explicit timezone (`Z` or a numeric offset). Everything else — free-form or
 * locale-formatted text, an incomplete or non-padded date, an impossible or normalised date, or
 * a timestamp with no timezone — returns null, so the date is safely omitted, never invented.
 * The label shows the written calendar date (the source date part), so an offset never shifts
 * the displayed day. Never throws.
 */
function formatDate(iso: string): { label: string; dateTime: string } | null {
  const raw = iso.trim();

  const dateOnly = DATE_ONLY.exec(raw);
  if (dateOnly) {
    const dt = calendarDate(Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3]));
    return dt ? { label: labelFor(dt), dateTime: iso } : null;
  }

  const dateTime = DATE_TIME.exec(raw);
  if (dateTime) {
    const dt = calendarDate(Number(dateTime[1]), Number(dateTime[2]), Number(dateTime[3]));
    if (!dt) return null;
    const hours = Number(dateTime[4]);
    const minutes = Number(dateTime[5]);
    const seconds = dateTime[6] === undefined ? 0 : Number(dateTime[6]);
    if (hours > 23 || minutes > 59 || seconds > 59) return null;
    // A numeric offset (sign present) must itself be in range; `Z` skips this.
    if (dateTime[7] && (Number(dateTime[8]) > 23 || Number(dateTime[9]) > 59)) return null;
    return { label: labelFor(dt), dateTime: iso };
  }

  return null;
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
