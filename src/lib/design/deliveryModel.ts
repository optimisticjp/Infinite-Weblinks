/**
 * Central presentation metadata for the four LOCKED delivery models. Single source of truth for
 * their exact labels, glyphs and accessible V2 inks, shared by DeliveryModelBadge and the V2
 * delivery-model presentation so the icon/ink mapping is never duplicated or allowed to drift.
 *
 * The labels here MUST match src/lib/content/data/delivery-models.ts exactly (asserted by a unit
 * test). Server-safe: plain data, no DOM, tokens only. The `Record<DeliveryModelKey, …>` shape is
 * compile-time exhaustive — an unknown key cannot be added without a type error — and
 * `deliveryModelMeta()` throws at runtime rather than silently falling back to a made-up model.
 *
 * The key type is the canonical `DeliveryModelKey` from the content types (re-exported here for
 * co-located imports) — there is NO second union declared in this module, so content data,
 * ServiceCard, DeliveryModelBadge, DeliveryModelCard and this metadata all use one type.
 */

import type { DeliveryModelKey } from "@/lib/content/types";

export type { DeliveryModelKey };

export type DeliveryModelMeta = {
  /** The locked key. */
  key: DeliveryModelKey;
  /** The exact locked label (matches delivery-models.ts). */
  label: string;
  /** The consistent glyph (lucide icon name). */
  icon: string;
  /** Accessible V2 ink token — measured AA on white and on its own tint. */
  ink: string;
};

/** The four locked keys in source order. */
export const DELIVERY_MODEL_KEYS: readonly DeliveryModelKey[] = [
  "we-do",
  "we-expert",
  "we-run",
  "you-run",
] as const;

export const DELIVERY_MODEL_META: Record<DeliveryModelKey, DeliveryModelMeta> = {
  "we-do": { key: "we-do", label: "We Do the Work", icon: "wrench", ink: "var(--v2-domain-strategy-ink)" },
  "we-expert": { key: "we-expert", label: "We Bring In an Expert", icon: "users", ink: "var(--v2-domain-build-ink)" },
  "we-run": { key: "we-run", label: "We Run It End to End", icon: "settings", ink: "var(--v2-domain-operate-ink)" },
  "you-run": { key: "you-run", label: "You Run It After", icon: "shield", ink: "var(--v2-domain-retain-ink)" },
};

/** Exhaustive accessor — throws on an unrecognised key instead of inventing a model. */
export function deliveryModelMeta(key: DeliveryModelKey): DeliveryModelMeta {
  const meta = DELIVERY_MODEL_META[key];
  if (!meta) throw new Error(`Unknown delivery model key: ${String(key)}`);
  return meta;
}
