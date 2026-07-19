import { X, Check } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import styles from "./HonestExpectationsSection.module.css";

const WONT: { title: string; body: string }[] = [
  { title: "No overnight results", body: "Real growth shows over months, not days. We'll say so up front rather than sell a shortcut." },
  { title: "No guaranteed rankings", body: "Nobody can promise a spot on Google. Anyone who does is guessing with your money." },
  { title: "No invented numbers", body: "We won't promise a set number of sales or leads to win the work." },
  { title: "No lock-in", body: "Your accounts, data and files stay in your name, so you can leave whenever you want." },
];

const PROMISE: { title: string; body: string; hue: string }[] = [
  { title: "A clear plan", body: "You'll always know what we're doing, in what order, and why.", hue: "var(--domain-strategy)" },
  { title: "Work done properly", body: "Built to a standard we'd be happy to show anyone, not rushed to hit a deadline.", hue: "var(--domain-build)" },
  { title: "Honest reporting", body: "Real numbers every time, including when a test doesn't work and we change course.", hue: "var(--domain-discover)" },
  { title: "Steady improvement", body: "Small, compounding steps backed by data, not big risky bets on one idea.", hue: "var(--domain-retain)" },
];

/**
 * HonestExpectationsSection — the trust differentiator: what we won't promise, next to what
 * we will. Written plainly, no hype and no numbers. Two panels, one restrained and one lit,
 * so the contrast reads at a glance.
 */
export function HonestExpectationsSection() {
  return (
    <SectionShell
      id="honest"
      align="start"
      eyebrow="Honest expectations"
      title={
        <>
          What we promise, and what we <span className="iw-gradient-word">won&apos;t</span>.
        </>
      }
      lead="We sell honesty as much as we sell growth. Here's the plain version, so there are no surprises later."
    >
      <div className={styles.grid}>
        <div className={styles.panelWont}>
          <h3 className={styles.panelTitle}>What we won&apos;t do</h3>
          <ul className={styles.list}>
            {WONT.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={styles.noIcon} aria-hidden="true">
                  <X size={16} strokeWidth={2.5} />
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemBody}>{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panelPromise}>
          <h3 className={styles.panelTitle}>What we do promise</h3>
          <ul className={styles.list}>
            {PROMISE.map((item) => (
              <li key={item.title} className={styles.item}>
                <NodeOrb hue={item.hue} size={34}>
                  <Check aria-hidden="true" strokeWidth={2.5} />
                </NodeOrb>
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemBody}>{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
