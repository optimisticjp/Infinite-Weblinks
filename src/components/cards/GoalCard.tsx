import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk, domainTint } from "@/lib/design/domainColor";
import styles from "./GoalCard.module.css";

type GoalCardProps = {
  /** Goal title — rendered as the card's <h3>. */
  title: string;
  /** The intended outcome — the kind of result the work is built to produce, never a promise. */
  outcome: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Icon name (rendered in a flat IconTile). */
  icon: string;
  /** Wayfinding tone (legacy or V2 domain-role token); mapped to an accessible V2 ink + tint. */
  tone?: string;
  /** Who the goal is for — shown ONLY when the goal actually carries one (no fabricated fallback). */
  audienceHint?: string;
  className?: string;
};

/**
 * GoalCard — an outcome-led card for the goals a business comes in with. A flat IconTile and a
 * visible "Goal" label head it; the goal title is the H3; the audience hint shows only when the
 * goal genuinely has one; and the intended outcome is the prominent element, carried in a soft
 * tone-tinted block so it reads first without any glow or gradient. The whole card is one link
 * (a single tab stop, no nested interaction) with soft neutral elevation, a semantic border, a
 * ≤2px hover matched by focus, and titles/outcomes that wrap. Colour is resolved through the
 * domain bridge (accessible ink + tint), never a legacy token as text. No node-orb, glow, glass,
 * gradient, artwork, fixed height, featured emphasis, metric or guarantee. Server Component.
 */
export function GoalCard({ title, outcome, href, icon, tone, audienceHint, className }: GoalCardProps) {
  const ink = domainInk(tone);
  const tint = domainTint(tone);
  return (
    <Card
      href={href}
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-tint" as string]: tint } as CSSProperties}
    >
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
        <span className={styles.kicker}>Goal</span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      {audienceHint ? <p className={styles.audience}>{audienceHint}</p> : null}

      <div className={styles.outcome}>
        <span className={styles.outcomeLabel}>Intended outcome</span>
        <p className={styles.outcomeText}>{outcome}</p>
      </div>

      <span className={styles.more} aria-hidden="true">
        Explore this goal
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
