import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Callout } from "@/components/primitives/Callout";
import { JourneyStageCard } from "@/components/cards/JourneyStageCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getServiceCategories,
  getServices,
  getStages,
  getStartingPoint,
  getStartingPoints,
} from "@/lib/content";
import styles from "./starting-point.module.css";

export async function generateStaticParams() {
  const startingPoints = await getStartingPoints();
  return startingPoints.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const startingPoint = await getStartingPoint(slug);
  if (!startingPoint) return { title: "Starting point not found" };
  return pageMetadata({
    title: startingPoint.label,
    description: startingPoint.situation,
    path: `/starting-points/${startingPoint.slug}`,
  });
}

export default async function StartingPointDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [startingPoint, stages, services, serviceCategories] = await Promise.all([
    getStartingPoint(slug),
    getStages(),
    getServices(),
    getServiceCategories(),
  ]);
  if (!startingPoint) notFound();

  // Resolve the recommended stage STRICTLY: a broken relationship must fail the static build, never
  // render a partially-empty page (proven whole by tests/unit/starting-point-content.test.ts).
  const stage = stages.find((st) => st.slug === startingPoint.recommendedStageSlug);
  if (!stage) {
    throw new Error(
      `Starting point "${startingPoint.slug}" references an unresolved recommended stage "${startingPoint.recommendedStageSlug}".`,
    );
  }

  // Resolve every stage service + its category STRICTLY, in stage.serviceSlugs order — an unresolved
  // service or category fails the build rather than dropping a card.
  const stageServices = (stage.serviceSlugs ?? []).map((serviceSlug) => {
    const service = services.find((sv) => sv.slug === serviceSlug);
    if (!service) {
      throw new Error(
        `Stage "${stage.slug}" references an unresolved service "${serviceSlug}" (starting point "${startingPoint.slug}").`,
      );
    }
    const category = serviceCategories.find((c) => c.slug === service.categorySlug);
    if (!category) {
      throw new Error(`Service "${service.slug}" references an unresolved category "${service.categorySlug}".`);
    }
    return {
      slug: service.slug,
      name: service.name,
      description: service.plainDescription,
      href: `/services/${service.categorySlug}#${service.slug}`,
      categoryLabel: category.name,
      categoryIcon: category.icon,
      categoryTone: category.color,
      deliveryModel: service.deliveryModel,
    };
  });

  return (
    <>
      <PageHeader
        id="starting-point-hero"
        surface="light"
        breadcrumbs={[
          { name: "Goals", path: "/goals" },
          { name: startingPoint.label, path: `/starting-points/${startingPoint.slug}` },
        ]}
        eyebrow="Where you're starting"
        title={startingPoint.label}
        lead={startingPoint.situation}
        actions={
          <>
            <Button href={startingPoint.cta.route} size="lg">
              {startingPoint.cta.label}
            </Button>
            <Button href="/goals#by-where-you-are" variant="secondary" size="lg">
              See other starting points
            </Button>
          </>
        }
        trustNote="Most businesses sit in more than one situation at once, and that's normal."
      />

      <SectionShell
        surface="alt"
        id="recommended-stage"
        eyebrow="Recommended starting stage"
        title="The best place to begin"
        lead="Based on where you are now, this is the stage of the growth journey we'd start from."
        align="start"
        spacing="tight"
      >
        <CardGrid layout="equal" aria-label="Recommended starting stage">
          <JourneyStageCard
            order={stage.order}
            title={stage.name}
            summary={stage.summary}
            href={`/how-it-works#${stage.slug}`}
            icon={stage.icon}
            tone={stage.color}
          />
        </CardGrid>
      </SectionShell>

      <SectionShell
        surface="light"
        id="recommendation"
        eyebrow="What we'd recommend"
        title="Our honest take on your next move"
        align="start"
        spacing="tight"
      >
        <div className={styles.recommendation}>
          <Callout tone="information">{startingPoint.recommendation}</Callout>
          <p className={styles.reassure}>
            Most businesses sit in more than one situation at once, and that&apos;s normal. Your plan is
            tailored to your specifics during discovery.
          </p>
        </div>
      </SectionShell>

      <SectionShell
        surface="alt"
        id="stage-services"
        eyebrow="Services in this stage"
        title="What we'd likely work on first"
        lead="Each links to where it sits in the service list. We'd connect the ones that move you forward."
        align="start"
        spacing="tight"
      >
        <CardGrid layout="equal" aria-label="Services in this stage">
          {stageServices.map((sv) => (
            <ServiceCard
              key={sv.slug}
              title={sv.name}
              description={sv.description}
              href={sv.href}
              categoryLabel={sv.categoryLabel}
              categoryIcon={sv.categoryIcon}
              categoryTone={sv.categoryTone}
              deliveryModel={sv.deliveryModel}
            />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Ready to turn this starting point into a plan?"
        lead="Answer a few guided questions and see what to do first, what connects next, and what can wait."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
