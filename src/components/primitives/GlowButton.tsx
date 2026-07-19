import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./GlowButton.module.css";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Stretch to fill the available width (used for the form's primary submit). */
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = BaseProps & { href: string; prefetch?: boolean; onClick?: never };
type ActionProps = BaseProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

function classes(variant: Variant, size: Size, block: boolean, className?: string) {
  return [styles.btn, styles[variant], styles[size], block ? styles.block : "", className]
    .filter(Boolean)
    .join(" ");
}

/**
 * GlowButton — the Constellation CTA. `primary` fills with the brand gradient
 * (violet → pink → orange) over DARK ink and carries a soft coloured glow that deepens on
 * hover; `ghost` is the quiet secondary (hairline, section text colour). Dark ink follows
 * the proven site pattern for gradient CTAs — white washes out at the orange end. Renders a
 * Next `<Link>` when `href` is set, otherwise a real `<button>` (so `type`, `disabled`,
 * `aria-*` all pass straight through).
 */
export function GlowButton(props: LinkProps | ActionProps) {
  const {
    variant = "primary",
    size = "md",
    iconLeft,
    iconRight,
    block = false,
    className,
    children,
  } = props;

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
      <Link href={href} prefetch={prefetch} className={classes(variant, size, block, className)}>
        {inner}
      </Link>
    );
  }

  const {
    href: _href,
    variant: _variant,
    size: _size,
    iconLeft: _iconLeft,
    iconRight: _iconRight,
    block: _block,
    className: _className,
    children: _children,
    ...buttonProps
  } = props as ActionProps;
  void _href;
  void _variant;
  void _size;
  void _iconLeft;
  void _iconRight;
  void _block;
  void _className;
  void _children;

  return (
    <button {...buttonProps} className={classes(variant, size, block, className)}>
      {inner}
    </button>
  );
}
