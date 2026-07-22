import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { deliveryModelMeta, type DeliveryModelKey } from "@/lib/design/deliveryModel";

export type { DeliveryModelKey };

/**
 * DeliveryModelBadge — a V2 domain-tinted Badge for one of the four locked delivery models. Its
 * label, glyph and accessible ink come from the central DELIVERY_MODEL_META (shared with the V2
 * delivery-model presentation); the content is fixed there — do not invent models or rewrite the
 * labels here.
 */
export function DeliveryModelBadge({
  model,
  className,
}: {
  model: DeliveryModelKey;
  className?: string;
}) {
  const m = deliveryModelMeta(model);
  return (
    <Badge tone="domain" color={m.ink} icon={<Icon name={m.icon} />} className={className}>
      {m.label}
    </Badge>
  );
}
