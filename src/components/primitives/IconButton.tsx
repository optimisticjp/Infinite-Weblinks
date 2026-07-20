import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

type Appearance = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  /** Required accessible name — an icon-only control has no visible text. */
  label: string;
  /** The icon element (rendered decoratively; the accessible name comes from `label`). */
  icon: ReactNode;
  appearance?: Appearance;
  size?: Size;
  className?: string;
};

type LinkProps = BaseProps & { href: string; prefetch?: boolean; onClick?: never };
type ActionProps = BaseProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

function classes(appearance: Appearance, size: Size, className?: string) {
  return [styles.iconBtn, styles[appearance], styles[size], className].filter(Boolean).join(" ");
}

/**
 * IconButton — a square, icon-only action or link. The V2 icon-only control.
 *
 * Accessibility: `label` is required and applied as `aria-label` + `title`, so the meaning
 * never depends on the (aria-hidden) glyph. Renders a Next <Link> when `href` is set,
 * otherwise a real <button>. Sizes sm/md/lg; md is the 44px normal target.
 */
export function IconButton(props: LinkProps | ActionProps) {
  const { label, icon, appearance = "secondary", size = "md", className } = props;
  const inner = (
    <span className={styles.glyph} aria-hidden="true">
      {icon}
    </span>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, prefetch } = props as LinkProps;
    return (
      <Link
        href={href}
        prefetch={prefetch}
        aria-label={label}
        title={label}
        className={classes(appearance, size, className)}
      >
        {inner}
      </Link>
    );
  }

  const {
    label: _label,
    icon: _icon,
    appearance: _appearance,
    size: _size,
    className: _className,
    href: _href,
    ...buttonProps
  } = props as ActionProps;
  void _label;
  void _icon;
  void _appearance;
  void _size;
  void _className;
  void _href;

  return (
    <button {...buttonProps} aria-label={label} className={classes(appearance, size, className)}>
      {inner}
    </button>
  );
}
