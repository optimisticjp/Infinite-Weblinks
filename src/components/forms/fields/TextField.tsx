"use client";

import type { HTMLInputTypeAttribute } from "react";
import type { LucideIcon } from "lucide-react";
import { FormField } from "@/components/forms/FormField";
import controlStyles from "@/components/forms/FormField.module.css";
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
  className,
}: TextFieldProps) {
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {(controlProps) => (
        <span className={styles.wrap}>
          {Icon ? <Icon className={styles.icon} size={18} aria-hidden="true" /> : null}
          <input
            {...controlProps}
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={[controlStyles.control, Icon ? styles.hasIcon : ""].filter(Boolean).join(" ")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </span>
      )}
    </FormField>
  );
}
