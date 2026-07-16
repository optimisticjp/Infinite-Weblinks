import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import styles from "./GoalCards.module.css";

export interface GoalCardVM {
  slug: string;
  title: string;
  outcome: string;
  icon: string;
  color: string;
}

/**
 * Goal summary cards. Every goal shown as a compact card — the outcome, and a click
 * straight into a plan built around it. No stage filter (Phase 2): the homepage
 * summarises and routes rather than asking the visitor to sift; the full facts and
 * any filtering live on /goals/<slug> and the growth-plan builder.
 */
export function GoalCards({ goals }: { goals: GoalCardVM[] }) {
  return (
    <ul className={styles.grid}>
      {goals.map((g) => (
        <li key={g.slug} className={styles.card}>
          <Link href={`/growth-plan?goal=${g.slug}`} className={styles.cardLink}>
            <span className={styles.cardTop}>
              <IconTile color={g.color} variant="filled" size={44}>
                <Icon name={g.icon} />
              </IconTile>
              <ArrowRight className={styles.cardArrow} aria-hidden="true" size={18} />
            </span>
            <h3 className={styles.title}>{g.title}</h3>
            <p className={styles.outcome}>{g.outcome}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
