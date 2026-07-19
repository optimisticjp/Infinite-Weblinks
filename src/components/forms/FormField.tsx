"use client";

import { useId, type ReactNode } from "react";
import styles from "./FormField.module.css";

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
}

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Stable id for the control; auto-generated (via useId) when omitted. */
  id?: string;
  className?: string;
  /** Render-prop so any control (input/textarea/select) can consume the wired-up
   * id/aria-describedby/aria-invalid without this wrapper knowing its element type. */
  children: (controlProps: FieldControlProps) => ReactNode;
}

/**
 * Accessible labelled field wrapper: a real `<label>`, an optional hint and an inline
 * error, connected to the control via `aria-describedby` + `aria-invalid`
 * (contracts/forms-and-email.md — "Accessible by construction").
 */
export function FormField({
  label,
  hint,
  error,
  required,
  id,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, error ? styles.hasError : "", className].filter(Boolean).join(" ")}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children({
        id: fieldId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {/* The error is connected to the control via aria-describedby, so it's read when the
          field takes focus. It is NOT a role="alert" here: both forms that use this wrapper
          render a single assertive error summary/notice on submit and move focus to it, so
          per-field alerts would just clobber that one announcement with a competing burst. */}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
