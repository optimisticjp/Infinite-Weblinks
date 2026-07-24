import type { CSSProperties } from "react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import type { AccountOwnership } from "@/lib/content/types";
import styles from "./OwnershipDetails.module.css";

/**
 * OwnershipDetails — the reusable, composition-only presentation of the account-ownership promise:
 * the vault Card (label + "Owned and controlled by you" + the assets you own), the build flow in
 * source order, every guarantee, and the complete closing statement. It has NO <section> root and
 * NO H1, so it drops inside an existing SectionShell (the homepage trust section and
 * /account-ownership). Restrained Card/panel hierarchy, a semantic asset list + ordered flow +
 * guarantee list, flat IconTiles in mapped V2 tones — no vault glow, tool constellation, orbit,
 * raw palette cycling, giant dark panel, NodeOrb, CTA button or animation. Server-safe.
 */
export function OwnershipDetails({ data, className }: { data: AccountOwnership; className?: string }) {
  const closing = `${data.closing.pre}${data.closing.accent}${data.closing.post}`;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.ownership}>
        <Card variant="raised" className={styles.vaultCard}>
          <p className={styles.vaultLabel}>{data.vaultLabel}</p>
          <p className={styles.owned}>Owned and controlled by you</p>
          <ul className={styles.assets}>
            {data.assets.map((a) => (
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
            {data.flow.map((f) => {
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
        {data.guarantees.map((g) => {
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
    </div>
  );
}
