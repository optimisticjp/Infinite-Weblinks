import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { StartingPointSelectorSection } from "@/components/sections/StartingPointSelectorSection";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getGoals, getBusinessTypes } from "@/lib/content";

/**
 * /goals — the front door for a cold visitor, on the Constellation kit. Three ways in, each
 * its own clearly-headed facet: start with the goal you want (bento → each goal's page), or
 * pick where you are right now (the reused starting-point selector), or come in by business
 * type. The by-where-you-are and by-business-type section ids are the permanent redirect
 * targets for the retired /starting-points and /business-types index URLs, so they stay put.
 */
export const metadata: Metadata = pageMetadata({
  title: "Your goal",
  description:
    "Start with what you want to achieve. Pick a goal, tell us where you are right now, or come in by business type, and we'll point you at the smallest useful next step.",
  path: "/goals",
});

export default async function GoalsPage() {
  const [goals, businessTypes] = await Promise.all([getGoals(), getBusinessTypes()]);

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Goals",
          goals.map((g) => ({ name: g.title, path: `/goals/${g.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Your goal", path: "/goals" },
        ])}
      />

      <CosmicPageHero
        id="goals-hero"
        breadcrumbs={[{ name: "Your goal" }]}
        eyebrow="Start with your goal"
        title={
          <>
            What do you want to <span className="iw-gradient-word">achieve</span> right now?
          </>
        }
        lead="Growth is easier when you start from the outcome you're after, not a list of tools. Pick the goal that fits, or come in by where you are or the kind of business you run."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#by-goal" variant="ghost" size="lg">
              Browse goals
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--violet)" size={128} emphasis="bright">
              <Icon name="target" />
            </NodeOrb>
          </span>
        }
      />

      {/* By goal — the outcome-first router. Cards open each goal's page, which routes onward
          to the services that help and into the plan builder. */}
      <SectionShell
        id="by-goal"
        eyebrow="By goal"
        title={
          <>
            Pick the <span className="iw-gradient-word">outcome</span> you're after
          </>
        }
        lead="Each goal opens a short, honest read of what it takes, the services that help, and where it fits in the journey."
        align="start"
      >
        <BentoGrid>
          {goals.map((goal, i) => (
            <BentoCard
              key={goal.slug}
              href={`/goals/${goal.slug}`}
              hue={goal.color}
              icon={goal.icon}
              index={String(i + 1).padStart(2, "0")}
              eyebrow={goal.audienceHint}
              title={goal.title}
              blurb={goal.outcome}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      {/* By where you are — the reused starting-point selector. #by-where-you-are is the
          permanent target for the retired /starting-points index. */}
      <StartingPointSelectorSection anchorId="by-where-you-are" />

      {/* By business type — #by-business-type is the permanent target for the retired
          /business-types index. */}
      <SectionShell
        id="by-business-type"
        eyebrow="By business type"
        title={
          <>
            Or come in by <span className="iw-gradient-word">who you are</span>
          </>
        }
        lead="The same connected system, framed for the kind of business you run: the situation, the goals that matter most, and a roadmap in phases."
        align="start"
      >
        <BentoGrid>
          {businessTypes.map((bt, i) => (
            <BentoCard
              key={bt.slug}
              href={`/business-types/${bt.slug}`}
              hue={bt.color}
              icon={bt.icon}
              title={bt.name}
              blurb={bt.summary}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
