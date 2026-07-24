import { Children, isValidElement, type ReactNode } from "react";
import styles from "./CardGrid.module.css";

type Layout = "equal" | "editorial";

type CardGridProps = {
  children: ReactNode;
  /**
   * `equal` (default): a uniform responsive grid (1 / 2 / 3 columns) of equal-height cards —
   * no cinematic hero tile.
   * `editorial`: a calmer 1-column mobile → 2-column tablet/desktop reading layout. A child
   * may be emphasised to span both columns, but ONLY when it explicitly declares
   * `featured` — there is no automatic index-0 emphasis.
   */
  layout?: Layout;
  /** Optional accessible name for the list. */
  "aria-label"?: string;
  className?: string;
};

/**
 * CardGrid — the layout wrapper for the content-card system. It is a semantic list: a `<ul>`
 * whose children are wrapped one-per-`<li>`, so a card set is announced as a list of N items.
 * No masonry and no fixed row heights — cards stretch to the tallest in their row. Mobile
 * source order equals visual order (single column), including any featured item.
 */
export function CardGrid({ children, layout = "equal", className, ...rest }: CardGridProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const ariaLabel = rest["aria-label"];
  return (
    <ul
      className={[styles.grid, styles[layout], className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {items.map((child, i) => {
        // Featured is an explicit per-item content signal (the caller sets `featured` on the
        // card), never inferred from position. It only spans columns in the editorial layout.
        const featured =
          layout === "editorial" && (child.props as { featured?: boolean }).featured === true;
        return (
          <li key={child.key ?? i} className={featured ? styles.featuredCell : styles.cell}>
            {child}
          </li>
        );
      })}
    </ul>
  );
}
