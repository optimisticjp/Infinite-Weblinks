import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Chip } from "@/components/primitives/Chip";
import { Callout } from "@/components/primitives/Callout";
import { Button } from "@/components/primitives/Button";
import { GoalPath } from "@/components/routes/GoalPath";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { JourneyStageCard } from "@/components/cards/JourneyStageCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import { getGoal, getGoals, getServices, getServiceCategories, getStages } from "@/lib/content";
import styles from "./goal.module.css";

export async function generateStaticParams() {
  const goals = await getGoals();
  return goals.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const goal = await getGoal(slug);
  if (!goal) return { title: "Goal not found" };
  return pageMetadata({
    title: goal.title,
    description: goal.outcome,
    path: `/goals/${goal.slug}`,
  });
}

/**
 * /goals/[slug] — an outcome-led goal detail on V2 light-first surfaces. A PageHeader opener,
 * the goal's three-part GoalPath (what you need → how we help → intended outcome) with a visible
 * variability note, the example tools it can connect, the real services that help (each led by
 * its own category, never the goal's colour), where the goal sits in the growth journey, and the
 * shared closing CTA. Server-rendered; metadata, canonical, breadcrumb structured data,
 * `notFound` gating and every content relationship are preserved from the pre-V2 template.
 */
export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [goal, services, categories, stages] = await Promise.all([
    getGoal(slug),
    getServices(),
    getServiceCategories(),
    getStages(),
  ]);
  if (!goal) notFound();

  const accent = domainInk(goal.color);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));

  // Real services that help, in the goal's own source order. Each keeps its OWN category label,
  // icon, tone and delivery model — never the goal's colour on every service. A service whose
  // category cannot be resolved falls back to a neutral "Service" label + neutral tone/icon
  // (surfaced by the relationship-integrity test); content integrity guarantees resolution today.
  const relatedServices = goal.serviceSlugs
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => {
      const category = categoryBySlug.get(sv.categorySlug);
      return {
        slug: sv.slug,
        title: sv.name,
        description: sv.plainDescription,
        href: `/services/${sv.categorySlug}#${sv.slug}`,
        categoryLabel: category?.name ?? "Service",
        categoryIcon: category?.icon ?? "layers",
        categoryTone: category?.color,
        deliveryModel: sv.deliveryModel,
      };
    });

  // Where the goal sits in the journey, in the goal's own source order. Each card shows the
  // stage's real journey position and its own tone (a resolved stage is required to render one).
  const relatedStages = goal.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Goals", path: "/goals" },
          { name: goal.title, path: `/goals/${goal.slug}` },
        ])}
      />

      <PageHeader
        id="goal-hero"
        surface="light"
        breadcrumbs={[{ name: "Goals", path: "/goals" }, { name: goal.title }]}
        eyebrow="Goal"
        accent={accent}
        title={goal.title}
        lead={goal.outcome}
        actions={
          <>
            <Button
              href={`/growth-plan?goal=${goal.slug}`}
              iconRight={<ArrowRight size={16} aria-hidden="true" />}
            >
              Build my growth plan
            </Button>
            <Button href="/services" variant="secondary">
              Explore services
            </Button>
          </>
        }
        trustNote={goal.audienceHint ? goal.audienceHint : undefined}
      />

      <SectionShell
        surface="alt"
        id="approach"
        eyebrow="How we'd approach this"
        title="From where you are to where you want to be"
        lead="No two businesses are identical, so this is the shape of the work, not a fixed script. Your plan is tailored to your specifics during discovery."
        align="start"
      >
        <GoalPath
          need={goal.whatYouNeed}
          help={goal.howWeHelp}
          outcome={goal.outcome}
          tone={goal.color}
        />
        <Callout tone="information" title="Outcomes vary — this isn't a promised number." className={styles.variability}>
          The intended outcome is the kind of result this work is built to produce, not a
          guaranteed figure. What you actually see depends on your market, your offer, your budget
          and where you&apos;re starting from.
        </Callout>
      </SectionShell>

      {goal.exampleTools.length > 0 && (
        <SectionShell
          surface="light"
          id="tools"
          eyebrow="Tools"
          title="Example tools we can connect"
          lead="Set up in your name, never locked to us — we pick what fits your size and budget."
          align="start"
          spacing="tight"
        >
          <ul className={styles.tools}>
            {goal.exampleTools.map((tool) => (
              <li key={tool}>
                <Chip>{tool}</Chip>
              </li>
            ))}
          </ul>
          <p className={styles.toolsNote}>
            Examples only. This does not imply partnership or endorsement.
          </p>
        </SectionShell>
      )}

      {relatedServices.length > 0 && (
        <SectionShell
          surface="alt"
          id="services"
          eyebrow="Services that help"
          title="The building blocks for this goal"
          lead="Each opens where it sits in the service list. We connect the ones that matter, in the right order."
          align="start"
        >
          <CardGrid layout="equal" aria-label="Services that help with this goal">
            {relatedServices.map((sv) => (
              <ServiceCard
                key={sv.slug}
                href={sv.href}
                title={sv.title}
                description={sv.description}
                categoryLabel={sv.categoryLabel}
                categoryIcon={sv.categoryIcon}
                categoryTone={sv.categoryTone}
                deliveryModel={sv.deliveryModel}
              />
            ))}
          </CardGrid>
        </SectionShell>
      )}

      {relatedStages.length > 0 && (
        <SectionShell
          surface="light"
          id="where-it-fits"
          eyebrow="Where it fits"
          title="How this maps to the growth journey"
          lead="The growth journey is a useful map, not a fixed checklist — these are the stages most relevant to this goal. Not every business needs every stage, and the exact sequence stays tailored to yours."
          align="start"
        >
          <CardGrid layout="equal" aria-label="Growth-journey stages this goal touches">
            {relatedStages.map((st) => (
              <JourneyStageCard
                key={st.slug}
                order={st.order}
                title={st.name}
                summary={st.summary}
                href={`/how-it-works#${st.slug}`}
                icon={st.icon}
                tone={st.color}
              />
            ))}
          </CardGrid>
        </SectionShell>
      )}

      <FinalCtaSection
        id="get-started"
        title="Ready to make progress on this?"
        lead="We'll build a connected plan around this goal, tailored to your business during discovery. No obligation."
        primary={{ href: `/growth-plan?goal=${goal.slug}`, label: "Build my growth plan" }}
        secondary={{ href: "/goals", label: "See other goals" }}
      />
    </>
  );
}
