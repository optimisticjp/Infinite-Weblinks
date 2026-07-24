import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { Callout } from "@/components/primitives/Callout";
import { LinkChip } from "@/components/primitives/LinkChip";
import { GrowthJourneyList } from "@/components/routes/GrowthJourneyList";
import { CrossCuttingSystemCard } from "@/components/cards/CrossCuttingSystemCard";
import { getStages, getSystems } from "@/lib/content";
import styles from "./GrowthJourneyOverviewSection.module.css";

/**
 * GrowthJourneyOverviewSection — the V2 replacement for the legacy ConnectedGrowthSection on
 * /how-it-works (the legacy homepage section is left untouched). It loads the real stages and
 * systems and renders, on an explicit V2 surface: a compact stage-jump nav (one LinkChip per real
 * stage → its #slug), a visible map-not-checklist Callout, the GrowthJourneyList, a clearly-headed
 * cross-cutting-systems group of three CrossCuttingSystemCards, and V2 Button actions. No
 * StageTimeline, RailBar, GlowButton, cosmic/background SectionShell mode, gradient title,
 * interactive selected-stage panel, horizontal timeline or animated line. Server Component.
 */
export async function GrowthJourneyOverviewSection({
  surface = "light",
}: {
  surface?: "light" | "alt";
}) {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);

  return (
    <SectionShell
      surface={surface}
      id="growth-journey"
      align="start"
      eyebrow="The connected growth journey"
      title="Eight connected stages that build on each other"
      lead="From the first plan to long-term growth, each stage feeds the next, and three systems run across all of them. Seeing the whole path is what tells you where to start and what can wait."
    >
      <nav aria-label="Growth journey stages" className={styles.stageNav}>
        {stages.map((stage) => (
          <LinkChip key={stage.slug} href={`#${stage.slug}`} tone={stage.color}>
            {stage.name}
          </LinkChip>
        ))}
      </nav>

      <Callout tone="information" title="An ordered map, not a checklist" className={styles.mapNote}>
        These eight stages show the whole path in order. You don&apos;t have to run all of them —
        you can start wherever you are, most plans touch only the stages that matter now, and the
        sequence and scope are tailored to your business during discovery.
      </Callout>

      <GrowthJourneyList
        stages={stages.map((s) => ({
          order: s.order,
          slug: s.slug,
          name: s.name,
          summary: s.summary,
          whatHappens: s.whatHappens,
          outcome: s.outcome,
          icon: s.icon,
          tone: s.color,
        }))}
      />

      <div className={styles.systems}>
        <h3 className={styles.systemsHeading}>Three systems run across every stage</h3>
        <p className={styles.systemsIntro}>
          These don&apos;t sit at one point in the journey — they run through all of it.
        </p>
        <CardGrid layout="equal" aria-label="Systems that run across the growth journey">
          {systems.map((system) => (
            <CrossCuttingSystemCard
              key={system.key}
              id={system.key}
              title={system.name}
              description={system.description}
              icon={system.icon}
              tone={system.color}
            />
          ))}
        </CardGrid>
      </div>

      <div className={styles.actions}>
        <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
          Build my growth plan
        </Button>
        <Button href="/goals#by-where-you-are" variant="secondary">
          Find where you are
        </Button>
      </div>
    </SectionShell>
  );
}
