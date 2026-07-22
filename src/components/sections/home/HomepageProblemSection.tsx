import type { CSSProperties } from "react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import type { EditorialSection } from "@/lib/content/types";
import styles from "./HomepageProblemSection.module.css";

/**
 * HomepageProblemSection — the V2 replacement for the legacy EditorialStatement on the homepage
 * (the legacy component stays for its registry mapping). It renders the existing EditorialSection
 * verbatim on an explicit V2 alternate surface: the eyebrow, the complete heading text (plain H2,
 * no gradient word), every body paragraph in source order at a readable measure, and the three
 * points as restrained static Cards with flat IconTiles in their mapped V2 tones. No platform-logo
 * ring, NotificationCard, fake "New order" state, InfinityMark, floating composition, theme-band or
 * featured first point. Server Component.
 */
export function HomepageProblemSection({ data }: { data: EditorialSection }) {
  const heading = `${data.heading.pre}${data.heading.accent}${data.heading.post}`;
  return (
    <SectionShell surface="alt" eyebrow={data.eyebrow} title={heading} align="start">
      <div className={styles.body}>
        {data.body.map((para, i) => (
          <p key={i} className={styles.para}>
            {para}
          </p>
        ))}
      </div>

      <CardGrid layout="equal" aria-label="How we help you see the connected picture">
        {(data.points ?? []).map((point) => {
          const ink = domainInk(point.color);
          return (
            <Card
              key={point.title}
              as="article"
              variant="outlined"
              accent={ink}
              className={styles.point}
              style={{ ["--card-accent" as string]: ink } as CSSProperties}
            >
              <IconTile color={ink} size="md">
                <Icon name={point.icon} />
              </IconTile>
              <h3 className={styles.pointTitle}>{point.title}</h3>
              <p className={styles.pointBody}>{point.body}</p>
            </Card>
          );
        })}
      </CardGrid>
    </SectionShell>
  );
}
