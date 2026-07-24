import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./JourneyStageCard.module.css";

type JourneyStageCardProps = {
  /** The stage's real position in the growth journey (1-based). */
  order: number;
  /** Stage name — rendered as the card's <h3>. */
  title: string;
  /** The stage's own short summary. */
  summary: string;
  /** Internal destination — the WHOLE card is this single link (e.g. /how-it-works#[stage]). */
  href: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding colour token for the stage (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
  className?: string;
};

/**
 * JourneyStageCard — a journey-position-led card for a growth-journey stage. A flat IconTile and
 * a compact "Stage N" label (the stage's real position, not a progress meter) head it; the stage
 * name is the H3; and its own short summary follows. The whole card is one link (a single tab
 * stop) with soft elevation and a ≤2px hover matched by focus; text wraps. Colour is resolved
 * through the domain bridge (accessible ink), never a legacy token as text. It reads as a place
 * in the journey, never project progress: no completion state, percentage, progress bar,
 * duration, or claim that every visitor follows the same sequence — and no node-orb, connector,
 * glow, glass, gradient or fixed height. Server Component.
 */
export function JourneyStageCard({ order, title, summary, href, icon, tone, className }: JourneyStageCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      href={href}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
        <span className={styles.stage}>Stage {order}</span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.summary}>{summary}</p>

      <span className={styles.more} aria-hidden="true">
        See this stage
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
