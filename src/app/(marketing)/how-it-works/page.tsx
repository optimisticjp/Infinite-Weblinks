import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { Button } from "@/components/primitives/Button";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { Constellation, type ConstellationNode } from "@/components/viz/Constellation";
import { JourneyTimeline, type JourneyRail, type JourneyStep } from "@/components/viz/JourneyTimeline";
import { DeliveryModelsSection } from "@/components/sections/DeliveryModelsSection";
import { ProcessStepsSection } from "@/components/sections/ProcessStepsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStages, getSystems } from "@/lib/content";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How It Works",
  description:
    "One connected system, built around your growth: an eight-stage online growth journey, three systems that run across every stage, four ways we can be involved, and one process from start to finish.",
  path: "/how-it-works",
});

export default async function HowItWorksPage() {
  const [stages, systems] = await Promise.all([getStages(), getSystems()]);

  // Stages → constellation nodes (the mark at the centre, the eight stages orbiting it).
  const orbitNodes: ConstellationNode[] = stages.map((s) => ({
    key: s.slug,
    label: s.name,
    icon: s.icon,
    color: s.color,
  }));

  // Stages → timeline steps; the three cross-cutting systems → the rails beneath them.
  const steps: JourneyStep[] = stages.map((s) => ({
    order: s.order,
    name: s.name,
    summary: s.summary,
    color: s.color,
    icon: s.icon,
  }));
  const rails: JourneyRail[] = systems.map((sy) => ({
    name: sy.name,
    description: sy.description,
    color: sy.color,
    icon: sy.icon,
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ])}
      />

      <PageHero
        eyebrow="How It Works"
        title="One connected system. Built around your growth."
        intro="We start with your goals, find the right next step, and connect each stage so the work builds on itself over time. Seeing the whole path is what tells you where to start, and what can wait."
        breadcrumbs={[{ name: "How It Works" }]}
        accent="var(--pink)"
        actions={
          <>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
            <Button href="#journey" variant="secondary">
              Explore the growth journey
            </Button>
          </>
        }
        aside={
          <div className={styles.heroMark} aria-hidden="true">
            <span className={styles.heroGlow} />
            <span className={styles.heroRing} />
            <span className={styles.heroRingInner} />
            <InfinityMark size={188} glow />
          </div>
        }
      />

      {/* Overview — the whole system at a glance: the mark at the centre with the eight
          stages orbiting it. The mark owns the section's brightest value; the nodes run
          as ambient supporting lights (light budget). */}
      <section className={`theme-dark iw-section ${styles.overview}`} aria-labelledby="hiw-overview-heading">
        <div className="iw-container iw-container--wide">
          <div className={styles.overviewGrid}>
            <div className={styles.overviewText}>
              <p className={`iw-eyebrow ${styles.eyebrow}`}>The whole picture</p>
              <h2 id="hiw-overview-heading" className={styles.overviewTitle}>
                Everything connects around one centre
              </h2>
              <p className={styles.overviewLead}>
                Your website, marketing, customer tools and data are not separate projects.
                They are one system with a centre — your goals — and every stage below feeds
                the next. That is where the work compounds.
              </p>
              <ul className={styles.pillars}>
                <li className={styles.pillar}>
                  <span className={styles.pillarDot} data-tone="violet" aria-hidden="true" />
                  One connected path, not a pile of point tools
                </li>
                <li className={styles.pillar}>
                  <span className={styles.pillarDot} data-tone="cyan" aria-hidden="true" />
                  The order matters more than the number of tools
                </li>
                <li className={styles.pillar}>
                  <span className={styles.pillarDot} data-tone="orange" aria-hidden="true" />
                  Start with the smallest step that moves you forward
                </li>
              </ul>
            </div>
            <div className={styles.overviewViz}>
              <Constellation nodes={orbitNodes} ariaLabel="The eight growth stages orbiting the Infinite Weblinks mark">
                <InfinityMark size={132} glow />
              </Constellation>
            </div>
          </div>
        </div>
      </section>

      {/*
        Anchor targets. The mega-menu deep-links to each stage (#discovery-plan …) and each
        cross-cutting system (#ai-automation …). Both live in the journey section below — the
        stages as the numbered path, the systems as the rails running beneath it — so thin,
        non-visual anchors sit just above it. They share the page scroll-padding offset, so
        each link lands at the top of the journey.
      */}
      <div className={styles.anchors} aria-hidden="true">
        {stages.map((stage) => (
          <span key={stage.slug} id={stage.slug} className={styles.anchor} />
        ))}
        {systems.map((system) => (
          <span key={system.key} id={system.key} className={styles.anchor} />
        ))}
      </div>

      <section id="journey" className={`theme-dark iw-section ${styles.journey}`} aria-labelledby="hiw-journey-heading">
        <div className="iw-container iw-container--wide">
          <div className={styles.journeyHead}>
            <p className={`iw-eyebrow ${styles.eyebrow}`}>The Online Growth Journey</p>
            <h2 id="hiw-journey-heading" className={styles.journeyTitle}>
              Eight stages, one connected path
            </h2>
            <p className={styles.journeyLead}>
              Every business moves through the same journey — even if a single project only
              touches one or two stages at a time. Three systems run across all of it, built in
              from the start rather than bolted on at the end.
            </p>
          </div>
          <JourneyTimeline
            steps={steps}
            rails={rails}
            ariaLabel="The eight growth stages, in order"
          />
        </div>
      </section>

      {/* How we work — the same steady sequence behind every project (cream daylight break).
          anchorId="process" preserves the #process deep link. */}
      <ProcessStepsSection anchorId="process" />

      {/* The four delivery models. Each card carries id=delivery-<key>, so the mega-menu
          "How we deliver" links each land on their own card (#delivery-we-do …). */}
      <DeliveryModelsSection anchorId="delivery" />

      <section className={`theme-dark iw-section iw-section--tight ${styles.cta}`} aria-labelledby="hiw-cta-heading">
        <div className="iw-container">
          <div className={styles.ctaInner}>
            <h2 id="hiw-cta-heading" className={styles.ctaTitle}>
              Not sure where you are on the journey?
            </h2>
            <p className={styles.ctaBody}>
              That is what the plan is for. Tell us your goals and we will map the smallest next
              step, then the ones that follow — in the right order, around what you already have.
            </p>
            <div className={styles.ctaActions}>
              <Button href="/growth-plan" variant="primary">
                Build My Digital Growth Plan
              </Button>
              <Button href="/services" variant="secondary">
                Explore all services
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
