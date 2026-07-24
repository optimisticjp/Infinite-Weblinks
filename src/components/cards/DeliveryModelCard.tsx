import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { deliveryModelMeta, type DeliveryModelKey } from "@/lib/design/deliveryModel";
import styles from "./DeliveryModelCard.module.css";

type DeliveryModelCardProps = {
  /** Position in source order (1-based). */
  order: number;
  /** One of the four locked delivery-model keys. */
  modelKey: DeliveryModelKey;
  /** The model's real tagline. */
  tagline: string;
  /** The model's real description. */
  description: string;
  /**
   * Whether to render the card's DERIVED deep-link fragment target (`delivery-<key>`). Default
   * `true` (its /how-it-works contract). Pass `false` on pages that must not expose the
   * delivery fragments (the homepage, /about) — the id is simply omitted. Callers can never
   * supply a custom id; this flag only toggles the internally-derived one on or off.
   */
  withFragmentTarget?: boolean;
  className?: string;
};

/**
 * DeliveryModelCard — a STATIC explanatory card (not a link) for one of the four locked delivery
 * models. Its root's deep-link id is DERIVED as `delivery-<key>` (with scroll-margin for the
 * sticky header) and the "Our default" Badge is DERIVED only when the key is `we-do` — a caller
 * cannot mislabel another model as default or create an id that disagrees with the key. The
 * fragment target itself can be turned off with `withFragmentTarget={false}` (the derived id is
 * omitted) so route-specific `delivery-*` anchors don't leak onto pages that shouldn't own them.
 * A compact order marker, the shared model glyph + V2 ink (from the central DELIVERY_MODEL_META),
 * the exact model name as its H3, the real tagline and description. No nested interaction, no
 * popularity/recommendation label on any other model. Server Component.
 */
export function DeliveryModelCard({
  order,
  modelKey,
  tagline,
  description,
  withFragmentTarget = true,
  className,
}: DeliveryModelCardProps) {
  const meta = deliveryModelMeta(modelKey);
  const isDefault = modelKey === "we-do";
  return (
    <Card
      as="article"
      id={withFragmentTarget ? `delivery-${modelKey}` : undefined}
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
