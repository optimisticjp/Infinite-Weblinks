import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./CrossCuttingSystemCard.module.css";

type CrossCuttingSystemCardProps = {
  /** The system key — becomes the card's deep-link id (e.g. "ai-automation"). */
  id: string;
  /** System title — rendered as the card's <h3>. */
  title: string;
  /** The system's full, verbatim description. */
  description: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink + tint. */
  tone?: string;
  className?: string;
};

/**
 * CrossCuttingSystemCard — a STATIC explanatory card (not a link) for one of the three systems
 * that run across the whole growth journey. Its root carries the real system key as its id (a
 * deep-link target) with scroll-margin for the sticky header. A flat IconTile, a visible "Runs
 * across the journey" label, an H3 title and the full description; colour maps through the domain
 * bridge to an accessible ink and a soft tint. No nested interaction, percentage, efficiency
 * metric, dashboard, node-orb, rail-bar, glow, gradient or fixed height. Server Component.
 */
export function CrossCuttingSystemCard({
  id,
  title,
  description,
  icon,
  tone,
  className,
}: CrossCuttingSystemCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      as="article"
      id={id}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
        <span className={styles.kicker}>Runs across the journey</span>
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </Card>
  );
}
