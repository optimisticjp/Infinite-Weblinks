import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  /** "full" = mark + wordmark (default); "mark" = symbol only. */
  variant?: "full" | "mark";
  /** Mark height in px (wordmark scales with it). Default 28. */
  size?: number;
  /** Wrap in a link to the given href (e.g. "/"). */
  href?: string;
  className?: string;
  /** Accessible label; defaults to "Infinite Weblinks". */
  label?: string;
};

/**
 * Infinite Weblinks — Signature Crossover logo.
 * The gradient infinity mark is drawn via the shared <BrandSprite> symbol
 * (recolour-safe, no duplicate ids); the wordmark is real, selectable text
 * in the display font so it renders correctly and is accessible. Colour of the
 * wordmark follows `currentColor`, so callers set light/dark via `color`.
 */
export function Logo({
  variant = "full",
  size = 28,
  href,
  className,
  label = "Infinite Weblinks",
}: LogoProps) {
  const content = (
    <span
      className={[styles.logo, className].filter(Boolean).join(" ")}
      style={{ ["--logo-h" as string]: `${size}px` }}
      role="img"
      aria-label={label}
    >
      <svg className={styles.mark} viewBox="0 0 100 50" aria-hidden="true" focusable="false">
        <use href="#iw-infinity" />
      </svg>
      {variant === "full" && (
        <span className={styles.wordmark} aria-hidden="true">
          Infinite Weblinks
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link} aria-label={label}>
        {content}
      </Link>
    );
  }
  return content;
}
