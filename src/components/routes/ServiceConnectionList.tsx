import type { CSSProperties } from "react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ServiceConnectionList.module.css";

type ConnectsToEntry = { label: string; body: string; icon: string; hue: string };

/**
 * ServiceConnectionList — a static explanatory sequence of what a service area feeds into, as a
 * semantic ordered list. The first item is the CURRENT category; each following item is one
 * connectsTo entry in source order, with a compact sequence marker, a flat IconTile, an H3 label
 * and its body, in the mapped V2 tone. It renders NO links (the connectsTo data has no verified
 * destination — labels are never turned into inferred slugs), no connector-only list items, no
 * ConnectorPath, NodeOrb, SVG animation, fake progress, percentage, result language, fixed height
 * or horizontal scrolling. A neutral CSS-only left rail conveys direction; the ordered list stays
 * the source of truth. Server Component; all text available without JavaScript.
 */
export function ServiceConnectionList({
  categoryTitle,
  categoryDescription,
  categoryIcon,
  categoryTone,
  connectsTo,
}: {
  categoryTitle: string;
  categoryDescription: string;
  categoryIcon: string;
  categoryTone: string;
  connectsTo: ConnectsToEntry[];
}) {
  const items = [
    { label: categoryTitle, body: categoryDescription, icon: categoryIcon, tone: categoryTone, current: true },
    ...connectsTo.map((c) => ({ label: c.label, body: c.body, icon: c.icon, tone: c.hue, current: false })),
  ];

  return (
    <ol className={styles.list}>
      {items.map((item, i) => {
        const ink = domainInk(item.tone);
        return (
          <li
            key={`${item.label}-${i}`}
            className={`${styles.item} ${item.current ? styles.current : ""}`}
            style={{ ["--conn-ink" as string]: ink } as CSSProperties}
          >
            <span className={styles.head}>
              <span className={styles.marker} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <IconTile color={ink} size="md">
                <Icon name={item.icon} />
              </IconTile>
            </span>
            <h3 className={styles.label}>
              {item.label}
              {item.current ? <span className={styles.hereTag}> · you are here</span> : null}
            </h3>
            <p className={styles.body}>{item.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
