import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, ArrowUpRight, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { GlowButton } from "@/components/primitives/GlowButton";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Icon } from "@/components/primitives/Icon";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import { StageMarker } from "@/components/viz/StageMarker";
import { ScrollThread } from "@/components/viz/ScrollThread";
import { MessageCard } from "@/components/viz/FloatingCards";
import type { DomainConfig } from "@/lib/services/domains";
import type { DeliveryModel, GrowthStage, Service, ServiceCategory } from "@/lib/content/types";
import styles from "./ServiceDomainTemplate.module.css";

interface ServiceDomainTemplateProps {
  config: DomainConfig;
  category: ServiceCategory;
  services: Service[];
  deliveryModels: DeliveryModel[];
  stages: GrowthStage[];
}

/**
 * ServiceDomainTemplate — the reusable Constellation page for one service domain. Everything
 * is driven by a DomainConfig plus the live content: one hue recolours the whole page, the
 * full service list is grouped into bento clusters (never a flat grid), each card shows its
 * delivery model, and the page opens with "where this sits" and closes with "what's next".
 * Adding another domain is a config entry; nothing here is Strategy-specific.
 */
export function ServiceDomainTemplate({
  config,
  category,
  services,
  deliveryModels,
  stages,
}: ServiceDomainTemplateProps) {
  const hue = config.hue;
  const deliveryByKey = new Map(deliveryModels.map((d) => [d.key, d] as const));
  const serviceBySlug = new Map(services.map((s) => [s.slug, s] as const));

  // Build the clusters, then sweep any service not placed into a "more in this domain" group,
  // so a config can never silently drop a service from the full list.
  const placed = new Set(config.clusters.flatMap((c) => c.serviceSlugs));
  const leftover = services.filter((s) => !placed.has(s.slug));
  const clusters = [
    ...config.clusters.map((c) => ({
      ...c,
      items: c.serviceSlugs.map((slug) => serviceBySlug.get(slug)).filter((s): s is Service => Boolean(s)),
    })),
    ...(leftover.length > 0
      ? [{ key: "more", heading: "More in this domain", intro: "The rest of what this domain covers.", items: leftover }]
      : []),
  ].filter((c) => c.items.length > 0);

  function copyFor(service: Service) {
    return config.serviceCopy?.[service.slug] ?? service.plainDescription;
  }

  function deliveryBadge(service: Service) {
    const delivery = deliveryByKey.get(service.deliveryModel);
    if (!delivery) return null;
    return (
      <Badge color={DELIVERY_COLOR[delivery.key]} variant="soft">
        <span className="iw-visually-hidden">Delivery model: </span>
        {delivery.name}
      </Badge>
    );
  }

  function serviceCard(service: Service, variant: "featured" | "medium") {
    return (
      <BentoCard
        key={service.slug}
        id={service.slug}
        variant={variant}
        hue={hue}
        icon={category.icon}
        title={service.name}
        blurb={copyFor(service)}
        badge={deliveryBadge(service)}
      />
    );
  }

  return (
    <>
      <ScrollThread hue={hue} />

      {/* ============ Hero ============ */}
      <section className={`theme-cosmic iw-section ${styles.hero}`} aria-labelledby="domain-heading">
        <CosmicBackground horizon />
        <div className={`iw-container iw-container--wide ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <Breadcrumbs trail={[{ name: "Services", path: "/services" }, { name: category.name }]} />
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              Service domain
            </p>
            <div className={styles.heroTitleRow}>
              <NodeOrb hue={hue} size={64} emphasis="bright" className={styles.heroOrb}>
                <Icon name={category.icon} />
              </NodeOrb>
              <h1 id="domain-heading" className={styles.heading}>
                {category.name}
              </h1>
            </div>
            <p className={styles.definition}>{config.definition}</p>
            <div className={styles.heroCtas}>
              <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
                Build my growth plan
              </GlowButton>
              <GlowButton href="/contact" variant="ghost" size="lg">
                Talk to us
              </GlowButton>
            </div>
            <StageMarker stages={stages} activeSlug={config.stageSlug} hue={hue} className={styles.marker} />
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <span className={styles.heroBigOrb} style={{ ["--hue" as string]: hue }}>
              <NodeOrb hue={hue} size={132} emphasis="bright">
                <Icon name={category.icon} />
              </NodeOrb>
            </span>
            <MessageCard
              title="Plan mapped"
              body="A clear first step, in order"
              hue={hue}
              className={styles.heroFloat}
            />
          </div>
        </div>
      </section>

      {/* ============ What you get (light breather) ============ */}
      <section className={`theme-band-bright iw-section ${styles.outcomes}`} aria-labelledby="domain-outcomes">
        <div className="iw-container iw-container--wide">
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              Why it matters
            </p>
            <h2 id="domain-outcomes" className={styles.sectionTitle}>
              What you get from this
            </h2>
          </header>
          <ul className={styles.outcomeGrid}>
            {config.outcomes.map((o) => (
              <li key={o.title} className={styles.outcomeCard} style={{ ["--hue" as string]: hue }}>
                <NodeOrb hue={hue} size={44}>
                  <Icon name={o.icon} />
                </NodeOrb>
                <h3 className={styles.outcomeTitle}>{o.title}</h3>
                <p className={styles.outcomeBody}>{o.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ The full catalog ============ */}
      <section className={`theme-cosmic iw-section ${styles.catalog}`} aria-labelledby="domain-catalog">
        <CosmicBackground />
        <div className={`iw-container iw-container--wide ${styles.catalogInner}`}>
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              The full picture
            </p>
            <h2 id="domain-catalog" className={styles.sectionTitle}>
              Everything in {category.name}
            </h2>
            <p className={styles.sectionLead}>
              The complete list, grouped so it&apos;s easy to follow. Every service shows how
              we&apos;d deliver it, so you always know who does the work.
            </p>
          </header>

          <div className={styles.clusters}>
            {clusters.map((cluster) => {
              const [first, ...rest] = cluster.items;
              return (
                <div key={cluster.key} className={styles.cluster}>
                  <div className={styles.clusterHead}>
                    <h3 className={styles.clusterHeading}>{cluster.heading}</h3>
                    <p className={styles.clusterIntro}>{cluster.intro}</p>
                  </div>
                  {cluster.items.length === 1 ? (
                    <ul className={styles.soloWrap}>{serviceCard(first, "featured")}</ul>
                  ) : (
                    <BentoGrid>
                      {serviceCard(first, "featured")}
                      {rest.map((s) => serviceCard(s, "medium"))}
                    </BentoGrid>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ How this connects ============ */}
      <section className={`theme-cosmic iw-section ${styles.connects}`} aria-labelledby="domain-connects">
        <div className="iw-container iw-container--wide">
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              How this connects
            </p>
            <h2 id="domain-connects" className={styles.sectionTitle}>
              A plan feeds everything after it
            </h2>
            <p className={styles.sectionLead}>
              This is what a service list never shows. The work here points the rest of your growth
              in the right direction.
            </p>
          </header>

          <ol className={styles.flow}>
            <li className={styles.flowStart} style={{ ["--hue" as string]: hue }}>
              <NodeOrb hue={hue} size={52} emphasis="bright">
                <Icon name={category.icon} />
              </NodeOrb>
              <span className={styles.flowStartLabel}>{category.name}</span>
            </li>
            {config.connectsTo.map((c) => (
              <Fragment key={c.label}>
                <li className={styles.flowConn} aria-hidden="true">
                  <ConnectorPath className={styles.flowConnPath} from={hue} via={c.hue} to={c.hue} dots={1} d="M0 12 H100" />
                </li>
                <li className={styles.flowNode} style={{ ["--hue" as string]: c.hue }}>
                  <NodeOrb hue={c.hue} size={40}>
                    <Icon name={c.icon} />
                  </NodeOrb>
                  <span className={styles.flowNodeText}>
                    <span className={styles.flowNodeLabel}>{c.label}</span>
                    <span className={styles.flowNodeBody}>{c.body}</span>
                  </span>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ Who it's for ============ */}
      <section className={`theme-cosmic iw-section iw-section--tight ${styles.forWho}`} aria-labelledby="domain-forwho">
        <div className={`iw-container iw-container--wide ${styles.forWhoInner}`}>
          <div className={styles.forWhoText}>
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              Who it&apos;s for
            </p>
            <h2 id="domain-forwho" className={styles.sectionTitle}>
              When this is the priority
            </h2>
            <p className={styles.sectionLead}>{config.forWho}</p>
          </div>
          <ul className={styles.whenList}>
            {config.when.map((w) => (
              <li key={w} className={styles.whenItem} style={{ ["--hue" as string]: hue }}>
                <span className={styles.whenIcon} aria-hidden="true">
                  <Check size={15} strokeWidth={2.5} />
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ Next step + next domain ============ */}
      <section className={`theme-cosmic iw-section ${styles.next}`} aria-labelledby="domain-next">
        <CosmicBackground horizon />
        <div className={`iw-container iw-container--wide ${styles.nextInner}`}>
          <div className={styles.nextCta}>
            <p className={styles.eyebrow} style={{ ["--hue" as string]: hue }}>
              Your next step
            </p>
            <h2 id="domain-next" className={styles.nextTitle}>
              Not sure which of these you need first?
            </h2>
            <p className={styles.nextBody}>
              That&apos;s what the plan is for. Answer a few questions and we&apos;ll map the
              smallest next step for your situation, then the ones that follow.
            </p>
            <div className={styles.nextActions}>
              <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
                Build my growth plan
              </GlowButton>
              <Link href="/services" className={styles.viewAll}>
                <MessageSquare size={16} aria-hidden="true" />
                View all services
              </Link>
            </div>
          </div>

          <Link href={`/services/${config.next.slug}`} className={styles.nextDomain} style={{ ["--hue" as string]: config.next.hue }}>
            <span className={styles.nextDomainKey}>Next in the journey</span>
            <span className={styles.nextDomainName}>{config.next.name}</span>
            <span className={styles.nextDomainGo}>
              Continue the journey
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
