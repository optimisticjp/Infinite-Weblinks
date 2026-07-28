import type { CSSProperties, ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
  children: ReactNode;
  /** Root element. Default "div"; use "section"/"article" for a landmark/semantic panel, "li" in a list. */
  as?: "div" | "section" | "article" | "li";
  /**
   * Adds the default inner padding. Off by default: a Panel is a surface FRAME, and the product
   * panels that use it (plan, roadmap, troubleshooter) lay out their own head/body/foot regions.
   * Pass `padded` for simple content that fills the whole panel.
   */
  padded?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Panel — the V3 "Instrument" product-surface.
 *
 * A raised surface (`--surface-raised`) with a 1px hairline and, crucially, the `--edge-top`
 * highlight along its top edge. On a dark canvas a drop shadow alone reads as nothing, so it is
 * that 1px light edge — paired with `--shadow-panel` — that makes the surface read as a real
 * interface rather than a flat block. It reads semantic tokens only, so it re-themes with the
 * surrounding theme.
 *
 * It is a frame, not a padded card: by default it has NO inner padding, so the product panels can
 * own their region layout. For an accent rail, an ordinal badge, tinted/night variants or
 * link-root behaviour, use `Card` instead — Panel deliberately stays the plain product surface.
 */
export function Panel({ children, as: Tag = "div", padded = false, id, className, style }: PanelProps) {
  const classNames = [styles.panel, padded ? styles.padded : "", className].filter(Boolean).join(" ");
  return (
    <Tag id={id} className={classNames} style={style}>
      {children}
    </Tag>
  );
}
