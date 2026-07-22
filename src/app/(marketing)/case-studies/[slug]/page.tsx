import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Card } from "@/components/primitives/Card";
import { Callout } from "@/components/primitives/Callout";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { DomainCard } from "@/components/cards/DomainCard";
import { ScenarioApproachList, type ApproachStep } from "@/components/routes/ScenarioApproachList";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { domainInk } from "@/lib/design/domainColor";
import { getCaseScenario, getCaseScenarios, getServiceCategories } from "@/lib/content";
import styles from "../case.module.css";

export async function generateStaticParams() {
  const scenarios = await getCaseScenarios();
  return scenarios.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scenario = await getCaseScenario(slug);
  if (!scenario) return { title: "Case study not found" };
  return pageMetadata({
    title: `${scenario.title} (example scenario)`,
    description: `An illustrative example, not a real client: ${scenario.summary}`,
    path: `/case-studies/${scenario.slug}`,
  });
}

/**
 * /case-studies/[slug] — a worked EXAMPLE scenario: the challenge, the connected approach, the
 * work, and a qualitative outcome. Clearly and repeatedly labelled an illustrative example, not
 * a real client; carries breadcrumb structured data only (no Review / AggregateRating / result
 * schema that would imply real proof).
 */
export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [scenario, categories] = await Promise.all([getCaseScenario(slug), getServiceCategories()]);
  if (!scenario) notFound();

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));
  const relatedDomains = scenario.categorySlugs
    .map((cs) => categoryBySlug.get(cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const approachSteps: ApproachStep[] = scenario.approach.map((step, i) => ({
    number: i + 1,
    label: step.label,
    detail: step.detail,
    icon: step.icon,
    tone: step.hue,
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
          { name: scenario.title, path: `/case-studies/${scenario.slug}` },
        ])}
      />

      <PageHeader
        id="case-hero"
        breadcrumbs={[{ name: "Case studies", path: "/case-studies" }, { name: scenario.title }]}
        eyebrow="Illustrative example"
        accent={domainInk(scenario.hue)}
        title={scenario.title}
        lead={scenario.summary}
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#approach" variant="secondary">
              See the approach
            </Button>
          </>
        }
        trustNote={
          <>
            <Badge tone="information" icon={<Info aria-hidden="true" />}>
              Illustrative example
            </Badge>{" "}
            {scenario.forWho}
          </>
        }
      />

      <SectionShell
        surface="alt"
        id="challenge"
        eyebrow="The situation"
        title="The challenge"
        lead={scenario.challenge}
        align="start"
      >
        <Callout tone="information" title="This is an illustrative example, not a real client.">
          It shows how a connected system fits together for this kind of business. No client name,
          logo, testimonial or specific numeric result here is real.
        </Callout>
      </SectionShell>

      <SectionShell
        surface="light"
        id="approach"
        eyebrow="The connected approach"
        title="The parts of the system that solve it"
        lead="Each part is tied to a domain of the work. On their own they help; connected around the goal, they compound."
        align="start"
      >
        <ScenarioApproachList steps={approachSteps} />
      </SectionShell>

      <SectionShell surface="alt" id="work" eyebrow="What we'd do" title="The work involved" align="start">
        <ul className={styles.workList}>
          {scenario.work.map((item) => (
            <li key={item} className={styles.workItem}>
              <span className={styles.workCheck} aria-hidden="true">
                <Check size={14} strokeWidth={2.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell surface="light" id="outcome" eyebrow="The result" title="The outcome" align="start">
        <div className={styles.outcomeGrid}>
          <p className={styles.outcomeText}>{scenario.outcome}</p>
          <Card variant="raised" accent={domainInk(scenario.hue)} className={styles.outcomeCard}>
            <Badge tone="information" icon={<Info aria-hidden="true" />}>
              Illustrative outcome
            </Badge>
            <p className={styles.outcomeResult}>
              <span className={styles.outcomeLabel}>{scenario.result.label}</span>
              <span className={styles.outcomeValue}>{scenario.result.value}</span>
            </p>
            <p className={styles.outcomeNote}>Qualitative example, not a measured client result.</p>
          </Card>
        </div>
      </SectionShell>

      {relatedDomains.length > 0 ? (
        <SectionShell
          surface="alt"
          id="domains"
          eyebrow="The domains involved"
          title="Where this work lives"
          lead="The service domains this scenario draws on. Open any one to see exactly what's inside."
          align="start"
        >
          <CardGrid layout="equal" aria-label="Service domains involved">
            {relatedDomains.map((cat) => (
              <DomainCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                eyebrow="Service domain"
                title={cat.name}
                description={cat.intro}
                icon={cat.icon}
                tone={cat.color}
              />
            ))}
          </CardGrid>
        </SectionShell>
      ) : null}

      <FinalCtaSection
        id="get-started"
        title="Build a plan for your situation"
        lead="This is an illustrative example, not a delivered result. Tell us your goals and we'll map a connected plan around them. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/case-studies", label: "See more examples" }}
      />
    </>
  );
}
