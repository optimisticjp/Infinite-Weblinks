import { ArrowDown, ArrowRight } from "lucide-react";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getSystems } from "@/lib/content";
import styles from "./ConnectedSystemSection.module.css";

/**
 * The fixed six-node "one system, not silos" flow (Growth Guide p.19). These are
 * plain-English connector labels, not CMS taxonomy, so they're defined locally
 * rather than fetched — nothing here is an invented metric or claim.
 */
const FLOW: { key: string; label: string; icon: string; color: string }[] = [
  { key: "discover", label: "SEO, Ads & Social", icon: "megaphone", color: "var(--domain-search)" },
  { key: "site", label: "Website & Store", icon: "monitor", color: "var(--domain-website)" },
  { key: "analytics", label: "Analytics", icon: "bar-chart-3", color: "var(--domain-analytics)" },
  { key: "crm", label: "Email & CRM", icon: "mail", color: "var(--domain-customer)" },
  { key: "automation", label: "AI & Automation", icon: "zap", color: "var(--domain-automation)" },
  { key: "retain", label: "Retention", icon: "heart", color: "var(--lime)" },
];

/**
 * ConnectedSystemSection — "One system, not silos" (theme-dark).
 *
 * Static-first: the flow and the three cross-cutting systems are always fully
 * legible as text; the only motion is a decorative pulse gated behind
 * `prefers-reduced-motion: no-preference` in CSS, so reduced-motion users get the
 * complete static diagram with nothing missing.
 */
export async function ConnectedSystemSection({ anchorId }: { anchorId?: string }) {
  const systems = await getSystems();

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section iw-section--loose ${styles.section}`}
      aria-labelledby="connected-system-heading"
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className="iw-container">
        <SectionHeader
          id="connected-system-heading"
          eyebrow="How it all connects"
          title="One system, not separate silos"
          intro="Most sites treat search, the store, analytics, email and support as separate tools that don't talk to each other. We connect them, so a change in one place shows up correctly everywhere else."
        />

        <ol
          className={styles.rail}
          aria-label="The connected flow, from getting found to being retained"
        >
          {FLOW.map((node, i) => (
            <li key={node.key} className={styles.step}>
              <div className={styles.node} style={{ ["--node-color" as string]: node.color }}>
                <IconTile color={node.color} variant="filled" size={56}>
                  <Icon name={node.icon} />
                </IconTile>
                <span className={styles.label}>{node.label}</span>
              </div>
              {i < FLOW.length - 1 && (
                <span className={styles.connector} aria-hidden="true">
                  <ArrowRight className={styles.connectorIconRow} />
                  <ArrowDown className={styles.connectorIconCol} />
                </span>
              )}
            </li>
          ))}
        </ol>

        {systems.length > 0 && (
          <div className={styles.systemsBand}>
            <p className={styles.systemsCaption}>
              Running across every stage of that flow, not sitting at one point in it:
            </p>
            <ul className={styles.systemsList}>
              {systems.map((s) => (
                <li key={s.key} className={styles.systemItem}>
                  <IconTile color={s.color} size={40}>
                    <Icon name={s.icon} />
                  </IconTile>
                  <div>
                    <p className={styles.systemName}>{s.name}</p>
                    <p className={styles.systemDescription}>{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
