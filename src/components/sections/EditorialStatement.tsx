import { Compass, Link2, Target, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/primitives/IconTile";
import type { EditorialSection } from "@/lib/content/types";
import styles from "./EditorialStatement.module.css";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  link: Link2,
  target: Target,
};

/**
 * The bright editorial band that follows the dark hero — the required section-rhythm
 * break (never more than ~2 dark sections in a row). Dark ink text on cream, so all
 * contrast passes; the emphasised word uses a solid accent (deep violet), not the
 * dark-tuned gradient text.
 */
export function EditorialStatement({ data }: { data: EditorialSection }) {
  return (
    <section className={`theme-band iw-section ${styles.section}`} aria-labelledby="editorial-heading">
      <div className="iw-container">
        <div className={styles.top}>
          <div className={styles.lead}>
            <p className="iw-eyebrow">{data.eyebrow}</p>
            <h2 id="editorial-heading" className={styles.heading}>
              {data.heading.pre}
              <span className={styles.accent}>{data.heading.accent}</span>
              {data.heading.post}
            </h2>
          </div>
          <div className={styles.body}>
            {data.body.map((p, i) => (
              <p key={i} className={styles.para}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {data.points && (
          <ul className={styles.points}>
            {data.points.map((pt) => {
              const Icon = ICONS[pt.icon] ?? Compass;
              return (
                <li key={pt.title} className={styles.point}>
                  <IconTile color={pt.color} variant="filled" size={46}>
                    <Icon aria-hidden="true" />
                  </IconTile>
                  <div>
                    <p className={styles.pointTitle}>{pt.title}</p>
                    <p className={styles.pointBody}>{pt.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
