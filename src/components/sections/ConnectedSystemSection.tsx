import { ArrowRight, Check } from "lucide-react";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Constellation, type ConstellationNode } from "@/components/viz/Constellation";
import { getSystems } from "@/lib/content";
import styles from "./ConnectedSystemSection.module.css";

/**
 * The connected digital pieces, shown as a glow-free constellation around the mark. These
 * are plain-English connector labels, not CMS taxonomy, so they're defined locally rather
 * than fetched — nothing here is an invented metric or claim.
 */
const NODES: ConstellationNode[] = [
  { key: "site", label: "Website & Store", icon: "monitor", color: "var(--domain-website)" },
  { key: "search", label: "Get Found", icon: "search", color: "var(--cyan)" },
  { key: "social", label: "Ads & Social", icon: "megaphone", color: "var(--pink)" },
  { key: "crm", label: "Email & CRM", icon: "mail", color: "var(--orange)" },
  { key: "automation", label: "Automation", icon: "zap", color: "var(--violet)" },
  { key: "retain", label: "Retention", icon: "heart", color: "var(--lime)" },
];

/**
 * ConnectedSystemSection — "Digital systems that work together" (theme-band-bright, ref 11).
 *
 * Daylight band: no neon glow, no bloom. The three cross-cutting systems read as connected
 * checkpoints on the left; the mark and its orbiting pieces sit glow-free on the right.
 * Fully static and legible as text, so there is nothing to break under reduced motion.
 */
export async function ConnectedSystemSection({ anchorId }: { anchorId?: string }) {
  const systems = await getSystems();

  return (
    <section
      id={anchorId}
      className="theme-band-bright iw-section iw-section--loose"
      aria-labelledby="connected-system-heading"
    >
      <div className="iw-container">
        <div className={styles.layout}>
          <div className={styles.lead}>
            <SectionHeader
              id="connected-system-heading"
              eyebrow="How it all connects"
              title="Digital systems that work together"
              intro="Search, the store, analytics, email and support are usually run as separate tools that never talk to each other. We connect them, so a change in one place shows up correctly everywhere else."
            />

            {systems.length > 0 && (
              <ul className={styles.checkpoints}>
                {systems.map((s) => (
                  <li key={s.key} className={styles.checkpoint} style={{ ["--accent" as string]: s.color }}>
                    <span className={styles.check} aria-hidden="true">
                      <Check size={16} />
                    </span>
                    <div>
                      <p className={styles.checkName}>{s.name}</p>
                      <p className={styles.checkDesc}>{s.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Button
              href="/how-it-works"
              variant="secondary"
              size="md"
              className={styles.cta}
              iconRight={<ArrowRight aria-hidden="true" size={16} />}
            >
              Explore the full journey
            </Button>
          </div>

          <div className={styles.visual}>
            <Constellation
              nodes={NODES}
              ariaLabel="A website, search, ads and social, email and CRM, automation and retention, all connected around one central mark."
            >
              <InfinityMark glow={false} size={132} />
            </Constellation>
          </div>
        </div>
      </div>
    </section>
  );
}
