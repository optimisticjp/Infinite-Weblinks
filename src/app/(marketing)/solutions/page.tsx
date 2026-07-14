import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { IndexCard } from "@/components/routes/IndexCard";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals, getStartingPoints } from "@/lib/content";
import styles from "./solutions.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Solutions",
  description:
    "Three ways into the same connected system — start from a goal you have, the kind of business you run, or where you are right now. Every route leads to the smallest sensible next step.",
  path: "/solutions",
});

export default async function SolutionsHubPage() {
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
          { name: "Solutions", path: "/solutions" },
        ])}
      />

      <PageHero
        eyebrow="Solutions"
        title="Find your way in"
        intro="There's no single right place to start, so here are three. Begin from a goal you already have, the kind of business you run, or simply where you are right now — each route points to the same connected system and the next step that actually matters for you."
        breadcrumbs={[{ name: "Solutions" }]}
      />

      <section className="theme-band iw-section" id="by-goal" aria-labelledby="by-goal-heading">
        <div className="iw-container">
          <SectionHeader
            id="by-goal-heading"
            eyebrow="By goal"
            title="Start from what you're trying to achieve"
            intro="Pick the outcome you care about most right now. We'll show what it takes and how we help."
          />
          <ul className={styles.grid}>
            {goals.map((goal) => (
              <li key={goal.slug}>
                <IndexCard
                  href={`/goals/${goal.slug}`}
                  title={goal.title}
                  description={goal.outcome}
                  icon={goal.icon}
                  color={goal.color}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="theme-dark iw-section" id="by-business-type" aria-labelledby="by-type-heading">
        <div className="iw-container">
          <SectionHeader
            id="by-type-heading"
            eyebrow="By business type"
            title="Start from the kind of business you run"
            intro="Different businesses need different things first. Find the closest match to see where we'd usually begin."
          />
          <ul className={styles.grid}>
            {businessTypes.map((type) => (
              <li key={type.slug}>
                <IndexCard
                  href={`/business-types/${type.slug}`}
                  title={type.name}
                  description={type.summary}
                  icon={type.icon}
                  color={type.color}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="theme-band iw-section" id="by-starting-point" aria-labelledby="by-start-heading">
        <div className="iw-container">
          <SectionHeader
            id="by-start-heading"
            eyebrow="By where you are now"
            title="Start from where you actually are"
            intro="Most businesses sit in more than one of these at once, and that's normal. Read down until one sounds like you."
          />
          <ul className={styles.grid}>
            {startingPoints.map((point) => (
              <li key={point.slug}>
                <IndexCard
                  href={`/starting-points/${point.slug}`}
                  title={point.label}
                  description={point.situation}
                  icon={point.icon}
                  color={point.color}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="theme-dark iw-section" aria-label="Next steps">
        <div className="iw-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Still not sure where to begin?</h2>
            <p className={styles.ctaBody}>
              You don&apos;t have to pick the perfect starting point. Tell us your goals and we&apos;ll work
              out the smallest next step, then the ones that follow.
            </p>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
