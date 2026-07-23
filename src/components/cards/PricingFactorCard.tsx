import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./PricingFactorCard.module.css";

type PricingFactorCardProps = {
  /** The factor name (verbatim). */
  title: string;
  /** The plain explanation (verbatim). */
  body: string;
  /** Lucide icon name. */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink for the accent + tile. */
  tone: string;
  className?: string;
};

/**
 * PricingFactorCard — a STATIC explanatory card (not a link) for one thing that shapes a quote. A
 * flat IconTile, the factor title as its H3, and the body verbatim. The `tone` is mapped through the
 * central domain-colour bridge to an accessible V2 ink (the accent rail + tile), never used as a raw
 * colour. No link, no button, no featured/first-card emphasis, no rank or weighting, no price or
 * numeric estimate, no NodeOrb/BentoCard, no glow/glass/gradient, no fixed height. Server Component;
 * understandable with CSS disabled.
 */
export function PricingFactorCard({ title, body, icon, tone, className }: PricingFactorCardProps) {
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
