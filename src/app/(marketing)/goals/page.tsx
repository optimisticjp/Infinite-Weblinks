import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals, getStartingPoints } from "@/lib/content";

/**
 * /goals — the front door the brand has been missing. One decision ("what are you
 * trying to achieve?") with one primary way in (by goal) and two alternates (by
 * business type, by where you are), so a cold visitor is routed without first having
 * to decide *how* to be routed. The three facets that used to live behind the deleted
 * /solutions hub, and on the now-retired /business-types and /starting-points indexes,
 * are folded here; every `[slug]` detail page stays and stays linked.
 *
 * A router, not a book — a compact index over existing route primitives (PageHero,
 * SectionHeader, HubGrid, IndexCard). No new copy: the facet headers reuse the copy
 * from the pages they replace.
 */
export const metadata: Metadata = pageMetadata({
  title: "Your goal",
  description:
    "Every plan starts from a goal, not a feature list. Start from the outcome you want, the kind of business you run, or where you are right now.",
  path: "/goals",
});

export default async function GoalsIndexPage() {
  const [goals, businessTypes, startingPoints] = await Promise.all([
    getGoals(),
    getBusinessTypes(),
    getStartingPoints(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Your goal", path: "/goals" },
        ])}
      />
      {goals.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            "Goals",
            goals.map((g) => ({ name: g.title, path: `/goals/${g.slug}` })),
          )}
        />
      )}

      <PageHero
        eyebrow="Your goal"
        title="What are you trying to achieve?"
        intro="Every plan starts from a goal, not a feature list. Pick the outcome closest to yours to see what it actually needs, how we'd help, and where it fits in the wider journey."
        breadcrumbs={[{ name: "Your goal" }]}
      />

      {/* Primary way in — by goal. The hero frames it, so the cards follow directly.
          It keeps the default section rhythm; the two alternates below run tight, so the
          air itself signals which way in is primary. */}
      <section className="theme-dark iw-section" aria-labelledby="by-goal-heading">
        <div className="iw-container">
          <h2 id="by-goal-heading" className="iw-visually-hidden">
            By goal
          </h2>
          <HubGrid center min="15rem">
            {goals.map((goal) => (
              <HubGridItem key={goal.slug}>
                <IndexCard
                  href={`/goals/${goal.slug}`}
                  title={goal.title}
                  description={goal.outcome}
                  icon={goal.icon}
                  color={goal.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>

      {/* Alternate — by business type (folded from the retired /business-types index).
          Tight rhythm marks it as an alternate route in, not a second primary. */}
      <section className="theme-band iw-section iw-section--tight" id="by-business-type" aria-labelledby="by-type-heading">
        <div className="iw-container">
          <SectionHeader
            id="by-type-heading"
            eyebrow="By business type"
            title="Built around how your business actually works"
            intro="The right first step depends on what you're running. Pick the closest fit to see how the growth journey applies to you — and the goals and services that usually matter most."
          />
          <HubGrid center min="15rem">
            {businessTypes.map((type) => (
              <HubGridItem key={type.slug}>
                <IndexCard
                  href={`/business-types/${type.slug}`}
                  title={type.name}
                  description={type.summary}
                  icon={type.icon}
                  color={type.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>

      {/* Alternate — by where you are (folded from the retired /starting-points index).
          Tight rhythm marks it as an alternate route in, not a second primary. */}
      <section className="theme-dark iw-section iw-section--tight" id="by-where-you-are" aria-labelledby="by-where-heading">
        <div className="iw-container">
          <SectionHeader
            id="by-where-heading"
            eyebrow="By where you are now"
            title="Start from where you actually are"
            intro="You don't need to have it all figured out. Pick the situation that sounds most like yours and we'll point you to the smallest next step — not a giant to-do list."
          />
          <HubGrid center min="15rem">
            {startingPoints.map((point) => (
              <HubGridItem key={point.slug}>
                <IndexCard
                  href={`/starting-points/${point.slug}`}
                  title={point.label}
                  description={point.situation}
                  icon={point.icon}
                  color={point.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>
    </>
  );
}
