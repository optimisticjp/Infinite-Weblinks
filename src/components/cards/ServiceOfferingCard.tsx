import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Chip } from "@/components/primitives/Chip";
import { DeliveryModelBadge } from "@/components/primitives/DeliveryModelBadge";
import { domainInk } from "@/lib/design/domainColor";
import type { DeliveryModelKey } from "@/lib/design/deliveryModel";
import styles from "./ServiceOfferingCard.module.css";

type ServiceOfferingCardProps = {
  /** The service slug (source of the derived fragment id). */
  slug: string;
  /** The service name (verbatim). */
  title: string;
  /** The one-line summary the caller selected (config.serviceCopy ?? plainDescription). */
  summary: string;
  /** The service's canonical delivery-model key. */
  deliveryModel: DeliveryModelKey;
  /** "What you get" points, in source order. */
  whatYouGet: string[];
  /** Example tool labels ("tools we can connect") — rendered as static Chips when present. */
  exampleTools: string[];
  /** The category icon (a quiet wayfinding marker). */
  categoryIcon: string;
  /** The category wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  categoryTone: string;
  /**
   * Whether to render the DERIVED `id="<slug>"` fragment target (with sticky-header scroll margin).
   * Default true (the anchor old service URLs redirect to). Design-preview passes false. Callers
   * can never supply a custom id — only toggle the derived one.
   */
  withFragmentTarget?: boolean;
  className?: string;
};

/**
 * ServiceOfferingCard — a STATIC, anchored presentation of one real service inside its category
 * (NOT a link). A flat category IconTile, the exact DeliveryModelBadge, the service name as its H4
 * (the cluster heading above is an H3), the supplied summary, the complete whatYouGet checklist in
 * source order, and every example tool as a static Chip. Its root id is DERIVED from the slug — the
 * fragment target old service URLs redirect to — and can be turned off with withFragmentTarget=false
 * (preview only); a caller cannot supply a custom id. No nested interactive element, no price,
 * duration, guarantee, metric, result card, fake recommendation, NodeOrb, BentoCard, glow, glass,
 * gradient, fixed height or collapsed/interaction-dependent content. Server Component; understandable
 * with CSS disabled.
 */
export function ServiceOfferingCard({
  slug,
  title,
  summary,
  deliveryModel,
  whatYouGet,
  exampleTools,
  categoryIcon,
  categoryTone,
  withFragmentTarget = true,
  className,
}: ServiceOfferingCardProps) {
  const ink = domainInk(categoryTone);
  return (
    <Card
      as="article"
      id={withFragmentTarget ? slug : undefined}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-accent" as string]: ink } as CSSProperties}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={categoryIcon} />
        </IconTile>
        <DeliveryModelBadge model={deliveryModel} />
      </span>

      <h4 className={styles.title}>{title}</h4>
      <p className={styles.summary}>{summary}</p>

      <ul className={styles.whatYouGet}>
        {whatYouGet.map((point) => (
          <li key={point} className={styles.point}>
            <Check className={styles.pointIcon} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {exampleTools.length > 0 ? (
        <ul className={styles.chips} aria-label="Example tools we can connect">
          {exampleTools.map((tool) => (
            <li key={tool}>
              <Chip>{tool}</Chip>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
