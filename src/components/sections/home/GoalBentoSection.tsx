import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import { getGoals } from "@/lib/content";
import styles from "./GoalBentoSection.module.css";

/**
 * GoalBentoSection — the primary router: "start with your goal". A featured tile for people
 * who aren't sure where to begin, then a bento of concrete goals (real content), each linked
 * into the growth-plan builder pre-filled with that goal. A connector leads to the catch-all
 * "build my custom plan" CTA for anyone who can't pick one.
 */
export async function GoalBentoSection() {
  const goals = await getGoals();

  return (
    <SectionShell
      id="goals"
      align="start"
      eyebrow="Start with your goal"
      title={
        <>
          What do you want to <span className="iw-gradient-word">achieve</span> right now?
        </>
      }
      lead="Pick the outcome that matters most today. We'll show you the connected path to reach it, and the smallest first step."
    >
      <BentoGrid>
        <BentoCard
          variant="featured"
          hue="var(--domain-strategy)"
          eyebrow="Not sure where to start"
          title="Start or improve your business online"
          blurb="Answer a few questions and get a clear first step for your whole setup, from website to marketing to the tools that hold it together."
          href="/growth-plan"
          icon="rocket"
        />
        {goals.map((goal) => (
          <BentoCard
            key={goal.slug}
            variant="medium"
            hue={goal.color}
            title={goal.title}
            href={`/growth-plan?goal=${goal.slug}`}
            icon={goal.icon}
          />
        ))}
      </BentoGrid>

      <div className={styles.foot}>
        <ConnectorPath className={styles.footConn} dots={2} />
        <div className={styles.footCta}>
          <p className={styles.footText}>Not sure which one fits? Answer a few questions instead.</p>
          <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
            Build my growth plan
          </GlowButton>
        </div>
      </div>
    </SectionShell>
  );
}
