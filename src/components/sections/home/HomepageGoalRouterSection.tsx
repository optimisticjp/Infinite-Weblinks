import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { DataTable, type DataTableFilter, type DataTableRow } from "@/components/primitives/DataTable";
import { Button } from "@/components/primitives/Button";
import { getGoals, getStages } from "@/lib/content";
import styles from "./HomepageGoalRouterSection.module.css";

/**
 * HomepageGoalRouterSection — the homepage goal router (id="goals") as a V3 "Instrument" DataTable.
 * Every renderable goal is a row (goal → outcome), the whole row routing into the plan builder with
 * the goal preselected (`/growth-plan?goal=<slug>`). A leading wayfinding dot carries the goal's hue.
 *
 * The filter chips are the "service worlds" a goal belongs to — the growth-journey stages it touches.
 * They are derived from the stages that at least one goal actually references (in journey order), so
 * no empty chip appears and the set stays correct as the goals change — nothing is hard-coded. A
 * restrained "not sure which fits?" panel keeps the catch-all `/growth-plan` and `/goals` routes.
 * Server Component; only the DataTable's filter state is client (serializable props throughout).
 */
export async function HomepageGoalRouterSection() {
  const [goals, stages] = await Promise.all([getGoals(), getStages()]);

  // Service-world chips = the growth-journey stages the goals span, in journey order, empties dropped.
  const usedStageSlugs = new Set(goals.flatMap((g) => g.stageSlugs));
  const filters: DataTableFilter[] = stages
    .filter((stage) => usedStageSlugs.has(stage.slug))
    .map((stage) => ({ id: stage.slug, label: stage.name, tone: stage.color }));

  const rows: DataTableRow[] = goals.map((goal) => ({
    id: goal.slug,
    label: goal.title,
    tone: goal.color,
    cells: [goal.outcome],
    href: `/growth-plan?goal=${goal.slug}`,
    filterKeys: goal.stageSlugs,
  }));

  return (
    <SectionShell
      surface="light"
      id="goals"
      eyebrow="Start with your goal"
      title="Pick the outcome you're after"
      lead="Growth is easier when you start from the outcome you want, not a list of tools. Filter by the stage of the journey it belongs to, then open the one that fits — we'll build the plan around it."
      align="start"
      spacing="tight"
    >
      <DataTable
        rows={rows}
        columns={["Goal", "Outcome"]}
        filters={filters}
        ariaLabel="Goals"
        countNoun={{ singular: "goal", plural: "goals" }}
      />

      <div className={styles.notSure}>
        <p className={styles.notSureText}>Not sure which goal fits? Start the plan and we&apos;ll help you find it.</p>
        <div className={styles.notSureActions}>
          <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
            Build my growth plan
          </Button>
          <Button href="/goals" variant="secondary">
            Browse all goals
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}
