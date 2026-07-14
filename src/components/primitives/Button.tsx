import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "brand" | "secondary" | "ghost" | "text";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
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

function classes(variant: Variant, size: Size, className?: string) {
  return [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(" ");
}

/**
 * Button / CTA. Renders a Next <Link> when `href` is set, otherwise a <button>.
 * The primary/brand gradient variants use DARK ink text (accessibility fix
 * R-A11Y-1) via the --cta-text token — white text fails contrast at the orange end.
 */
export function Button(props: LinkProps | ActionProps) {
  const { variant = "primary", size = "md", iconLeft, iconRight, className, children } = props;
  const inner = (
    <>
      {iconLeft ? (
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

  if ("href" in props && props.href !== undefined) {
    const { href, prefetch } = props as LinkProps;
    return (
      <Link href={href} prefetch={prefetch} className={classes(variant, size, className)}>
        {inner}
      </Link>
    );
  }

  const { href: _omit, ...buttonProps } = props as ActionProps;
  void _omit;
  return (
    <button {...buttonProps} className={classes(variant, size, className)}>
      {inner}
    </button>
  );
}
