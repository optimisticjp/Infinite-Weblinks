import type { CSSProperties } from "react";
import { domainInk, domainTint } from "@/lib/design/domainColor";
import styles from "./TroubleshooterChecklist.module.css";

type TroubleshooterChecklistProps = {
  /** The checks in source order (verbatim). */
  checks: string[];
  /** Optional wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink + tint. */
  tone?: string;
  className?: string;
};

/**
 * TroubleshooterChecklist — a plain, ordered list of things a visitor can look at today. A semantic
 * `<ol>` (so the order is conveyed to assistive tech) with a small visible sequence number and the
 * full check text on each row. It is purely informational: no checkboxes, no completion/progress or
 * "done" state, no duration, no result claim, no interaction. The `tone` is mapped through the domain
 * bridge to an accessible V2 ink + tint. Server Component; understandable with CSS disabled.
 */
export function TroubleshooterChecklist({ checks, tone, className }: TroubleshooterChecklistProps) {
  const ink = domainInk(tone);
  const tint = domainTint(tone);
  return (
    <ol
      className={[styles.list, className].filter(Boolean).join(" ")}
      style={{ ["--check-ink" as string]: ink, ["--check-tint" as string]: tint } as CSSProperties}
    >
      {checks.map((check, i) => (
        <li key={check} className={styles.item}>
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <span className={styles.text}>{check}</span>
        </li>
      ))}
    </ol>
  );
}
