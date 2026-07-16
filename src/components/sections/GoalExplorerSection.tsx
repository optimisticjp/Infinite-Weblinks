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
        {/* Centred: the stage filter that used to sit here is gone (Phase 2), so there's
            no control or route to hang in an aside — centring collapses the empty right
            column rather than stranding it. The cards below carry the routing. */}
        <SectionHeader
          id="goal-explorer-heading"
          align="center"
          eyebrow="Choose a goal"
          title="What are you trying to achieve?"
          intro="Every plan starts from a goal, not a feature list. Pick the outcome closest to yours to see what it actually needs, how we'd help, and where it fits in the wider journey."
        />
        <GoalCards goals={cards} />
      </div>
    </section>
  );
}
