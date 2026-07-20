import { Badge } from "./Badge";
import { Icon } from "./Icon";

export type DeliveryModelKey = "we-do" | "we-expert" | "we-run" | "you-run";

/**
 * The four delivery models — exact locked names (see src/lib/content/data/delivery-models.ts),
 * each with a consistent glyph and an accessible V2 domain ink (measured AA on its tint).
 * Content is fixed here; do not invent models or rewrite the labels.
 */
const MODELS: Record<DeliveryModelKey, { label: string; icon: string; ink: string }> = {
  "we-do": { label: "We Do the Work", icon: "wrench", ink: "var(--v2-domain-strategy-ink)" },
  "we-expert": { label: "We Bring In an Expert", icon: "users", ink: "var(--v2-domain-build-ink)" },
  "we-run": { label: "We Run It End to End", icon: "settings", ink: "var(--v2-domain-operate-ink)" },
  "you-run": { label: "You Run It After", icon: "shield", ink: "var(--v2-domain-retain-ink)" },
};

/** DeliveryModelBadge — a V2 domain-tinted Badge for one of the four delivery models. */
export function DeliveryModelBadge({
  model,
  className,
}: {
  model: DeliveryModelKey;
  className?: string;
}) {
  const m = MODELS[model];
  return (
    <Badge tone="domain" color={m.ink} icon={<Icon name={m.icon} />} className={className}>
      {m.label}
    </Badge>
  );
}
