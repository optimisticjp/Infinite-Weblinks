import { Bell, Compass, Link2, Mail, Target, type LucideIcon } from "lucide-react";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { IconTile } from "@/components/primitives/IconTile";
import { NotificationCard } from "@/components/viz/NotificationCard";
import type { EditorialSection } from "@/lib/content/types";
import styles from "./EditorialStatement.module.css";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  link: Link2,
  target: Target,
};

/**
 * Example platforms a business already touches — real brand logos (see public/brand-logos)
 * on light tiles, picturing the "everything connects around one centre" idea from ref 18.
 * Illustrative only, never partners or endorsements. Positions ring the pedestal; the
 * layout collapses to a wrapped row on narrow screens. The whole visual is aria-hidden
 * with a describing label on the wrapper, so each mark is a decorative duplicate.
 */
const PLATFORMS: { name: string; slug: string; x: number; y: number }[] = [
  { name: "TikTok", slug: "tiktok", x: 38, y: 6 },
  { name: "Google", slug: "google", x: 68, y: 9 },
  { name: "LinkedIn", slug: "linkedin", x: 90, y: 34 },
  { name: "Meta", slug: "meta", x: 86, y: 64 },
  { name: "YouTube", slug: "youtube", x: 10, y: 30 },
  { name: "Instagram", slug: "instagram", x: 8, y: 60 },
  { name: "Shopify", slug: "shopify", x: 26, y: 84 },
];

/**
 * The bright editorial band that follows the dark hero (ref 18) — the required
 * section-rhythm break. Dark ink on cream, so all contrast passes; the emphasised
 * word uses a solid accent (deep violet), never the dark-tuned gradient text.
 *
 * The right-hand ecosystem visual pictures the copy: the connected mark at the centre
 * with the platforms a business already uses floating around it. Daylight, so it is
 * glow-free — the mark carries glow={false} and there is no section bloom.
 */
export function EditorialStatement({ data }: { data: EditorialSection }) {
  return (
    <section
      className="theme-band iw-section"
      aria-labelledby="editorial-heading"
    >
      <div className="iw-container">
        <div className={styles.layout}>
          <div className={styles.lead}>
            <p className="iw-eyebrow">{data.eyebrow}</p>
            <h2 id="editorial-heading" className={styles.heading}>
              {data.heading.pre}
              <span className={styles.accent}>{data.heading.accent}</span>
              {data.heading.post}
            </h2>
            <div className={styles.body}>
              {data.body.map((p, i) => (
                <p key={i} className={styles.para}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div
            className={styles.visual}
            role="img"
            aria-label="The platforms a business already uses — Instagram, TikTok, Google, LinkedIn, Meta, YouTube and Shopify — connecting around one central mark."
          >
            <div className={styles.stage} aria-hidden="true">
              <div className={styles.ring}>
                {PLATFORMS.map((p) => (
                  <span
                    key={p.slug}
                    className={styles.chip}
                    style={{ ["--x" as string]: `${p.x}%`, ["--y" as string]: `${p.y}%` }}
                  >
                    <BrandLogo slug={p.slug} name={p.name} decorative />
                  </span>
                ))}
              </div>

              <span className={styles.pedestal} />
              <InfinityMark glow={false} size={148} className={styles.mark} />

              <NotificationCard
                className={styles.note1}
                tone="light"
                icon={<Mail aria-hidden="true" />}
                title="Email campaign"
                detail="Ready to send"
                color="var(--violet)"
              />
              <NotificationCard
                className={styles.note2}
                tone="light"
                icon={<Bell aria-hidden="true" />}
                title="New order"
                detail="Synced"
                color="var(--lime)"
              />
            </div>
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
