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
import { getGoal, getGoals, getServices, getStages } from "@/lib/content";
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

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [goal, services, stages] = await Promise.all([getGoal(slug), getServices(), getStages()]);
  if (!goal) notFound();

  const relatedServices = goal.serviceSlugs
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => ({ name: sv.name, href: `/services/${sv.categorySlug}#${sv.slug}`, hint: sv.plainDescription }));

  const relatedStages = goal.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st))
    .map((st) => ({ name: st.name, href: `/how-it-works#${st.slug}`, hint: st.summary }));

  const story = [
    { label: "What you need", body: goal.whatYouNeed },
    { label: "How we help", body: goal.howWeHelp },
    { label: "What you can expect", body: goal.outcome },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Goals", path: "/goals" },
          { name: goal.title, path: `/goals/${goal.slug}` },
        ])}
      />

      <CosmicPageHero
        id="goal-hero"
        breadcrumbs={[{ name: "Goals", path: "/goals" }, { name: goal.title }]}
        eyebrow={goal.audienceHint ?? "Goal"}
        hue={goal.color}
        title={goal.title}
        lead={goal.outcome}
        actions={
          <>
            <GlowButton
              href={`/growth-plan?goal=${goal.slug}`}
              size="lg"
              iconRight={<ArrowRight size={18} aria-hidden="true" />}
            >
              Build my growth plan
            </GlowButton>
            <GlowButton href="/services" variant="ghost" size="lg">
              Explore services
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={goal.color} size={128} emphasis="bright">
              <Icon name="target" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="approach"
        eyebrow="How we'd approach this"
        title="From where you are to where you want to be"
        lead="No two businesses are identical, so this is the shape of the work, not a fixed script. Your plan is tailored to your specifics during discovery."
        align="start"
      >
        <BentoGrid>
          {story.map((part, i) => (
            <BentoCard
              key={part.label}
              hue={goal.color}
              index={String(i + 1).padStart(2, "0")}
              eyebrow="Step"
              title={part.label}
              blurb={part.body}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      {goal.exampleTools.length > 0 && (
        <SectionShell
          id="tools"
          eyebrow="Tools"
          title="Example tools we can connect"
          lead="Set up in your name, never locked to us. These are examples, not a fixed list; we pick what fits your size and budget."
          align="start"
          spacing="tight"
        >
          <ul className={styles.chips}>
            {goal.exampleTools.map((example) => (
              <li key={example} className={styles.chip}>
                {example}
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {relatedServices.length > 0 && (
        <SectionShell
          id="services"
          eyebrow="Services that help"
          title="The building blocks for this goal"
          lead="Each links to where it sits in the service list. We connect the ones that matter, in the right order."
          align="start"
        >
          <BentoGrid>
            {relatedServices.map((sv, i) => (
              <BentoCard
                key={sv.href}
                href={sv.href}
                hue={goal.color}
                icon="link"
                title={sv.name}
                blurb={sv.hint}
                variant={i === 0 ? "featured" : "compact"}
              />
            ))}
          </BentoGrid>
        </SectionShell>
      )}

      {relatedStages.length > 0 && (
        <SectionShell
          id="where-it-fits"
          eyebrow="Where it fits"
          title="How this maps to the growth journey"
          align="start"
          spacing="tight"
        >
          <BentoGrid>
            {relatedStages.map((st) => (
              <BentoCard
                key={st.href}
                href={st.href}
                hue={goal.color}
                icon="compass"
                title={st.name}
                blurb={st.hint}
                variant="compact"
              />
            ))}
          </BentoGrid>
        </SectionShell>
      )}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
