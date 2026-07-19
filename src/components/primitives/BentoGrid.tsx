import type { ReactNode } from "react";
import styles from "./Bento.module.css";

/**
 * BentoGrid — a responsive bento layout. A single `featured` card takes the large tile;
 * `medium`/`compact` cards fill the rest. Dense auto-flow keeps the grid tight when card
 * sizes vary. Pass BentoCards (or any nodes) as children.
 */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={[styles.grid, className].filter(Boolean).join(" ")}>{children}</ul>;
}
