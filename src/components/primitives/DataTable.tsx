"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { domainInk } from "@/lib/design/domainColor";
import { Panel } from "./Panel";
import styles from "./DataTable.module.css";

export type DataTableRow = {
  id: string;
  /** The primary cell (the row's name). */
  label: ReactNode;
  /** Wayfinding token for the leading dot, e.g. "var(--lime)" or "var(--v2-domain-build-ink)".
   *  Resolved through the domain bridge so the dot is always an accessible ink. Omit for no dot. */
  tone?: string;
  /** Secondary cells, aligned to `columns` after the label. */
  cells?: ReactNode[];
  /** Internal href — the whole row becomes a single link with a hover arrow. */
  href?: string;
  /** Filter ids this row belongs to (matched against `filters[].id`). Plain data, so the whole
   *  row set is serializable and DataTable can be used directly from a server component. */
  filterKeys?: string[];
};

export type DataTableFilter = {
  id: string;
  label: ReactNode;
  /** Optional dot tone for the chip. */
  tone?: string;
};

type DataTableProps = {
  rows: DataTableRow[];
  /** Column headers. The first labels the row-label column; the rest align to each row's `cells`. */
  columns?: ReactNode[];
  /** Filter chips. An "All" chip (matches everything) is prepended automatically. */
  filters?: DataTableFilter[];
  /** Accessible name for the list region. */
  ariaLabel: string;
  /** Optional live count at the end of the filter bar, e.g. { singular: "goal", plural: "goals" }
   *  → "3 goals". Plain data (not a render fn), so every prop stays serializable for server use. */
  countNoun?: { singular: string; plural: string };
  className?: string;
};

const ALL = "__all__";

/**
 * DataTable — the V3 "Instrument" filterable row list.
 *
 * A leading domain-colour dot on each row (resolved through the domain bridge, so it is always an
 * accessible ink), a hover row highlight, and an arrow that appears on hover for navigable rows.
 * The surface is a flush Panel, so it inherits the product-surface depth. Data-driven: pass `rows`
 * built from the content layer — nothing here is hard-coded, so it stays correct as content changes.
 *
 * Client component only for the filter state; with no `filters` it is a static list.
 */
export function DataTable({ rows, columns, filters, ariaLabel, countNoun, className }: DataTableProps) {
  const [active, setActive] = useState<string>(ALL);
  const visible = active === ALL ? rows : rows.filter((r) => r.filterKeys?.includes(active));
  const hasArrow = rows.some((r) => r.href);

  return (
    <Panel className={[styles.table, className].filter(Boolean).join(" ")}>
      {filters && filters.length > 0 ? (
        <div className={styles.filterBar} role="group" aria-label={`Filter ${ariaLabel}`}>
          {[{ id: ALL, label: "All", tone: undefined }, ...filters].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.chip} ${active === f.id ? styles.chipActive : ""}`}
              aria-pressed={active === f.id}
              onClick={() => setActive(f.id)}
            >
              {f.tone ? (
                <span className={styles.dot} style={dotStyle(f.tone)} aria-hidden="true" />
              ) : null}
              {f.label}
            </button>
          ))}
          {countNoun ? (
            <span className={styles.count} aria-live="polite">
              {visible.length} {visible.length === 1 ? countNoun.singular : countNoun.plural}
            </span>
          ) : null}
        </div>
      ) : null}

      {columns && columns.length > 0 ? (
        <div className={`${styles.row} ${styles.head}`} aria-hidden="true">
          <span className={styles.labelCell}>{columns[0]}</span>
          {columns.slice(1).map((c, i) => (
            <span key={i} className={styles.cell}>
              {c}
            </span>
          ))}
          {hasArrow ? <span className={styles.arrowCell} /> : null}
        </div>
      ) : null}

      <ul className={styles.list} aria-label={ariaLabel}>
        {visible.map((row) => (
          <li key={row.id} className={styles.item}>
            <RowInner row={row} hasArrow={hasArrow} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RowInner({ row, hasArrow }: { row: DataTableRow; hasArrow: boolean }) {
  const body = (
    <>
      <span className={styles.labelCell}>
        {row.tone ? <span className={styles.dot} style={dotStyle(row.tone)} aria-hidden="true" /> : null}
        <span className={styles.labelText}>{row.label}</span>
      </span>
      {(row.cells ?? []).map((cell, i) => (
        <span key={i} className={styles.cell}>
          {cell}
        </span>
      ))}
      {hasArrow ? (
        <span className={styles.arrowCell} aria-hidden="true">
          {row.href ? <ArrowRight className={styles.arrow} size={16} /> : null}
        </span>
      ) : null}
    </>
  );

  return row.href ? (
    <Link href={row.href} className={`${styles.row} ${styles.rowLink}`}>
      {body}
    </Link>
  ) : (
    <div className={styles.row}>{body}</div>
  );
}

/** The dot always resolves through the domain bridge, so it is an accessible ink, never a raw hue. */
function dotStyle(tone: string): CSSProperties {
  return { ["--dt-dot" as string]: domainInk(tone) };
}
