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
 * The primary CTA uses WHITE text on a darkened pink→orange gradient (#d1005f → #c94f00)
 * via --cta-text — this matches the reference look and passes WCAG AA at both ends (5.4:1 /
 * 4.6:1). The decorative `brand` variant keeps its bright tri-gradient and pins dark ink.
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

  // Strip every non-DOM prop (variant/size/icon*/children/href) so only genuine
  // button attributes (type, disabled, aria-*, onClick…) reach the element — otherwise
  // React warns about unknown attributes like `iconLeft` on a <button>.
  const {
    href: _href,
    variant: _variant,
    size: _size,
    iconLeft: _iconLeft,
    iconRight: _iconRight,
    className: _className,
    children: _children,
    ...buttonProps
  } = props as ActionProps;
  void _href;
  void _variant;
  void _size;
  void _iconLeft;
  void _iconRight;
  void _className;
  void _children;
  return (
    <button {...buttonProps} className={classes(variant, size, className)}>
      {inner}
    </button>
  );
}
