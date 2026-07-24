"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { FormField, type FieldAppearance } from "@/components/forms/FormField";
import controlStyles from "@/components/forms/FormField.module.css";
import v2Control from "@/components/forms/FormFieldV2.module.css";
import styles from "./Field.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** First, unselected option shown when `value` is empty (e.g. "Select an option"). */
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Leading Lucide glyph (decorative). */
  icon?: LucideIcon;
  /** V2 vs legacy control appearance (default legacy — existing callers are unchanged). */
  appearance?: FieldAppearance;
  className?: string;
}

/**
 * SelectField — an accessible native `<select>` primitive. Native is a deliberate choice:
 * it is fully keyboard- and screen-reader-operable and matches the platform on mobile,
 * while a custom chevron + the deep input surface keep it on-brand. Built on FormField so
 * the label, hint, required marker and error wiring are identical to every other field.
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  required,
  icon: Icon,
  appearance = "legacy",
  className,
}: SelectFieldProps) {
  const isPlaceholder = value === "";
  const control = appearance === "v2" ? v2Control.control : controlStyles.control;
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required} appearance={appearance} className={className}>
      {(controlProps) => (
        <span className={styles.wrap}>
          {Icon ? <Icon className={styles.icon} size={18} aria-hidden="true" /> : null}
          <select
            {...controlProps}
            className={[
              control,
              styles.select,
              Icon ? styles.hasIcon : "",
              isPlaceholder ? styles.placeholder : "",
            ]
              .filter(Boolean)
              .join(" ")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {placeholder ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
        </span>
      )}
    </FormField>
  );
}
