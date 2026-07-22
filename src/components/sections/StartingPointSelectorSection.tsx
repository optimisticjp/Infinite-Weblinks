import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { StartingPointCard } from "@/components/cards/StartingPointCard";
import { getStages, getStartingPoints } from "@/lib/content";
import styles from "./StartingPointSelectorSection.module.css";

/**
 * StartingPointSelectorSection — "Where are you right now?" on the V2 light-first system.
 *
 * A calm grid of situations (not a horizontal spectrum rail): each is a StartingPointCard, a real
 * link into a plan built around that starting point, in the seed's source order. Static and
 * links-based — nothing depends on JavaScript, hover, a selected state or a "wizard" flow, and
 * there is no single objectively-correct starting point. Most brands recognise themselves in more
 * than one row, and that's normal; whichever is closest is where we'd start. The caller-provided
 * `anchorId` becomes the section id (so /goals' permanent `#by-where-you-are` fragment lands here);
 * SectionShell derives the heading id from it, so there is no hard-coded duplicate heading id.
 * Server Component.
 */
export async function StartingPointSelectorSection({ anchorId }: { anchorId?: string }) {
  const [startingPoints, stages] = await Promise.all([getStartingPoints(), getStages()]);
  if (startingPoints.length === 0) return null;

  const stageBySlug = new Map(stages.map((s) => [s.slug, s] as const));

  return (
    <SectionShell
      surface="light"
      id={anchorId}
      eyebrow="Where are you now?"
      title="Where are you right now?"
      lead="Choose the point that sounds most like your business. Whichever is closest is where we'd start — there's no wrong answer."
      align="start"
    >
      <CardGrid layout="equal" aria-label="Starting points, from just an idea through to automation">
        {startingPoints.map((sp, i) => {
          const stage = stageBySlug.get(sp.recommendedStageSlug);
          return (
            <StartingPointCard
              key={sp.slug}
              order={i + 1}
              title={sp.label}
              situation={sp.situation}
              href={sp.cta.route}
              icon={sp.icon}
              tone={sp.color}
              recommendedStageLabel={stage?.name}
            />
          );
        })}
      </CardGrid>

      <div className={styles.cta}>
        <p className={styles.ctaText}>Fit more than one? Start where it counts and we&apos;ll map the rest.</p>
        <Button href="/growth-plan" size="lg" iconRight={<ArrowRight aria-hidden="true" size={18} />}>
          Build my growth plan
        </Button>
      </div>
    </SectionShell>
  );
}
