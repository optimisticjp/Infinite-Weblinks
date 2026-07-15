import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
  name: string;
  /** Path for every crumb except the current page (which renders as plain text). */
  path?: string;
}

/**
 * Breadcrumb trail. Renders an accessible <nav> with an ordered list and, when there is
 * more than one crumb, the matching BreadcrumbList JSON-LD. "Home" is prepended
 * automatically, so callers pass only the trail *after* Home.
 */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const items: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  const jsonLdItems = items
    .filter((c): c is Required<Crumb> => Boolean(c.path))
    .map((c) => ({ name: c.name, path: c.path }));

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      {jsonLdItems.length > 1 && <JsonLd data={breadcrumbJsonLd(jsonLdItems)} />}
      <ol className={styles.list}>
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${crumb.name}-${i}`} className={styles.item}>
              {crumb.path && !isLast ? (
                <Link href={crumb.path} className={styles.link}>
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={styles.current}>
                  {crumb.name}
                </span>
              )}
              {!isLast && <ChevronRight className={styles.sep} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
