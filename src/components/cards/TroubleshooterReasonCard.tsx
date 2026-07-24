import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./TroubleshooterReasonCard.module.css";

type TroubleshooterReasonCardProps = {
  /** The reason title (verbatim). */
  title: string;
  /** The plain reason body (verbatim). */
  body: string;
  /** Shared icon name (see primitives/Icon). */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink for the accent + tile. */
  tone: string;
  className?: string;
};

/**
 * TroubleshooterReasonCard — a STATIC explanatory card (not a link, not a button) for one common
 * reason a growth problem may be happening. A flat IconTile, the reason title as its H3, and the body
 * verbatim. The `tone` is mapped through the domain bridge to an accessible V2 ink. No link, no
 * featured/first-card emphasis, no rank, no NodeOrb, no glow/glass/gradient, no fixed height. These
 * are possible reasons, never a certain diagnosis. Server Component; understandable with CSS disabled.
 */
export function TroubleshooterReasonCard({ title, body, icon, tone, className }: TroubleshooterReasonCardProps) {
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
