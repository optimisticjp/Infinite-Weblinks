import { ArrowRight, Compass } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { StageTimeline, type TimelineStage } from "@/components/viz/StageTimeline";
import { RailBar } from "@/components/viz/RailBar";
import { GlowButton } from "@/components/primitives/GlowButton";
import { getStages, getSystems } from "@/lib/content";
import styles from "./ConnectedGrowthSection.module.css";

/**
 * ConnectedGrowthSection — the 8-stage connected journey as an interactive StageTimeline,
 * with the three cross-cutting rails (AI & Automation, Analytics & Data, Maintenance & Scale)
 * that run through every stage. All content is real seed data.
 */
export async function ConnectedGrowthSection() {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);

  const timeline: TimelineStage[] = stages.map((s) => ({
    slug: s.slug,
    name: s.name,
    color: s.color,
    icon: s.icon,
    summary: s.summary,
    detail: s.whatHappens,
    outcome: s.outcome,
  }));

  return (
    <SectionShell
      id="growth-journey"
      align="start"
      background
      eyebrow="The connected growth journey"
      title={
        <>
          Every business moves through the same <span className="iw-gradient-word">journey</span>.
        </>
      }
      lead="Eight connected stages, from the first plan to long-term growth. You can start wherever you are, and three things run through all of them."
    >
      <StageTimeline stages={timeline} ariaLabel="The eight stages of the growth journey" />

      <div className={styles.rails}>
        <p className={styles.railsLabel}>Runs through every stage</p>
        <div className={styles.railsList}>
          {systems.map((sys) => (
            <RailBar
              key={sys.key}
              icon={sys.icon}
              label={sys.name}
              description={sys.description.split(".")[0] + "."}
              hue={sys.color}
              href="/how-it-works"
            />
          ))}
        </div>
      </div>

      <div className={styles.ctas}>
        <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
          Build my growth plan
        </GlowButton>
        <GlowButton
          href="/how-it-works"
          variant="ghost"
          size="lg"
          iconLeft={<Compass size={18} aria-hidden="true" />}
        >
          Explore the growth journey
        </GlowButton>
      </div>
    </SectionShell>
  );
}
