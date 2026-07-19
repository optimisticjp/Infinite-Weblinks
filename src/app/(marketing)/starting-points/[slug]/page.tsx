import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServices, getStages, getStartingPoint, getStartingPoints } from "@/lib/content";
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
  const [startingPoint, stages, services] = await Promise.all([
    getStartingPoint(slug),
    getStages(),
    getServices(),
  ]);
  if (!startingPoint) notFound();

  const stage = stages.find((st) => st.slug === startingPoint.recommendedStageSlug);

  const stageServices = (stage?.serviceSlugs ?? [])
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => ({ name: sv.name, href: `/services/${sv.categorySlug}#${sv.slug}`, hint: sv.plainDescription }));

  const ctaVariant = startingPoint.cta.style === "primary" ? "primary" : "ghost";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Starting points", path: "/starting-points" },
          { name: startingPoint.label, path: `/starting-points/${startingPoint.slug}` },
        ])}
      />

      <CosmicPageHero
        id="starting-point-hero"
        breadcrumbs={[{ name: "Goals", path: "/goals" }, { name: startingPoint.label }]}
        eyebrow="Where you're starting"
        hue={startingPoint.color}
        title={startingPoint.label}
        lead={startingPoint.situation}
        actions={
          <>
            <GlowButton
              href={startingPoint.cta.route}
              variant={ctaVariant}
              size="lg"
              iconRight={<ArrowRight size={18} aria-hidden="true" />}
            >
              {startingPoint.cta.label}
            </GlowButton>
            <GlowButton href="/goals" variant="ghost" size="lg">
              See all goals
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={startingPoint.color} size={128} emphasis="bright">
              <Icon name={startingPoint.icon} />
            </NodeOrb>
          </span>
        }
      />

      {stage && (
        <SectionShell
          id="recommended-stage"
          eyebrow="Recommended starting stage"
          title="The best place to begin"
          lead="Based on where you are now, this is the stage of the growth journey we'd start from."
          align="start"
          spacing="tight"
        >
          <BentoGrid>
            <BentoCard
              href={`/how-it-works#${stage.slug}`}
              hue={startingPoint.color}
              icon="compass"
              eyebrow="Start here"
              title={stage.name}
              blurb={stage.summary}
              variant="featured"
            />
          </BentoGrid>
        </SectionShell>
      )}

      <SectionShell
        id="recommendation"
        eyebrow="What we'd recommend"
        title="Our honest take on your next move"
        align="start"
      >
        <p className={styles.prose}>{startingPoint.recommendation}</p>
        <p className={styles.reassure}>
          Most businesses sit in more than one situation at once, and that&apos;s normal. Your plan is
          tailored to your specifics during discovery.
        </p>
      </SectionShell>

      {stageServices.length > 0 && (
        <SectionShell
          id="stage-services"
          eyebrow="Services in this stage"
          title="What we'd likely work on first"
          lead="Each links to where it sits in the service list. We'd connect the ones that move you forward."
          align="start"
        >
          <BentoGrid>
            {stageServices.map((sv, i) => (
              <BentoCard
                key={sv.href}
                href={sv.href}
                hue={startingPoint.color}
                icon="link"
                title={sv.name}
                blurb={sv.hint}
                variant={i === 0 ? "featured" : "compact"}
              />
            ))}
          </BentoGrid>
        </SectionShell>
      )}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
