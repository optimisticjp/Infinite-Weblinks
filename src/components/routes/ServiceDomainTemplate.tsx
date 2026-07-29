import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Card } from "@/components/primitives/Card";
import { Callout } from "@/components/primitives/Callout";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { LinkChip } from "@/components/primitives/LinkChip";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { DomainCard } from "@/components/cards/DomainCard";
import { ServiceOfferingCard } from "@/components/cards/ServiceOfferingCard";
import { ServiceConnectionList } from "@/components/routes/ServiceConnectionList";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { domainInk } from "@/lib/design/domainColor";
import type { DomainConfig } from "@/lib/services/domains";
import type { GrowthStage, Service, ServiceCategory } from "@/lib/content/types";
import styles from "./ServiceDomainTemplate.module.css";

/** Resolved related goal, de-duplicated and in source-first order (from the category route). */
export type RelatedGoal = { slug: string; title: string; outcome: string };

interface ServiceDomainTemplateProps {
  config: DomainConfig;
  category: ServiceCategory;
  /** This category's services, in source order. */
  services: Service[];
  /** The resolved growth stage this domain is most closely connected to (config.stageSlug). */
  activeStage: GrowthStage;
  /** The resolved next service category (config.next.slug). */
  nextCategory: ServiceCategory;
  /** The de-duplicated goals these services help with, source-first. */
  relatedGoals: RelatedGoal[];
}

const JUMP = [
  { href: "#domain-outcomes", label: "Why it matters" },
  { href: "#domain-catalog", label: "Services included" },
  { href: "#domain-connects", label: "How it connects" },
  { href: "#domain-forwho", label: "When this helps" },
  { href: "#domain-next", label: "What comes next" },
];

/**
 * ServiceDomainTemplate — the reusable V2 light-first page for one service area. PageHeader (server
 * H1 = the category name, LCP text) → a wrapping page-jump nav → why it matters → the full service
 * catalog (clusters of anchored ServiceOfferingCards, every service once) → how it connects → the
 * related goals → who it's for → what comes next → the single reserved dark final CTA. Every field
 * is driven by the DomainConfig + live content (serviceCopy precedence preserved); the config hue
 * only tints wayfinding. No ScrollThread, CosmicBackground/starfield, NodeOrb, GlowButton, Bento,
 * ConnectorPath, StageMarker, MessageCard, DELIVERY_COLOR, fake plan state or cosmic surfaces.
 * Server Component.
 */
export function ServiceDomainTemplate({
  config,
  category,
  services,
  activeStage,
  nextCategory,
  relatedGoals,
}: ServiceDomainTemplateProps) {
  const ink = domainInk(config.hue);
  const serviceBySlug = new Map(services.map((s) => [s.slug, s] as const));

  // Build the clusters, then sweep any service not placed into a stable "More in this domain"
  // group, so a config can never silently drop a service from the full list.
  const placed = new Set(config.clusters.flatMap((c) => c.serviceSlugs));
  const leftover = services.filter((s) => !placed.has(s.slug));
  const clusters = [
    ...config.clusters.map((c) => ({
      key: c.key,
      heading: c.heading,
      intro: c.intro,
      items: c.serviceSlugs.map((slug) => serviceBySlug.get(slug)).filter((s): s is Service => Boolean(s)),
    })),
    ...(leftover.length > 0
      ? [{ key: "more", heading: "More in this domain", intro: "The rest of what this domain covers.", items: leftover }]
      : []),
  ].filter((c) => c.items.length > 0);

  const copyFor = (service: Service) => config.serviceCopy?.[service.slug] ?? service.plainDescription;

  return (
    <>
      <PageHeader
        id="domain-hero"
        surface="light"
        breadcrumbs={[{ name: "Services", path: "/services" }, { name: category.name }]}
        eyebrow="Service area"
        accent={ink}
        title={category.name}
        lead={config.definition}
        actions={
          <>
            <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Talk it through
            </Button>
          </>
        }
        trustNote={
          <>
            Most closely connected to the{" "}
            <Link href={`/how-it-works#${config.stageSlug}`} className={styles.stageLink}>
              {activeStage.name}
            </Link>{" "}
            stage.
          </>
        }
      />

      <div className={`theme-deep ${styles.jumpBand}`}>
        <div className="iw-container iw-container--wide">
          <nav aria-label="Service area sections" className={styles.jumpNav}>
            {JUMP.map((j) => (
              <LinkChip key={j.href} href={j.href}>
                {j.label}
              </LinkChip>
            ))}
          </nav>
        </div>
      </div>

      {/* ============ Why it matters ============ */}
      <SectionShell
        surface="alt"
        id="domain-outcomes"
        eyebrow="Why it matters"
        title="What you get from this"
        align="start"
      >
        <CardGrid layout="equal" aria-label="What you get">
          {config.outcomes.map((o) => (
            <Card
              key={o.title}
              as="article"
              variant="outlined"
              accent={ink}
              className={styles.outcome}
              style={{ ["--card-accent" as string]: ink } as CSSProperties}
            >
              <IconTile color={ink} size="md">
                <Icon name={o.icon} />
              </IconTile>
              <h3 className={styles.outcomeTitle}>{o.title}</h3>
              <p className={styles.outcomeBody}>{o.body}</p>
            </Card>
          ))}
        </CardGrid>
      </SectionShell>

      {/* ============ The full catalog ============ */}
      <SectionShell
        surface="light"
        id="domain-catalog"
        eyebrow="The full picture"
        title={`Everything in ${category.name}`}
        lead="The complete list, grouped so it's easy to follow. Every service shows how we'd deliver it, so you always know who does the work."
        align="start"
      >
        <Callout tone="information" className={styles.toolsNote}>
          Example tools are illustrative. No partnership or endorsement is implied.
        </Callout>

        <div className={styles.clusters}>
          {clusters.map((cluster) => (
            <div key={cluster.key} className={styles.cluster}>
              <h3 className={styles.clusterHeading}>{cluster.heading}</h3>
              <p className={styles.clusterIntro}>{cluster.intro}</p>
              <CardGrid layout="equal" aria-label={cluster.heading}>
                {cluster.items.map((service) => (
                  <ServiceOfferingCard
                    key={service.slug}
                    slug={service.slug}
                    title={service.name}
                    summary={copyFor(service)}
                    deliveryModel={service.deliveryModel}
                    whatYouGet={service.whatYouGet}
                    exampleTools={service.exampleTools}
                    categoryIcon={category.icon}
                    categoryTone={config.hue}
                  />
                ))}
              </CardGrid>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ============ How this connects ============ */}
      <SectionShell
        surface="alt"
        id="domain-connects"
        eyebrow="How this connects"
        title="A plan feeds everything after it"
        lead="This is what a service list never shows. The work here points the rest of your growth in the right direction."
        align="start"
      >
        <ServiceConnectionList
          categoryTitle={category.name}
          categoryDescription={config.definition}
          categoryIcon={category.icon}
          categoryTone={config.hue}
          connectsTo={config.connectsTo}
        />
      </SectionShell>

      {/* ============ Related goals ============ */}
      {relatedGoals.length > 0 ? (
        <SectionShell surface="light" id="domain-goals" ariaLabel="Goals these services help with" align="start">
          <RelationshipCard title="Goals these services help with" icon={<Icon name="target" />} tone={config.hue}>
            {relatedGoals.map((g) => (
              <LinkChip key={g.slug} href={`/goals/${g.slug}`} tone={config.hue} aria-label={`${g.title}: ${g.outcome}`}>
                {g.title}
              </LinkChip>
            ))}
          </RelationshipCard>
        </SectionShell>
      ) : null}

      {/* ============ Who it's for ============ */}
      <SectionShell
        surface="alt"
        id="domain-forwho"
        eyebrow="Who it's for"
        title="When this is the priority"
        lead={config.forWho}
        align="start"
      >
        <ul className={styles.whenList}>
          {config.when.map((w) => (
            <li key={w} className={styles.whenItem}>
              <span className={styles.whenIcon} aria-hidden="true">
                <Check size={15} strokeWidth={2.5} />
              </span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* ============ What comes next ============ */}
      <SectionShell surface="light" id="domain-next" eyebrow="Your next step" title="What comes next" align="start">
        <div className={styles.nextWrap}>
          <DomainCard
            title={config.next.name}
            description={nextCategory.intro}
            href={`/services/${config.next.slug}`}
            icon={nextCategory.icon}
            tone={config.next.hue}
            eyebrow="Next in the journey"
            className={styles.nextCard}
          />
          <Button href="/services" variant="secondary" iconRight={<ArrowUpRight size={16} aria-hidden="true" />}>
            View all service areas
          </Button>
        </div>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Not sure which of these you need first?"
        lead="That's what the plan is for. Answer a few questions and we'll map the smallest next step for your situation, then the ones that follow."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/services", label: "View all service areas" }}
      />
    </>
  );
}
