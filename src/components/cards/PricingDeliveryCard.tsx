import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { deliveryModelMeta, type DeliveryModelKey } from "@/lib/design/deliveryModel";
import styles from "./PricingDeliveryCard.module.css";

type PricingDeliveryCardProps = {
  /** One of the four canonical delivery-model keys. */
  modelKey: DeliveryModelKey;
  /** The model's real tagline. */
  tagline: string;
  /** The exact pricing cost-shape note for this model (never a fabricated figure). */
  costNote: string;
  className?: string;
};

/**
 * PricingDeliveryCard — a STATIC card (not a link) describing how one delivery model shapes cost. The
 * exact model label, glyph and accessible V2 ink all come from the central DELIVERY_MODEL_META (the
 * same source as DeliveryModelBadge / DeliveryModelCard) — there is NO second icon/label map and no
 * DELIVERY_COLOR. The flat IconTile + the exact model name as its H3 give the textual delivery
 * identification; the real tagline and the exact cost note follow.
 *
 * Pricing explains cost *shape*, not which model to choose — so this card carries NO
 * "Our default" / "popular" / "best value" / "recommended" marker, NO fragment id (`delivery-*`
 * anchors belong to /how-it-works, never /pricing), NO fabricated price or range, and no
 * featured-first emphasis. No NodeOrb/BentoCard/glow/gradient. Server Component.
 */
export function PricingDeliveryCard({ modelKey, tagline, costNote, className }: PricingDeliveryCardProps) {
  const meta = deliveryModelMeta(modelKey);
  return (
    <Card
      as="article"
      variant="raised"
      accent={meta.ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-accent" as string]: meta.ink } as CSSProperties}
    >
      <IconTile color={meta.ink} size="md">
        <Icon name={meta.icon} />
      </IconTile>
      <h3 className={styles.name}>{meta.label}</h3>
      <p className={styles.tagline}>{tagline}</p>
      <p className={styles.costNote}>{costNote}</p>
    </Card>
  );
}
