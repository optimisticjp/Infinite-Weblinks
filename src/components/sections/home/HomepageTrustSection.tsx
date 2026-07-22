import type { CSSProperties } from "react";
import { X, Check } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import { getAccountOwnership } from "@/lib/content";
import {
  honestExpectationsWont,
  honestExpectationsPromise,
} from "@/lib/content/data/honest-expectations";
import styles from "./HomepageTrustSection.module.css";

/**
 * HomepageTrustSection — the merged trust section (id="ownership", explicit light surface, plain
 * H2). Ownership uses the real account-ownership data: heading, body, vault label, the assets you
 * own ("Owned and controlled by you"), the build flow in source order, every guarantee, and the
 * closing statement — as one restrained Card + semantic lists, with NO vault glow, orbit,
 * constellation, raw palette cycling or giant dark panel. The honest-expectations subsection
 * (id="honest") reads the centralised data and lists "What we won't do" and "What we do promise"
 * in source order with clear X/check wording and icons (no NodeOrb, glow, or colour-only meaning).
 * The account-ownership closing sentence is shown; its old CTA button pair is NOT repeated (the
 * FinalCtaSection follows). Server Component.
 */
export async function HomepageTrustSection({ surface = "light" }: { surface?: "light" | "alt" }) {
  const ownership = await getAccountOwnership();
  const heading = `${ownership.heading.pre}${ownership.heading.accent}${ownership.heading.post}`;
  const closing = `${ownership.closing.pre}${ownership.closing.accent}${ownership.closing.post}`;

  return (
    <SectionShell
      surface={surface}
      id="ownership"
      eyebrow={ownership.eyebrow}
      title={heading}
      lead={ownership.body}
      align="start"
    >
      <div className={styles.ownership}>
        <Card variant="raised" className={styles.vaultCard}>
          <p className={styles.vaultLabel}>{ownership.vaultLabel}</p>
          <p className={styles.owned}>Owned and controlled by you</p>
          <ul className={styles.assets}>
            {ownership.assets.map((a) => (
              <li key={a.label} className={styles.asset}>
                <span className={styles.assetIcon} aria-hidden="true">
                  <Icon name={a.icon} />
                </span>
                {a.label}
              </li>
            ))}
          </ul>
        </Card>

        <div className={styles.flowWrap}>
          <p className={styles.flowLabel}>How we build it</p>
          <ol className={styles.flow}>
            {ownership.flow.map((f) => {
              const ink = domainInk(f.color);
              return (
                <li key={f.label} className={styles.flowStep} style={{ ["--flow-ink" as string]: ink } as CSSProperties}>
                  <IconTile color={ink} size="sm">
                    <Icon name={f.icon} />
                  </IconTile>
                  {f.label}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <ul className={styles.guarantees}>
        {ownership.guarantees.map((g) => {
          const ink = domainInk(g.color);
          return (
            <li key={g.title} className={styles.guarantee}>
              <IconTile color={ink} size="md">
                <Icon name={g.icon} />
              </IconTile>
              <h3 className={styles.guaranteeTitle}>{g.title}</h3>
              <p className={styles.guaranteeBody}>{g.body}</p>
            </li>
          );
        })}
      </ul>

      <p className={styles.closing}>{closing}</p>

      <div id="honest" className={styles.honest}>
        <h3 className={styles.honestHeading}>Honest expectations</h3>
        <p className={styles.honestLead}>
          We sell honesty as much as we sell growth. Here&apos;s the plain version, so there are no
          surprises later.
        </p>
        <div className={styles.honestGrid}>
          <div className={styles.honestCol}>
            <h4 className={styles.honestColHeading}>What we won&apos;t do</h4>
            <ul className={styles.honestList}>
              {honestExpectationsWont.map((item) => (
                <li key={item.title} className={styles.honestItem}>
                  <span className={`${styles.honestIcon} ${styles.wontIcon}`} aria-hidden="true">
                    <X size={15} strokeWidth={2.5} />
                  </span>
                  <span className={styles.honestText}>
                    <span className={styles.honestItemTitle}>{item.title}</span>
                    <span className={styles.honestItemBody}>{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.honestCol}>
            <h4 className={styles.honestColHeading}>What we do promise</h4>
            <ul className={styles.honestList}>
              {honestExpectationsPromise.map((item) => (
                <li key={item.title} className={styles.honestItem}>
                  <span className={`${styles.honestIcon} ${styles.promiseIcon}`} aria-hidden="true">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  <span className={styles.honestText}>
                    <span className={styles.honestItemTitle}>{item.title}</span>
                    <span className={styles.honestItemBody}>{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
