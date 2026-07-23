"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { Icon } from "./Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./OptionCards.module.css";

export type CardOption = {
  value: string;
  label: string;
  description?: string;
  /** Domain hue token; falls back to a cycled hue when omitted. */
  color?: string;
  /** Optional Icon-primitive name. */
  icon?: string;
};

type OptionCardsProps = {
  legend: string;
  name: string;
  options: CardOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string | null;
  /** Preferred column count on wide screens. */
  columns?: 2 | 3;
  className?: string;
};

/** One restrained V2 fallback accent for options that carry no tone of their own (business type,
 *  setup, engagement, timeline) — no arbitrary palette cycle. Goal options carry a legacy colour,
 *  mapped to an accessible V2 ink through the domain bridge. */
const FALLBACK_INK = "var(--v2-brand)";

/**
 * OptionCards — an accessible single-select group rendered as light V2 cards. Real radio inputs
 * (visually hidden) provide native keyboard operation and group semantics inside a fieldset/legend;
 * the checked state is shown with a tick AND a border, never colour alone. Each option's accent is a
 * mapped V2 ink (goal colours via the domain bridge, everything else the single fallback). The error
 * is tied to every input via aria-describedby.
 */
export function OptionCards({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  columns = 2,
  className,
}: OptionCardsProps) {
  const baseId = useId().replace(/:/g, "");
  const errorId = error ? `${baseId}-error` : undefined;

  return (
    <fieldset className={[styles.fieldset, className].filter(Boolean).join(" ")}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={`${styles.grid} ${columns === 3 ? styles.cols3 : styles.cols2}`}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = value === opt.value;
          const ink = opt.color ? domainInk(opt.color) : FALLBACK_INK;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={[styles.card, checked ? styles.checked : ""].filter(Boolean).join(" ")}
              style={{ ["--opt-ink" as string]: ink }}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                aria-describedby={errorId}
                className={styles.input}
              />
              <span className={styles.check} aria-hidden="true">
                <Check size={14} strokeWidth={3} />
              </span>
              {opt.icon ? (
                <span className={styles.icon} aria-hidden="true">
                  <Icon name={opt.icon} />
                </span>
              ) : null}
              <span className={styles.text}>
                <span className={styles.label}>{opt.label}</span>
                {opt.description ? <span className={styles.description}>{opt.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
