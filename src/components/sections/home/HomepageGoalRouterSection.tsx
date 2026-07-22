import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { GoalCard } from "@/components/cards/GoalCard";
import { getGoals } from "@/lib/content";
import styles from "./HomepageGoalRouterSection.module.css";

/**
 * HomepageGoalRouterSection — the homepage's compact goal router (id="goals"). Every renderable
 * goal, in source order, as a GoalCard routing straight into the plan builder with the goal
 * preselected (`/growth-plan?goal=<slug>`). The homepage cards intentionally omit the audience
 * hint to stay compact, but keep the real title and outcome. No featured/ranked goal, no
 * BentoCard, ConnectorPath, GlowButton, client filtering, tabs, carousel or horizontal rail. A
 * restrained "not sure which fits?" panel offers the catch-all `/growth-plan` and `/goals`.
 * Server Component.
 */
export async function HomepageGoalRouterSection() {
  const goals = await getGoals();

  return (
    <SectionShell
      surface="light"
      id="goals"
      eyebrow="Start with your goal"
      title="Pick the outcome you're after"
      lead="Growth is easier when you start from the outcome you want, not a list of tools. Pick the one that fits — we'll build the plan around it."
      align="start"
      spacing="tight"
    >
      <CardGrid layout="equal" aria-label="Goals">
        {goals.map((goal) => (
          <GoalCard
            key={goal.slug}
            href={`/growth-plan?goal=${goal.slug}`}
            title={goal.title}
            outcome={goal.outcome}
            icon={goal.icon}
            tone={goal.color}
          />
        ))}
      </CardGrid>

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
