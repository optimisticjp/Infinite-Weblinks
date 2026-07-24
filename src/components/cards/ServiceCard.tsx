import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { DeliveryModelBadge, type DeliveryModelKey } from "@/components/primitives/DeliveryModelBadge";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ServiceCard.module.css";

type ServiceCardProps = {
  /** Service name — rendered as the card's <h3>. */
  title: string;
  /** The service's own plain description. */
  description: string;
  /** Internal destination — the WHOLE card is this single link (e.g. /services/[cat]#[service]). */
  href: string;
  /** Real service-category name (visible text). */
  categoryLabel: string;
  /** Category icon name (rendered in a flat IconTile). */
  categoryIcon: string;
  /** Wayfinding colour token for the category (legacy or V2); mapped to an accessible V2 ink. */
  categoryTone?: string;
  /** One of the four locked delivery models — its exact label is rendered by DeliveryModelBadge. */
  deliveryModel: DeliveryModelKey;
  className?: string;
};

/**
 * ServiceCard — a delivery/category-led card for a single service. A flat category IconTile +
 * real category label head it; the service name is the H3; its own plain description follows;
 * and its real delivery model is shown with a DeliveryModelBadge carrying one of the four locked
 * labels (never an invented model, provider, partnership, certification, price, duration or
 * numeric outcome). The whole card is one link (a single tab stop, no nested link or button)
 * with soft elevation and a ≤2px hover matched by focus; title and description wrap and stay
 * readable at 200%. Colour is resolved through the domain bridge (accessible ink), never a
 * legacy token as text. No node-orb, glow, glass, gradient or fixed height. Server Component.
 */
export function ServiceCard({
  title,
  description,
  href,
  categoryLabel,
  categoryIcon,
  categoryTone,
  deliveryModel,
  className,
}: ServiceCardProps) {
  const ink = domainInk(categoryTone);
  return (
    <Card
      href={href}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={categoryIcon} />
        </IconTile>
        <span className={styles.category}>{categoryLabel}</span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <span className={styles.delivery}>
        <DeliveryModelBadge model={deliveryModel} />
      </span>

      <span className={styles.more} aria-hidden="true">
        See this service
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
