import type { CSSProperties } from "react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Chip } from "@/components/primitives/Chip";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ConnectedSystemFlow.module.css";

type FlowNode = {
  key: string;
  icon: string;
  title: string;
  blurb: string;
  tone: string;
  chips?: string[];
};

/** The five connected parts, in source order — preserved verbatim from the legacy OneSystemSection
 *  (title, blurb, icon, informational chips). */
const FLOW: FlowNode[] = [
  {
    key: "discovered",
    icon: "search",
    title: "Get discovered",
    blurb: "The right people find you.",
    tone: "var(--domain-discover)",
    chips: ["SEO", "Ads", "Social"],
  },
  {
    key: "website",
    icon: "monitor",
    title: "Your website",
    blurb: "Everything points here. This is where a visitor decides.",
    tone: "var(--domain-build)",
  },
  {
    key: "analytics",
    icon: "bar-chart-3",
    title: "Analytics",
    blurb: "Clean data shows what's working, so the next move isn't a guess.",
    tone: "var(--domain-ai)",
  },
  {
    key: "email",
    icon: "mail",
    title: "Email and SMS",
    blurb: "Follow up brings people back to finish and buy again.",
    tone: "var(--domain-convert)",
  },
  {
    key: "retain",
    icon: "heart",
    title: "Repeat customers",
    blurb: "Loyal customers cost less and buy more, so growth compounds.",
    tone: "var(--domain-retain)",
  },
];

/**
 * ConnectedSystemFlow — the five parts most businesses run as silos, shown as one connected
 * sequence: get discovered → your website → analytics → email & SMS → repeat customers, then the
 * loop note. A semantic ordered list with H3 node titles, flat IconTiles and static informational
 * Chips; a CSS-only down-chevron between nodes conveys direction. It explains a SYSTEM MODEL, so
 * it must never look like client evidence or a live analytics product: no ConnectorPath, NodeOrb,
 * InView, SVG path animation, ChartCard/StatCard/MessageCard, fake notification, "growing month on
 * month" demo, chart-like/measured-proof presentation, fixed height, horizontal overflow or
 * required interaction. Understandable with CSS disabled. Server Component.
 */
export function ConnectedSystemFlow() {
  return (
    <>
      <ol className={styles.flow} aria-label="How the parts connect into one loop">
        {FLOW.map((node) => {
          const ink = domainInk(node.tone);
          return (
            <li key={node.key} className={styles.node} style={{ ["--node-ink" as string]: ink } as CSSProperties}>
              <span className={styles.head}>
                <IconTile color={ink} size="md">
                  <Icon name={node.icon} />
                </IconTile>
                <h3 className={styles.title}>{node.title}</h3>
              </span>
              <p className={styles.blurb}>{node.blurb}</p>
              {node.chips ? (
                <span className={styles.chips}>
                  {node.chips.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className={styles.loopNote}>
        Then it feeds back in. Happy customers get discovered by more people, and the loop
        strengthens every time round.
      </p>
    </>
  );
}
