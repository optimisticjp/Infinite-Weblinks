import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./BusinessTypeCard.module.css";

type BusinessTypeCardProps = {
  /** Business-type name — rendered as the card's <h3>. */
  title: string;
  /** The real one-line summary of the audience. */
  summary: string;
  /** Internal destination — the WHOLE card is this single link (/business-types/[slug]). */
  href: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
  className?: string;
};

/**
 * BusinessTypeCard — an audience-led whole-card destination for the Goals hub's "by business
 * type" facet. A flat IconTile + a visible "Business type" label head it; the business-type name
 * is the H3; and its real one-line summary follows, with a quiet destination affordance. It is a
 * compact hub card: no roadmap preview, no fabricated audience qualification, no numbering. The
 * whole card is one link (a single tab stop, no nested interaction) with soft elevation and a
 * ≤2px hover matched by focus; long names and summaries wrap. Colour maps through the domain
 * bridge to an accessible ink, never a legacy token as text. No node-orb, glow, glass, gradient,
 * giant artwork or fixed height. Server Component.
 */
export function BusinessTypeCard({ title, summary, href, icon, tone, className }: BusinessTypeCardProps) {
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
        <span className={styles.kicker}>Business type</span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.summary}>{summary}</p>

      <span className={styles.more} aria-hidden="true">
        See what matters
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
