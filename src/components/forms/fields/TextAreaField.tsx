"use client";

import { FormField } from "@/components/forms/FormField";
import controlStyles from "@/components/forms/FormField.module.css";
import styles from "./Field.module.css";

export interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * TextAreaField — a labelled multi-line input with a live character counter. The counter is
 * decorative (aria-hidden) so it does not chatter at screen readers on every keystroke; the
 * limit is stated in the field hint and enforced by `maxLength`, so the constraint is
 * conveyed accessibly without the noise.
 */
export function TextAreaField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
  error,
  required,
  placeholder,
  rows = 6,
  className,
}: TextAreaFieldProps) {
  const length = value.length;
  const atLimit = length >= maxLength;
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {(controlProps) => (
        <span className={styles.textareaWrap}>
          <textarea
            {...controlProps}
            className={controlStyles.control}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            maxLength={maxLength}
          />
          <span
            className={[styles.counter, atLimit ? styles.counterFull : ""].filter(Boolean).join(" ")}
            aria-hidden="true"
          >
            {length} / {maxLength}
          </span>
        </span>
      )}
    </FormField>
  );
}
