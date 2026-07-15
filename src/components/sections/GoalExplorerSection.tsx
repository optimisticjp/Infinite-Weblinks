import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getGoals, getStages } from "@/lib/content";
import { GoalExplorerFilter, type GoalCardVM, type StageFilter } from "./GoalExplorerFilter";
import styles from "./GoalExplorerSection.module.css";

/**
 * GoalExplorerSection — "Choose a goal" (theme-band).
 *
 * Educate-before-sell framing: visitors pick the outcome they want, not a product
 * feature. Server-fetches goals plus the 8-stage journey (only to label the stage
 * filter chips in plain English), then hands fully-resolved view data to a small
 * client filter island. Every goal is present in the initial HTML — the default
 * filter is "all" — so the section is complete and readable before/without any
 * JavaScript; the stage filter is a progressive enhancement on top.
 */
export async function GoalExplorerSection({ anchorId }: { anchorId?: string }) {
  const [goals, stages] = await Promise.all([getGoals(), getStages()]);
  if (goals.length === 0) return null;

  const stageNameBySlug = new Map(stages.map((s) => [s.slug, s.name] as const));

  const goalsForClient: GoalCardVM[] = goals.map((g) => ({
    slug: g.slug,
    title: g.title,
    audienceHint: g.audienceHint,
    whatYouNeed: g.whatYouNeed,
    howWeHelp: g.howWeHelp,
    outcome: g.outcome,
    exampleTools: g.exampleTools,
    icon: g.icon,
    color: g.color,
    stageSlugs: g.stageSlugs,
    stageNames: g.stageSlugs
      .map((s) => stageNameBySlug.get(s))
      .filter((n): n is string => Boolean(n)),
  }));

  const referencedStageSlugs = new Set(goals.flatMap((g) => g.stageSlugs));
  const stageFilters: StageFilter[] = stages
    .filter((s) => referencedStageSlugs.has(s.slug))
    .map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section ${styles.section}`}
      aria-labelledby="goal-explorer-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="goal-explorer-heading"
          eyebrow="Choose a goal"
          title="What are you trying to achieve?"
          intro="Every plan starts from a goal, not a feature list. Pick the outcome closest to yours to see what it actually needs, how we'd help, and where it fits in the wider journey."
        />
        <GoalExplorerFilter goals={goalsForClient} stageFilters={stageFilters} />
      </div>
    </section>
  );
}
