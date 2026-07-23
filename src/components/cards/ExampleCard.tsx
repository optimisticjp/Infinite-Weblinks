import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import styles from "./ExampleCard.module.css";

type ExampleCardProps = {
  /** The example's title — rendered as the card's <h3>. */
  title: string;
  /** The example's plain, honest summary. */
  summary: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  className?: string;
};

/**
 * ExampleCard — the restrained whole-card link for a single proof/example record. A quiet V2
 * outlined card: the title as the H3, the honest summary, and a "See this example" affordance. No
 * fabricated metric, rating, logo, client name or result — proof records carry only a title and a
 * summary, and this shows exactly those. The whole card is one link (a single tab stop, no nested
 * link) with a soft neutral hover matched by focus; no rail, glow, glass, gradient or fixed height.
 * Server Component.
 */
export function ExampleCard({ title, summary, href, className }: ExampleCardProps) {
  return (
    <Card href={href} variant="outlined" className={[styles.card, className].filter(Boolean).join(" ")}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.summary}>{summary}</p>
      <span className={styles.more} aria-hidden="true">
        See this example
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
