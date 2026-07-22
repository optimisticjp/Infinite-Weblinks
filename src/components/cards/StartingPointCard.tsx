import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./StartingPointCard.module.css";

type StartingPointCardProps = {
  /** The starting point's position in the source-ordered list (1-based). */
  order: number;
  /** The starting-point label — rendered as the card's <h3>. */
  title: string;
  /** The real "where you are now" situation sentence. */
  situation: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
  /** Real, resolved recommended-stage name — shown as a Badge when supplied. */
  recommendedStageLabel?: string;
  /** The longer, verbatim recommendation. Supported by the API but OPTIONAL and off by default —
   *  the compact card omits it unless a caller opts in (kept off /goals to keep the hub scannable). */
  recommendation?: string;
  className?: string;
};

/**
 * StartingPointCard — a current-situation-led whole-card route into the growth-plan builder. It
 * reads as a diagnosis → next-step: a flat IconTile + a compact "Starting point N" label head it,
 * the starting-point label is the H3, the real situation sentence follows, and — its signature —
 * a "Start at <stage>" Badge names where the work would begin (the resolved recommended stage).
 * The optional longer recommendation is supported but rendered only when a caller passes it. The
 * whole card is one link (a single tab stop, no nested link or button) with soft elevation and a
 * ≤2px hover matched by focus; labels and situations wrap and stay readable at 200%. Colour maps
 * through the domain bridge to an accessible ink, never a legacy token as text. No rail, carousel,
 * scroll-snap, node-orb, glow, glass, gradient or fixed height; no selected or progress state.
 * Server Component.
 */
export function StartingPointCard({
  order,
  title,
  situation,
  href,
  icon,
  tone,
  recommendedStageLabel,
  recommendation,
  className,
}: StartingPointCardProps) {
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
        <span className={styles.kicker}>Starting point {order}</span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.situation}>{situation}</p>
      {recommendation ? <p className={styles.recommendation}>{recommendation}</p> : null}

      <div className={styles.foot}>
        {recommendedStageLabel ? (
          <Badge tone="domain" color={ink} icon={<MapPin aria-hidden="true" />}>
            Start at {recommendedStageLabel}
          </Badge>
        ) : null}
        <span className={styles.more} aria-hidden="true">
          See the plan
          <ArrowRight className={styles.moreIcon} />
        </span>
      </div>
    </Card>
  );
}
