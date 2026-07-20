import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

/**
 * Button variants.
 * V2 set: primary · signature · secondary · ghost · text.
 * `brand` is DEPRECATED (legacy gradient CTA, currently 0 consumers) — kept only so any
 * future stray reference still compiles; do not use it in new code.
 */
type Variant = "primary" | "signature" | "secondary" | "ghost" | "text" | "brand";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Action-button only: shows a spinner, sets aria-busy, and disables the control. */
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
} & { prefetch?: boolean };

type ActionProps = BaseProps & {
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function classes(variant: Variant, size: Size, loading: boolean, className?: string) {
  return [styles.btn, styles[variant], styles[size], loading ? styles.loading : "", className]
    .filter(Boolean)
    .join(" ");
}

/**
 * Button / CTA. Renders a Next <Link> when `href` is set, otherwise a <button>.
 *
 * V2 (inside .theme-light / .theme-light-alt / .theme-night): primary is a solid brand fill
 * with a neutral shadow (no glow, no moving gradient); signature is the single two-colour
 * brand gradient (verified white contrast) reserved for top-level CTAs; secondary/ghost/text
 * are restrained. Legacy surfaces keep the existing gradient CTA appearance unchanged.
 */
export function Button(props: LinkProps | ActionProps) {
  const {
    variant = "primary",
    size = "md",
    iconLeft,
    iconRight,
    loading = false,
    className,
    children,
  } = props;

  const isLink = "href" in props && props.href !== undefined;
  const showLoading = loading && !isLink;

  const inner = (
    <>
      {showLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {iconLeft && !showLoading ? (
        <span className={styles.icon} aria-hidden="true">
          {iconLeft}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {iconRight ? (
        <span className={`${styles.icon} ${styles.iconRight}`} aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (isLink) {
    const { href, prefetch } = props as LinkProps;
    return (
      <Link href={href} prefetch={prefetch} className={classes(variant, size, false, className)}>
        {inner}
      </Link>
    );
  }

  // Strip every non-DOM prop so only genuine button attributes reach the element.
  const {
    href: _href,
    variant: _variant,
    size: _size,
    iconLeft: _iconLeft,
    iconRight: _iconRight,
    loading: _loading,
    className: _className,
    children: _children,
    ...buttonProps
  } = props as ActionProps;
  void _href;
  void _variant;
  void _size;
  void _iconLeft;
  void _iconRight;
  void _loading;
  void _className;
  void _children;

  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || showLoading}
      aria-busy={showLoading || undefined}
      className={classes(variant, size, showLoading, className)}
    >
      {inner}
    </button>
  );
}
