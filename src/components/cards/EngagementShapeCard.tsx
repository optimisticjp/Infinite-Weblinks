import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Badge } from "@/components/primitives/Badge";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./EngagementShapeCard.module.css";

type EngagementShapeCardProps = {
  /** The shape name (verbatim). */
  title: string;
  /** The plain description (verbatim). */
  body: string;
  /** The exact source note — "Quoted to scope" or "Monthly, quoted to scope". */
  note: string;
  /** Lucide icon name. */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink accent + tile. */
  tone: string;
  className?: string;
};

/**
 * EngagementShapeCard — a STATIC card (not a link) describing one shape work tends to take. A flat
 * IconTile, the shape title as its H3, the body verbatim, and an information Badge carrying the exact
 * "quoted to scope" note. These are engagement SHAPES, not purchasable plans — so there is NO price,
 * duration, package/tier semantics, comparison-table layout, popularity/recommendation marker, or
 * featured/first-shape emphasis. No glow/glass/gradient; long text wraps naturally. Server Component.
 */
export function EngagementShapeCard({ title, body, note, icon, tone, className }: EngagementShapeCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      as="article"
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-accent" as string]: ink } as CSSProperties}
    >
      <IconTile color={ink} size="md">
        <Icon name={icon} />
      </IconTile>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <Badge tone="information" className={styles.note}>
        {note}
      </Badge>
    </Card>
  );
}
