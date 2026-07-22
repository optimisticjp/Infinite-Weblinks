import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { deliveryModelMeta, type DeliveryModelKey } from "@/lib/design/deliveryModel";
import styles from "./DeliveryModelCard.module.css";

type DeliveryModelCardProps = {
  /** DOM id — the deep-link fragment target, e.g. "delivery-we-do". */
  id: string;
  /** Position in source order (1-based). */
  order: number;
  /** One of the four locked delivery-model keys. */
  modelKey: DeliveryModelKey;
  /** The model's real tagline. */
  tagline: string;
  /** The model's real description. */
  description: string;
  /** Marks the core/default model — shown as an "Our default" Badge (only true for `we-do`). */
  isDefault?: boolean;
  className?: string;
};

/**
 * DeliveryModelCard — a STATIC explanatory card (not a link) for one of the four locked delivery
 * models. Its root carries the deep-link id (`delivery-<key>`) with scroll-margin for the sticky
 * header. A compact order marker, the shared model glyph + V2 ink (from the central
 * DELIVERY_MODEL_META), the exact model name as its H3, the real tagline and description, and an
 * optional "Our default" Badge — grounded in the seed statement that this is the core model most
 * services use, and shown ONLY for `we-do`. No nested interaction, no popularity/recommendation
 * label on any other model. Server Component.
 */
export function DeliveryModelCard({
  id,
  order,
  modelKey,
  tagline,
  description,
  isDefault = false,
  className,
}: DeliveryModelCardProps) {
  const meta = deliveryModelMeta(modelKey);
  return (
    <Card
      as="article"
      id={id}
      variant="raised"
      accent={meta.ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <span className={styles.marker} aria-hidden="true">
          {String(order).padStart(2, "0")}
        </span>
        <IconTile color={meta.ink} size="md">
          <Icon name={meta.icon} />
        </IconTile>
      </span>
      <span className={styles.titleRow}>
        <h3 className={styles.name}>{meta.label}</h3>
        {isDefault ? (
          <Badge tone="domain" color={meta.ink}>
            Our default
          </Badge>
        ) : null}
      </span>
      <p className={styles.tagline}>{tagline}</p>
      <p className={styles.description}>{description}</p>
    </Card>
  );
}
