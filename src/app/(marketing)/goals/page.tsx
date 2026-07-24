import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Button } from "@/components/primitives/Button";
import { LinkChip } from "@/components/primitives/LinkChip";
import { GoalCard } from "@/components/cards/GoalCard";
import { BusinessTypeCard } from "@/components/cards/BusinessTypeCard";
import { StartingPointSelectorSection } from "@/components/sections/StartingPointSelectorSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getGoals, getBusinessTypes } from "@/lib/content";
import styles from "./goals.module.css";

/**
 * /goals — the routing hub for a cold visitor, on the V2 light-first system. Three ways in, each
 * its own clearly-headed facet: start with the goal you want (GoalCards → each goal's page), pick
 * where you are right now (the rebuilt starting-point selector), or come in by business type
 * (BusinessTypeCards). A compact hub-jump nav after the header links straight to the three facets.
 * The by-where-you-are and by-business-type section ids are the permanent redirect targets for the
 * retired /starting-points and /business-types index URLs, so they stay put.
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

      <PageHeader
        id="goals-hero"
        surface="light"
        breadcrumbs={[{ name: "Your goal" }]}
        eyebrow="Start with your goal"
        title="What do you want to achieve right now?"
        lead="Growth is easier when you start from the outcome you're after, not a list of tools. Pick the goal that fits, or come in by where you are or the kind of business you run."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#by-goal" variant="secondary">
              Browse goals
            </Button>
          </>
        }
      />

      {/* Compact hub-jump nav — links between the three facets, not an interactive filter. */}
      <div className={`theme-light ${styles.hubNavBand}`}>
        <div className="iw-container iw-container--wide">
          <nav aria-label="Choose how to start" className={styles.hubNav}>
            <LinkChip href="#by-goal">Start with a goal</LinkChip>
            <LinkChip href="#by-where-you-are">Start with where I am</LinkChip>
            <LinkChip href="#by-business-type">Start with my business type</LinkChip>
          </nav>
        </div>
      </div>

      {/* By goal — the outcome-first router. Cards open each goal's page. */}
      <SectionShell
        surface="alt"
        id="by-goal"
        eyebrow="By goal"
        title="Pick the outcome you're after"
        lead="Each goal opens a short, honest read of what it takes, the services that help, and where it fits in the journey."
        align="start"
      >
        <CardGrid layout="equal" aria-label="Goals">
          {goals.map((goal) => (
            <GoalCard
              key={goal.slug}
              href={`/goals/${goal.slug}`}
              title={goal.title}
              outcome={goal.outcome}
              icon={goal.icon}
              tone={goal.color}
              audienceHint={goal.audienceHint}
            />
          ))}
        </CardGrid>
      </SectionShell>

      {/* By where you are — the rebuilt starting-point selector. #by-where-you-are is the
          permanent target for the retired /starting-points index. */}
      <StartingPointSelectorSection anchorId="by-where-you-are" />

      {/* By business type — #by-business-type is the permanent target for the retired
          /business-types index. */}
      <SectionShell
        surface="alt"
        id="by-business-type"
        eyebrow="By business type"
        title="Or come in by who you are"
        lead="The same connected system, framed for the kind of business you run: the situation, the goals that matter most, and a roadmap in phases."
        align="start"
      >
        <CardGrid layout="equal" aria-label="Business types">
          {businessTypes.map((bt) => (
            <BusinessTypeCard
              key={bt.slug}
              href={`/business-types/${bt.slug}`}
              title={bt.name}
              summary={bt.summary}
              icon={bt.icon}
              tone={bt.color}
            />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Not sure which way in is yours?"
        lead="Whichever route you pick, we'll map a connected plan around your goals — tailored to your business during discovery. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
