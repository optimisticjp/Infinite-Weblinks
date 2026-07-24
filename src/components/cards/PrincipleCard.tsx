import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./PrincipleCard.module.css";

type PrincipleCardProps = {
  /** The principle title (verbatim). */
  title: string;
  /** The principle body (verbatim). */
  body: string;
  /** Icon name from the shared Icon map. */
  icon: string;
  /** Wayfinding tone (a legacy `--domain-*` / palette token, mapped through the domain bridge). */
  tone: string;
  className?: string;
};

/**
 * PrincipleCard — a STATIC positioning-principle card for /about. A restrained outlined Card (not
 * a link), a flat IconTile in the mapped V2 tone, the exact title as its H3 and the exact body. No
 * link or button, no featured/enlarged state, no NodeOrb, glow, glass, gradient, fixed height or
 * numeric claim; understandable with CSS disabled. Server-safe.
 */
export function PrincipleCard({ title, body, icon, tone, className }: PrincipleCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      as="article"
      variant="outlined"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-accent" as string]: ink } as CSSProperties}
    >
      <IconTile color={ink} size="md">
        <Icon name={icon} />
      </IconTile>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </Card>
  );
}
