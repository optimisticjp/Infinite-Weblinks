import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getGoals } from "@/lib/content";
import { GoalCards, type GoalCardVM } from "./GoalCards";
import styles from "./GoalExplorerSection.module.css";

/**
 * GoalExplorerSection — router #1, "Choose a goal" (theme-dark).
 *
 * Educate-before-sell framing: visitors pick the outcome they want, not a product
 * feature. Every goal is a compact summary card that routes straight into a plan
 * for it; the full facts live on /goals/<slug>. (Phase 2 dropped the stage filter —
 * the homepage summarises and routes, it doesn't make the visitor sift.)
 */
export async function GoalExplorerSection({ anchorId }: { anchorId?: string }) {
  const goals = await getGoals();
  if (goals.length === 0) return null;

  const cards: GoalCardVM[] = goals.map((g) => ({
    slug: g.slug,
    title: g.title,
    outcome: g.outcome,
    icon: g.icon,
    color: g.color,
  }));

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="goal-explorer-heading"
    >
      <div className="iw-container">
        {/* One left edge (Phase 3): a real aside — the route to the full goals page —
            replaces the Phase-2 centring, so this heading sits on the same left line as
            every other section. Doubles as the summary → /goals link. */}
        <SectionHeader
          id="goal-explorer-heading"
          eyebrow="Choose a goal"
          title="What are you trying to achieve?"
          intro="Every plan starts from a goal, not a feature list. Pick the outcome closest to yours to see what it actually needs, how we'd help, and where it fits in the wider journey."
          aside={
            <Button href="/goals" variant="secondary" size="sm">
              See all goals
            </Button>
          }
        />
        <GoalCards goals={cards} />
      </div>
    </section>
  );
}
