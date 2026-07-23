import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./PlanIncludeCard.module.css";

type PlanIncludeCardProps = {
  /** The item name (verbatim). */
  title: string;
  /** The plain description (verbatim). */
  body: string;
  /** Shared icon name. */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink for the accent + tile. */
  tone: string;
  className?: string;
};

/**
 * PlanIncludeCard — a STATIC explanatory card (not a link) for one thing a growth plan can include. A
 * flat IconTile, the title as its H3, and the body verbatim. The `tone` is mapped through the domain
 * bridge to an accessible V2 ink. No link, no featured/first-card emphasis, no rank, no NodeOrb, no
 * glow/glass/gradient, no fixed height. Server Component; understandable with CSS disabled.
 */
export function PlanIncludeCard({ title, body, icon, tone, className }: PlanIncludeCardProps) {
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
    </Card>
  );
}
