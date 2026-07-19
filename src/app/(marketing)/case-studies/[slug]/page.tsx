import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import { StatCard } from "@/components/viz/FloatingCards";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseScenario, getCaseScenarios, getServiceCategories } from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";
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
 * /case-studies/[slug] — a worked EXAMPLE scenario on the case template: the challenge, the
 * connected approach (each part tied to a domain hue), the work, and a qualitative outcome.
 * Clearly labelled an example, not a real client; carries breadcrumb structured data only (no
 * Review / result schema that would imply real proof).
 */
export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [scenario, categories] = await Promise.all([getCaseScenario(slug), getServiceCategories()]);
  if (!scenario) notFound();

  const relatedDomains = scenario.categorySlugs
    .map((cs) => categories.find((c) => c.slug === cs))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
          { name: scenario.title, path: `/case-studies/${scenario.slug}` },
        ])}
      />

      <CosmicPageHero
        id="case-hero"
        breadcrumbs={[{ name: "Case studies", path: "/case-studies" }, { name: scenario.title }]}
        eyebrow={`Example scenario · ${scenario.forWho}`}
        hue={scenario.hue}
        title={scenario.title}
        lead={scenario.summary}
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#approach" variant="ghost" size="lg">
              See the approach
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={scenario.hue} size={128} emphasis="bright">
              <Icon name="git-branch" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell id="challenge" eyebrow="The situation" title="The challenge" lead={scenario.challenge} align="start">
        <div className={styles.notice}>
          <Info className={styles.noticeIcon} size={20} aria-hidden="true" />
          <p className={styles.noticeText}>
            <strong>This is an illustrative example, not a real client.</strong> It shows how a
            connected system fits together for this kind of business. No client name, logo,
            testimonial or specific numeric result is real.
          </p>
        </div>
      </SectionShell>

      <SectionShell
        id="approach"
        eyebrow="The connected approach"
        title="The parts of the system that solve it"
        lead="Each part is tied to a domain of the work. On their own they help; connected around the goal, they compound."
        align="start"
      >
        <ol className={styles.flow}>
          {scenario.approach.map((step, i) => (
            <Fragment key={step.label}>
              <li className={styles.node} style={{ ["--hue" as string]: step.hue }}>
                <NodeOrb hue={step.hue} size={52} emphasis="bright">
                  <Icon name={step.icon} />
                </NodeOrb>
                <h3 className={styles.nodeTitle}>{step.label}</h3>
                <p className={styles.nodeDetail}>{step.detail}</p>
              </li>
              {i < scenario.approach.length - 1 ? (
                <li className={styles.conn} aria-hidden="true">
                  <ConnectorPath
                    from={step.hue}
                    via={scenario.approach[i + 1].hue}
                    to={scenario.approach[i + 1].hue}
                    dots={1}
                    d="M0 12 H100"
                  />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </SectionShell>

      <SectionShell id="work" eyebrow="What we'd do" title="The work involved" align="start">
        <ul className={styles.workList} style={{ ["--hue" as string]: scenario.hue }}>
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

      <SectionShell id="outcome" eyebrow="The result" title="The outcome" align="start">
        <div className={styles.outcomeGrid}>
          <p className={styles.outcomeText}>{scenario.outcome}</p>
          <div className={styles.outcomeCard} aria-hidden="true">
            <StatCard label={scenario.result.label} value={scenario.result.value} hue={scenario.hue} />
          </div>
        </div>
      </SectionShell>

      {relatedDomains.length > 0 ? (
        <SectionShell
          id="domains"
          eyebrow="The domains involved"
          title="Where this work lives"
          lead="The service domains this scenario draws on. Open any one to see exactly what's inside."
          align="start"
        >
          <BentoGrid>
            {relatedDomains.map((cat, i) => (
              <BentoCard
                key={cat.slug}
                href={`/services/${cat.slug}`}
                hue={getServiceDomainConfig(cat.slug)?.hue ?? cat.color}
                icon={cat.icon}
                title={cat.name}
                blurb={cat.intro}
                variant={i === 0 ? "featured" : "medium"}
              />
            ))}
          </BentoGrid>
        </SectionShell>
      ) : null}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
