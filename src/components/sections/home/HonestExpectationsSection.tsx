import { X, Check } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import {
  honestExpectationsWont as WONT,
  honestExpectationsPromise as PROMISE,
} from "@/lib/content/data/honest-expectations";
import styles from "./HonestExpectationsSection.module.css";

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
