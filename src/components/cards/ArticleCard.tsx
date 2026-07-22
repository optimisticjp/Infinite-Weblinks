import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ArticleCard.module.css";

type ArticleCardProps = {
  /** Article title — rendered as the card's <h3>. */
  title: string;
  /** One- or two-line standfirst. */
  excerpt: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** The real goal/topic label (visible text), e.g. "Get found on Google" or "Guide". */
  goalLabel: string;
  /** Wayfinding colour token for the goal (legacy or V2); mapped to an accessible V2 ink. */
  goalTone?: string;
  /** Human reading time (visible text), e.g. "5 min read". Omitted when unknown. */
  readingTime?: string;
  /** Optional decorative icon (flat tile, no NodeOrb/glow). */
  icon?: string;
  /**
   * Emphasise this article. Featured is a genuine caller signal (never array position); in an
   * editorial CardGrid it also spans both columns.
   */
  featured?: boolean;
  className?: string;
};

/**
 * ArticleCard — an editorial guide card for the Learn hub. Text-forward and calm: a topic
 * label + reading time, an H3 title, a short standfirst, and a quiet "read" affordance. The
 * whole card is one link (a single tab stop) with soft elevation and a ≤2px hover matched by
 * focus. Deliberately NOT a BentoCard: no big domain node-orb, no corner-arrow tile, no glow,
 * glass, image placeholder, fake author, date or metric. Server Component.
 */
export function ArticleCard({
  title,
  excerpt,
  href,
  goalLabel,
  goalTone,
  readingTime,
  icon,
  featured = false,
  className,
}: ArticleCardProps) {
  const ink = domainInk(goalTone);
  return (
    <Card
      href={href}
      variant="raised"
      accent={ink}
      className={[styles.card, featured ? styles.featured : "", className].filter(Boolean).join(" ")}
    >
      <span className={styles.meta}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon name={icon} />
          </span>
        ) : null}
        <span className={styles.goal}>{goalLabel}</span>
        {readingTime ? (
          <>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.readingTime}>{readingTime}</span>
          </>
        ) : null}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.excerpt}>{excerpt}</p>
      <span className={styles.more} aria-hidden="true">
        Read the guide
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
