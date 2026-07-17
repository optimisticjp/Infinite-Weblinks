import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Badge } from "@/components/primitives/Badge";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals, getStartingPoints } from "@/lib/content";
import styles from "./goals.module.css";

/**
 * /goals — the front door built around outcomes, not features. One primary way in (by
 * goal, ref 10 — a featured card over a numbered grid) plus two alternates (by business
 * type, by where you are). Every `[slug]` detail page stays and stays linked; the facet
 * headers reuse the copy from the pages they fold in.
 */
export const metadata: Metadata = pageMetadata({
  title: "Your goal",
  description:
    "Every plan starts from a goal, not a feature list. Start from the outcome you want, the kind of business you run, or where you are right now.",
  path: "/goals",
});

const pad = (n: number) => String(n).padStart(2, "0");

export default async function GoalsIndexPage() {
  const [goals, businessTypes, startingPoints] = await Promise.all([
    getGoals(),
    getBusinessTypes(),
    getStartingPoints(),
  ]);

  const [featured, ...rest] = goals;

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
        eyebrow="Explore by goal"
        title="What do you want to achieve right now?"
        intro="Every plan starts from a goal, not a feature list. Pick the outcome closest to yours to see what it actually needs, how we'd help, and where it fits in the wider journey."
        breadcrumbs={[{ name: "Your goal" }]}
        accent="var(--pink)"
      />

      {/* Primary way in — by goal. A featured card over a numbered grid (ref 10). The
          featured card owns the brightest value in the section; the rest run quieter. */}
      <section className="theme-dark iw-section" aria-labelledby="by-goal-heading">
        <div className="iw-container iw-container--wide">
          <h2 id="by-goal-heading" className="iw-visually-hidden">
            By goal
          </h2>

          {featured && (
            <Link
              href={`/goals/${featured.slug}`}
              className={styles.featured}
              style={{ ["--accent" as string]: featured.color }}
            >
              <div className={styles.featuredMain}>
                <span className={styles.featuredMeta}>
                  <span className={styles.featuredNum} aria-hidden="true">
                    {pad(1)}
                  </span>
                  <Badge color={featured.color}>Featured</Badge>
                </span>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.featuredDesc}>{featured.whatYouNeed}</p>
                <span className={styles.featuredCta}>
                  Explore this goal
                  <ArrowRight className={styles.featuredCtaIcon} aria-hidden="true" />
                </span>
              </div>
              <div className={styles.featuredViz} aria-hidden="true">
                <IconTile color={featured.color} variant="filled" size={92}>
                  <Icon name={featured.icon} />
                </IconTile>
              </div>
            </Link>
          )}

          <ul className={styles.goalGrid}>
            {rest.map((goal, i) => (
              <li key={goal.slug} className={styles.goalItem}>
                <Link
                  href={`/goals/${goal.slug}`}
                  className={styles.goalCard}
                  style={{ ["--accent" as string]: goal.color }}
                >
                  <span className={styles.goalTop}>
                    <span className={styles.goalNum} aria-hidden="true">
                      {pad(i + 2)}
                    </span>
                    <span className={styles.goalTile} aria-hidden="true">
                      <Icon name={goal.icon} />
                    </span>
                  </span>
                  <h3 className={styles.goalTitle}>{goal.title}</h3>
                  <p className={styles.goalOutcome}>{goal.outcome}</p>
                  <ArrowUpRight className={styles.goalArrow} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.notSure}>
            <p className={styles.notSureText}>Not sure which goal fits?</p>
            <Button href="/growth-plan" variant="primary">
              Build My Custom Growth Plan
            </Button>
          </div>
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
