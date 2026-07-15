import type { ReactNode } from "react";
import styles from "./HubGrid.module.css";

/**
 * Responsive grid wrapper for the hub/index routes (business types, starting points,
 * resources, proof). Composition-only over IndexCard — no new card styling. `min`
 * controls the minimum column width so denser lists (proof) and roomier ones (hubs)
 * share one layout primitive.
 */
export function HubGrid({ children, min = "17rem" }: { children: ReactNode; min?: string }) {
  return (
    <ul className={styles.grid} style={{ ["--hub-min" as string]: min }}>
      {children}
    </ul>
  );
}

/** One grid cell — keeps the list semantics (`<li>`) around each IndexCard link. */
export function HubGridItem({ children }: { children: ReactNode }) {
  return <li className={styles.item}>{children}</li>;
}
