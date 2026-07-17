import { SectionHeader } from "@/components/primitives/SectionHeader";
import { JourneyTimeline, type JourneyRail, type JourneyStep } from "@/components/viz/JourneyTimeline";
import { getStages, getSystems } from "@/lib/content";
import styles from "./GrowthJourneySection.module.css";

/**
 * The Online Growth Journey (ref 05) — the 8 locked stages rendered as one connected
 * spectrum path via the shared JourneyTimeline, with the 3 cross-cutting systems shown
 * as rails running across the whole journey. Fully static: the "connected" feeling comes
 * from the spectrum rail and numbered nodes, so there is nothing to animate and nothing
 * to break under prefers-reduced-motion.
 *
 * Theme: dark. The timeline is an ordered list, so the sequence reaches assistive tech.
 */
export async function GrowthJourneySection({ anchorId }: { anchorId?: string }) {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);
  if (stages.length === 0) return null;

  const steps: JourneyStep[] = stages.map((stage) => ({
    order: stage.order,
    name: stage.name,
    summary: stage.summary,
    color: stage.color,
    icon: stage.icon,
  }));

  const rails: JourneyRail[] = systems.map((system) => ({
    name: system.name,
    description: system.description,
    color: system.color,
    icon: system.icon,
  }));

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="growth-journey-heading"
    >
      <div className="iw-container iw-container--wide">
        <SectionHeader
          id="growth-journey-heading"
          eyebrow="How it works"
          title="One connected system, built around your growth"
          intro="Every business moves through the same eight stages — even when a single project only touches one or two at a time. Three systems run across all of them, so the work compounds instead of starting over."
        />

        <div className={styles.timeline}>
          <JourneyTimeline steps={steps} rails={rails} ariaLabel="The eight connected growth stages" />
        </div>
      </div>
    </section>
  );
}
