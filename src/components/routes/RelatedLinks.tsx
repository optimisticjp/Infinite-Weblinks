import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./RelatedLinks.module.css";

export interface RelatedLink {
  name: string;
  href: string;
  hint?: string;
}

/**
 * A labelled grid of internal cross-links — the recurring "related X" block on detail
 * pages (related services, tools, goals, stages…). Renders nothing when the list is
 * empty, so callers can pass a filtered list unconditionally. Purely internal links, so
 * it reinforces the "everything connects" model without inventing relationships.
 */
export function RelatedLinks({
  title,
  links,
  columns = 2,
}: {
  title: string;
  links: RelatedLink[];
  columns?: 1 | 2 | 3;
}) {
  if (links.length === 0) return null;
  return (
    <div className={styles.block}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.grid} data-cols={columns}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.card}>
              <span className={styles.name}>
                {link.name}
                <ArrowUpRight className={styles.arrow} aria-hidden="true" />
              </span>
              {link.hint && <span className={styles.hint}>{link.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
