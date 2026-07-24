import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ServiceCategoryCard.module.css";

type ServiceCategoryCardProps = {
  /** Position in source order (1-based). */
  order: number;
  /** Category name (verbatim). */
  title: string;
  /** Category intro (verbatim). */
  description: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Category icon name. */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  tone: string;
  /** Number of renderable services in this category. */
  serviceCount: number;
  className?: string;
};

/**
 * ServiceCategoryCard — a restrained whole-card route from the Services hub into one category. A
 * compact order marker, a flat IconTile, the category name as its H3, the intro, an exact
 * singular/plural service count and a quiet destination affordance. The whole card is one internal
 * link (Card href mode) — no nested link or button — with a ≤2px hover matched by focus, and
 * reduced-motion-safe motion; long names and intros wrap. Colour is resolved through the domain
 * bridge (accessible ink). No featured/selected state, NodeOrb, BentoCard, glow, glass, gradient,
 * fixed height or horizontal rail. Server Component. The public name, intro, icon and order come
 * from the ServiceCategory, not the domain config.
 */
export function ServiceCategoryCard({
  order,
  title,
  description,
  href,
  icon,
  tone,
  serviceCount,
  className,
}: ServiceCategoryCardProps) {
  const ink = domainInk(tone);
  const countLabel = `${serviceCount} service${serviceCount === 1 ? "" : "s"}`;

  return (
    <Card href={href} variant="raised" accent={ink} className={[styles.card, className].filter(Boolean).join(" ")}>
      <span className={styles.head}>
        <span className={styles.marker} aria-hidden="true">
          {String(order).padStart(2, "0")}
        </span>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <span className={styles.footer}>
        <span className={styles.count}>{countLabel}</span>
        <span className={styles.more} aria-hidden="true">
          Explore
          <ArrowUpRight className={styles.moreIcon} />
        </span>
      </span>
    </Card>
  );
}
