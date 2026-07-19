import { Check, ShieldCheck } from "lucide-react";
import styles from "./ProgressChecklist.module.css";

export type ChecklistItem = { label: string; state: "done" | "current" | "pending" };

type ProgressChecklistProps = {
  title: string;
  items: ChecklistItem[];
  /** Short privacy reassurance shown under the list. */
  note?: string;
  className?: string;
};

const STATUS_TEXT: Record<ChecklistItem["state"], string> = {
  done: "Done",
  current: "In progress",
  pending: "To do",
};

/**
 * ProgressChecklist — a "taking shape" sidebar that tracks a multi-step flow. Each item
 * carries an explicit status word (Done / In progress / To do) so state is never colour-only.
 * On desktop it renders the full checklist; on mobile it collapses to a compact progress bar
 * with a count. Reusable across any guided flow.
 */
export function ProgressChecklist({ title, items, note, className }: ProgressChecklistProps) {
  const done = items.filter((i) => i.state === "done").length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <aside className={[styles.wrap, className].filter(Boolean).join(" ")} aria-label={title}>
      {/* Compact summary (mobile). */}
      <div className={styles.compact} aria-hidden="true">
        <div className={styles.compactHead}>
          <span className={styles.compactTitle}>{title}</span>
          <span className={styles.compactCount}>
            {done} of {total}
          </span>
        </div>
        <div className={styles.bar}>
          <span className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Full checklist (desktop). */}
      <div className={styles.full}>
        <p className={styles.title}>{title}</p>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.label} className={`${styles.item} ${styles[item.state]}`}>
              <span className={styles.marker} aria-hidden="true">
                {item.state === "done" ? <Check size={13} strokeWidth={3} /> : null}
              </span>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.status}>{STATUS_TEXT[item.state]}</span>
            </li>
          ))}
        </ul>
      </div>

      {note ? (
        <p className={styles.note}>
          <ShieldCheck size={16} aria-hidden="true" className={styles.noteIcon} />
          {note}
        </p>
      ) : null}
    </aside>
  );
}
