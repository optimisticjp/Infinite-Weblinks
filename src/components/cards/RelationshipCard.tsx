import { Children, isValidElement, type ReactNode } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./RelationshipCard.module.css";

type RelationshipCardProps = {
  /** Group heading — rendered as an <h3>. */
  title: string;
  /** Optional one-line description of the relationship. */
  description?: string;
  /** Optional decorative glyph (wrapped in a flat IconTile). */
  icon?: ReactNode;
  /** Optional wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  tone?: string;
  /** The related destinations — usually LinkChip elements. */
  children: ReactNode;
  className?: string;
};

/**
 * RelationshipCard — a static grouping card for a detail page, collecting a real set of related
 * destinations (e.g. "Connects with", "Where it fits in the journey", "Suits these businesses",
 * "Related service domains"). It is NOT a whole-card link: its children are the individual
 * navigation links (usually LinkChip). A clear H3 title, an optional description and a flat
 * IconTile, on a neutral raised surface with a semantic border and neutral shadow — no glow,
 * glass, giant illustration or fixed height, and it renders nothing when there are no
 * relationships (so callers never produce an empty card). Server Component.
 */
export function RelationshipCard({
  title,
  description,
  icon,
  tone,
  children,
  className,
}: RelationshipCardProps) {
  // Never render an empty relationship card.
  const items = Children.toArray(children).filter(
    (c) => isValidElement(c) || (typeof c === "string" && c.trim().length > 0),
  );
  if (items.length === 0) return null;

  const ink = domainInk(tone);
  return (
    <Card variant="raised" accent={ink} className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.head}>
        {icon ? (
          <IconTile color={ink} size="sm">
            {icon}
          </IconTile>
        ) : null}
        <div className={styles.heading}>
          <h3 className={styles.title}>{title}</h3>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
      </div>
      <div className={styles.links}>{children}</div>
    </Card>
  );
}
