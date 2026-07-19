import { Fragment } from "react";
import { SectionShell } from "@/components/sections/SectionShell";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import { InView } from "@/components/viz/InView";
import { StatCard, ChartCard, MessageCard } from "@/components/viz/FloatingCards";
import styles from "./OneSystemSection.module.css";

type FlowNode = {
  key: string;
  icon: string;
  title: string;
  blurb: string;
  hue: string;
  chips?: string[];
};

const FLOW: FlowNode[] = [
  {
    key: "discovered",
    icon: "search",
    title: "Get discovered",
    blurb: "The right people find you.",
    hue: "var(--domain-discover)",
    chips: ["SEO", "Ads", "Social"],
  },
  {
    key: "website",
    icon: "monitor",
    title: "Your website",
    blurb: "Everything points here. This is where a visitor decides.",
    hue: "var(--domain-build)",
  },
  {
    key: "analytics",
    icon: "bar-chart-3",
    title: "Analytics",
    blurb: "Clean data shows what's working, so the next move isn't a guess.",
    hue: "var(--domain-ai)",
  },
  {
    key: "email",
    icon: "mail",
    title: "Email and SMS",
    blurb: "Follow up brings people back to finish and buy again.",
    hue: "var(--domain-convert)",
  },
  {
    key: "retain",
    icon: "heart",
    title: "Repeat customers",
    blurb: "Loyal customers cost less and buy more, so growth compounds.",
    hue: "var(--domain-retain)",
  },
];

/**
 * OneSystemSection — the differentiator. The five parts most businesses run as silos, shown
 * as one loop: get discovered, your website, analytics, email, repeat customers. The
 * connectors between them draw in as the section scrolls into view (reduced-motion safe),
 * so the "everything connects" idea reads without a heavy pinned scroll.
 */
export function OneSystemSection() {
  return (
    <SectionShell
      id="how-it-connects"
      align="start"
      background
      eyebrow="One system, not silos"
      title={
        <>
          Separate parts leak effort. <span className="iw-gradient-word">Connected</span>, they compound.
        </>
      }
      lead="Most businesses run their website, marketing and tools as separate pieces. When they feed each other, the same effort goes further every month."
    >
      <ol className={styles.flow} aria-label="How the parts connect into one loop">
        {FLOW.map((node, i) => (
          <Fragment key={node.key}>
            <li className={styles.node} style={{ ["--node-hue" as string]: node.hue }}>
              <NodeOrb hue={node.hue} size={52} emphasis="bright">
                <Icon name={node.icon} />
              </NodeOrb>
              <h3 className={styles.nodeTitle}>{node.title}</h3>
              <p className={styles.nodeBlurb}>{node.blurb}</p>
              {node.chips ? (
                <span className={styles.chips}>
                  {node.chips.map((c) => (
                    <span key={c} className={styles.chip}>
                      {c}
                    </span>
                  ))}
                </span>
              ) : null}
            </li>
            {i < FLOW.length - 1 ? (
              <li className={styles.connItem} aria-hidden="true">
                <ConnectorPath
                  className={styles.conn}
                  from={node.hue}
                  via={FLOW[i + 1].hue}
                  to={FLOW[i + 1].hue}
                  dots={1}
                  d="M0 12 H100"
                />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>

      <p className={styles.loopNote}>
        Then it feeds back in. Happy customers get discovered by more people, and the loop
        strengthens every time round.
      </p>

      <InView className={styles.floats} ariaHidden>
        <ChartCard label="Traffic to sales" hue="var(--domain-ai)" style={{ ["--d" as string]: "0s" }} />
        <StatCard
          label="Repeat customers"
          value="Growing"
          trend="Month on month"
          hue="var(--domain-retain)"
          style={{ ["--d" as string]: "1.1s" }}
        />
        <MessageCard
          title="Win-back sent"
          body="Left something in the cart?"
          hue="var(--domain-convert)"
          style={{ ["--d" as string]: "0.6s" }}
        />
      </InView>
    </SectionShell>
  );
}
