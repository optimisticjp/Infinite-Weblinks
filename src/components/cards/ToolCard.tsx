import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Chip } from "@/components/primitives/Chip";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ToolCard.module.css";

/** How many connection chips show inline before collapsing the rest into a "+N more" chip. */
const MAX_CONNECTIONS = 3;

type ToolCardProps = {
  /** Tool-area title — rendered as the card's <h3>. */
  title: string;
  /** Plain "what it does" description. */
  description: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Real category name (visible text). */
  categoryLabel: string;
  /** Wayfinding colour token for the category (legacy or V2); mapped to an accessible V2 ink. */
  categoryTone?: string;
  /** Category icon name (rendered in a flat IconTile). */
  categoryIcon: string;
  /** Real connected-area category NAMES (already resolved from slugs by the caller). */
  connectedAreaLabels?: string[];
  className?: string;
};

/**
 * ToolCard — a catalog card for the Tools hub, led by its category and the areas it connects
 * to. A flat category IconTile + category label head, an H3 tool-area title, a plain
 * description, and — its signature — a "Connects with" group of up to three real connected
 * category names (a truthful "+N more" chip when there are more). The whole card is one link
 * with soft elevation and a ≤2px hover matched by focus. No node-orb, glow, glass, giant art,
 * product screenshot or product-logo rail, and no example product brands: the card represents
 * a tool CATEGORY Infinite Weblinks helps select, configure and connect — never a partnership,
 * certification, endorsement or ownership claim. Server Component.
 */
export function ToolCard({
  title,
  description,
  href,
  categoryLabel,
  categoryTone,
  categoryIcon,
  connectedAreaLabels,
  className,
}: ToolCardProps) {
  const ink = domainInk(categoryTone);
  const connections = connectedAreaLabels ?? [];
  const shown = connections.slice(0, MAX_CONNECTIONS);
  const overflow = connections.length - shown.length;

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

      {connections.length > 0 ? (
        <div className={styles.connects}>
          <span className={styles.connectsLabel}>Connects with</span>
          <div className={styles.chips}>
            {shown.map((label) => (
              <Chip key={label}>{label}</Chip>
            ))}
            {overflow > 0 ? <Chip>{`+${overflow} more`}</Chip> : null}
          </div>
        </div>
      ) : null}

      <span className={styles.more} aria-hidden="true">
        Explore this area
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
