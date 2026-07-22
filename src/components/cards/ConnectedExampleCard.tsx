import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { Chip } from "@/components/primitives/Chip";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ConnectedExampleCard.module.css";

type ConnectedExampleCardProps = {
  title: string;
  summary: string;
  /** The real business goal this combination is built around. */
  goalHint: string;
  /** Plain-text service labels ("areas we can connect"). */
  services: string[];
  /** Wayfinding tone (a legacy palette token, mapped through the domain bridge). */
  tone: string;
  className?: string;
};

/**
 * ConnectedExampleCard — a STATIC illustrative combination card (NOT a link). An information Badge
 * ("Illustrative combination"), the real goalHint, the title as its H3, the summary, and every
 * service label as a static Chip. No false destination affordance, no "See how it works" label, no
 * client name, testimonial, result or metric, no featured/first-card emphasis, and it never reads
 * the legacy `theme`/`featured` presentation fields. Mapped V2 tone; no glow, glass, gradient or
 * fixed height. Server-safe; understandable with CSS disabled.
 */
export function ConnectedExampleCard({ title, summary, goalHint, services, tone, className }: ConnectedExampleCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      as="article"
      variant="raised"
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ ["--card-accent" as string]: ink } as CSSProperties}
    >
      <span className={styles.badge}>
        <Badge tone="information">Illustrative combination</Badge>
      </span>
      <p className={styles.goalHint}>
        <span className={styles.goalLabel}>Goal</span>
        {goalHint}
      </p>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.summary}>{summary}</p>
      <ul className={styles.chips} aria-label="Areas connected in this combination">
        {services.map((service) => (
          <li key={service}>
            <Chip>{service}</Chip>
          </li>
        ))}
      </ul>
    </Card>
  );
}
