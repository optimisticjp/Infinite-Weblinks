import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./DomainCard.module.css";

type DomainCardProps = {
  /** Domain title — rendered as the card's <h3>. */
  title: string;
  /** Short intro / description. */
  description: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding tone (legacy or V2 domain-role token); mapped to an accessible V2 ink. */
  tone?: string;
  /** Optional small kicker above the title. */
  eyebrow?: string;
  className?: string;
};

/**
 * DomainCard — a restrained whole-card link to a service domain, for the related-domain sections
 * on tool and case-scenario detail pages. A flat IconTile, an optional eyebrow, an H3 title, a
 * short description and a quiet destination affordance. The whole card is one link (Card href
 * mode) with soft elevation, a ≤2px hover matched by focus, and reduced-motion-safe motion; long
 * titles and descriptions wrap. Colour is resolved through the domain bridge (accessible ink,
 * never a legacy token as text). No node-orb, glow, glass, gradient, giant artwork or fixed
 * height. Server Component.
 */
export function DomainCard({
  title,
  description,
  href,
  icon,
  tone,
  eyebrow,
  className,
}: DomainCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      href={href}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <span className={styles.more} aria-hidden="true">
        Explore this domain
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
