import { Check } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./FilterChip.module.css";

type FilterChipProps = {
  children: ReactNode;
  /** Selected state — reflected as aria-pressed and a visible check (not colour alone). */
  selected?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed">;

/**
 * FilterChip — a toggleable filter button. Native <button> semantics, `aria-pressed`
 * reflects selection, and the selected state is shown by a check glyph + border/fill (never
 * colour alone). Controlled by the parent via `selected` + `onClick`.
 */
export function FilterChip({ children, selected = false, className, ...rest }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[styles.chip, selected ? styles.selected : "", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span className={styles.check} aria-hidden="true">
        {selected ? <Check /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}
