import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./GrowthPlanPreview.module.css";

/** What a plan is built FROM — the real inputs the Growth Plan asks for (no fabricated values). */
const CONTEXT = [
  { label: "Your business", icon: "star" },
  { label: "Your goal", icon: "target" },
  { label: "Your current setup", icon: "settings" },
];

/** The three real plan-organisation buckets (see PlanReveal) — labels only, no invented services. */
const BUCKETS = [
  { eyebrow: "Do this first", title: "Start here", icon: "rocket", tone: "var(--domain-strategy)" },
  { eyebrow: "Then connect", title: "Connect next", icon: "git-branch", tone: "var(--domain-discover)" },
  { eyebrow: "Later", title: "Add later", icon: "trending-up", tone: "var(--domain-operate)" },
];

/**
 * GrowthPlanPreview — a truthful STATIC preview of how the real Growth Plan organises a
 * recommendation: the context it is built from (your business / goal / current setup), the three
 * real ordering buckets (Start here → Connect next → Add later), a note that the sequence is
 * tailored during discovery, and an ownership reassurance. It shows the OUTPUT STRUCTURE, not a
 * fabricated generated plan: no fake business name, selected goal, service recommendation,
 * completion percentage, date, price, result, email, submit button, form control, selected state
 * or loading/generated state. Server Component; static Card composition on light paper; flat
 * IconTiles; no NodeOrb, ConnectorPath, glow, glass, gradient, animation, client boundary or fixed
 * height. Understandable with CSS disabled.
 */
export function GrowthPlanPreview() {
  return (
    <div className={styles.preview} role="group" aria-label="Preview: how your growth plan is organised">
      <div className={styles.head}>
        <IconTile color="var(--v2-brand-strong)" size="sm">
          <Sparkles aria-hidden="true" />
        </IconTile>
        <span className={styles.label}>Your growth plan</span>
      </div>

      <p className={styles.builtFrom}>Built from</p>
      <ul className={styles.context}>
        {CONTEXT.map((c) => (
          <li key={c.label} className={styles.ctxItem}>
            <span className={styles.ctxIcon} aria-hidden="true">
              <Icon name={c.icon} />
            </span>
            {c.label}
          </li>
        ))}
      </ul>

      <ol className={styles.buckets}>
        {BUCKETS.map((b) => {
          const ink = domainInk(b.tone);
          return (
            <li key={b.title} className={styles.bucket} style={{ ["--bucket-ink" as string]: ink } as CSSProperties}>
              <IconTile color={ink} size="sm">
                <Icon name={b.icon} />
              </IconTile>
              <span className={styles.bucketText}>
                <span className={styles.bucketEyebrow}>{b.eyebrow}</span>
                <span className={styles.bucketTitle}>{b.title}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className={styles.tailored}>The order is tailored to your business during discovery.</p>
      <p className={styles.ownership}>Built in your name — you keep your accounts, data and tools.</p>
    </div>
  );
}
