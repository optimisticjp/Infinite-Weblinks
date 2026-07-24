"use client";

import type { HTMLInputTypeAttribute } from "react";
import type { LucideIcon } from "lucide-react";
import { FormField, type FieldAppearance } from "@/components/forms/FormField";
import controlStyles from "@/components/forms/FormField.module.css";
import v2Control from "@/components/forms/FormFieldV2.module.css";
import styles from "./Field.module.css";

export interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "url" | "tel" | "numeric";
  /** Leading Lucide glyph (decorative). */
  icon?: LucideIcon;
  /** V2 vs legacy control appearance (default legacy — existing callers are unchanged). */
  appearance?: FieldAppearance;
  className?: string;
}

/**
 * TextField — a labelled text input primitive. Wraps the accessible FormField (real
 * `<label>`, hint, required marker, error wired via aria-describedby / aria-invalid) and
 * adds the optional leading glyph. Reused for every single-line field across the rebrand.
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  hint,
  error,
  required,
  placeholder,
  autoComplete,
  inputMode,
  icon: Icon,
  appearance = "legacy",
  className,
}: TextFieldProps) {
  const control = appearance === "v2" ? v2Control.control : controlStyles.control;
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required} appearance={appearance} className={className}>
      {(controlProps) => (
        <span className={styles.wrap}>
          {Icon ? <Icon className={styles.icon} size={18} aria-hidden="true" /> : null}
          <input
            {...controlProps}
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={[control, Icon ? styles.hasIcon : ""].filter(Boolean).join(" ")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </span>
      )}
    </FormField>
  );
}
