import type { Metadata } from "next";
import { ArrowRight, Plus, Search, Settings, X, Download } from "lucide-react";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Icon } from "@/components/primitives/Icon";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";
import { Badge } from "@/components/primitives/Badge";
import { Chip } from "@/components/primitives/Chip";
import { DeliveryModelBadge } from "@/components/primitives/DeliveryModelBadge";
import { FilterChip } from "@/components/primitives/FilterChip";
import { IconTile } from "@/components/primitives/IconTile";
import { Card } from "@/components/primitives/Card";
import { CardGrid } from "@/components/primitives/CardGrid";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { Callout } from "@/components/primitives/Callout";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { ToolCard } from "@/components/cards/ToolCard";
import { RoadmapCard } from "@/components/cards/RoadmapCard";
import { GoalCard } from "@/components/cards/GoalCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { JourneyStageCard } from "@/components/cards/JourneyStageCard";
import { StartingPointCard } from "@/components/cards/StartingPointCard";
import { BusinessTypeCard } from "@/components/cards/BusinessTypeCard";
import { CrossCuttingSystemCard } from "@/components/cards/CrossCuttingSystemCard";
import { GoalPath } from "@/components/routes/GoalPath";
import { Stepper } from "@/components/primitives/Stepper";
import { ProgressChecklist } from "@/components/primitives/ProgressChecklist";
import { PlanIncludeCard } from "@/components/cards/PlanIncludeCard";
import { PlanReveal } from "@/components/builder/PlanReveal";
import { GrowthJourneyList } from "@/components/routes/GrowthJourneyList";
import { ConnectedSystemFlow } from "@/components/routes/ConnectedSystemFlow";
import { ProcessStepList } from "@/components/routes/ProcessStepList";
import { LinkChip } from "@/components/primitives/LinkChip";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { RoadmapPhaseList } from "@/components/routes/RoadmapPhaseList";
import { DomainCard } from "@/components/cards/DomainCard";
import { ArticleMetaLine } from "@/components/routes/ArticleMetaLine";
import { ScenarioApproachList } from "@/components/routes/ScenarioApproachList";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { GrowthPlanPreview } from "@/components/routes/GrowthPlanPreview";
import { HomepageProblemSection } from "@/components/sections/home/HomepageProblemSection";
import { HomepageGoalRouterSection } from "@/components/sections/home/HomepageGoalRouterSection";
import { HomepageConnectedSystemSection } from "@/components/sections/home/HomepageConnectedSystemSection";
import { DeliveryModelsExplainerSection } from "@/components/sections/DeliveryModelsExplainerSection";
import { HomepageTrustSection } from "@/components/sections/home/HomepageTrustSection";
import { HomepageLearningSection } from "@/components/sections/home/HomepageLearningSection";
import { PrincipleCard } from "@/components/cards/PrincipleCard";
import { OwnershipDetails } from "@/components/routes/OwnershipDetails";
import { HonestExpectationsPanel } from "@/components/routes/HonestExpectationsPanel";
import { CustomerJourneyList } from "@/components/routes/CustomerJourneyList";
import { ConnectedExampleCard } from "@/components/cards/ConnectedExampleCard";
import { ConnectedGrowthExamplesSection } from "@/components/sections/ConnectedGrowthExamplesSection";
import { ServiceCategoryCard } from "@/components/cards/ServiceCategoryCard";
import { ServiceOfferingCard } from "@/components/cards/ServiceOfferingCard";
import { ServiceConnectionList } from "@/components/routes/ServiceConnectionList";
import { PricingFactorCard } from "@/components/cards/PricingFactorCard";
import { PricingDeliveryCard } from "@/components/cards/PricingDeliveryCard";
import { EngagementShapeCard } from "@/components/cards/EngagementShapeCard";
import { QuoteProcessList } from "@/components/routes/QuoteProcessList";
import { PricingFaqList } from "@/components/routes/PricingFaqList";
import { ContactPathCard } from "@/components/cards/ContactPathCard";
import { ContactPreviewDemo } from "./ContactPreviewDemo";
import {
  getHomepageOpening,
  getAccountOwnership,
  getCustomerJourney,
  getServiceCategories,
  getServices,
  getDeliveryModels,
} from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";
import {
  pricingFactors,
  pricingEngagementShapes,
  pricingQuoteSteps,
  pricingFaqs,
} from "@/lib/content/data/pricing";
import {
  contactTrustPoints,
  contactProcessSteps,
  contactAlternativePaths,
} from "@/lib/content/data/contact";
import { growthPlanIncludes } from "@/lib/content/data/growth-plan";
import type { GrowthPlanResult } from "@/lib/growth-plan/types";
import { FilterChipDemo } from "./FilterChipDemo";
import { GrowthPlanPreviewDemo } from "./GrowthPlanPreviewDemo";
import styles from "./design-preview.module.css";

/**
 * INTERNAL V2 component + foundation preview — TEMPORARY.
 *
 * The single source of truth for the V2 primitives: every component example below uses the
 * real production component (Button, IconButton, Badge, Chip, FilterChip, DeliveryModelBadge,
 * IconTile, Card, BentoCard/BentoGrid) on the V2 light surface. noindex/nofollow, excluded
 * from sitemap + nav, exactly one <h1>. Not a Storybook or a marketing page. Remove before
 * production (see docs/design/phase-2a-implementation-report.md).
 */
export const metadata: Metadata = {
  title: "V2 Foundation & Components Preview (internal)",
  robots: { index: false, follow: false },
};

const DOMAINS = [
  { key: "strategy", label: "Strategy", icon: "compass" },
  { key: "build", label: "Build & Launch", icon: "monitor" },
  { key: "discover", label: "Get Discovered", icon: "search" },
  { key: "convert", label: "Convert", icon: "git-branch" },
  { key: "operate", label: "Deliver & Operate", icon: "settings" },
  { key: "retain", label: "Retain", icon: "heart" },
  { key: "ai", label: "AI & Data", icon: "zap" },
] as const;

const STATUSES = [
  { key: "success", label: "Success", icon: "check" },
  { key: "warning", label: "Warning", icon: "shield" },
  { key: "danger", label: "Danger", icon: "help-circle" },
  { key: "info", label: "Information", icon: "sparkles" },
] as const;

/**
 * A representative Growth Plan result, for previewing PlanReveal with every section populated. This is
 * an illustrative fixture — NOT a real recommendation — so a human and the axe scan can see the full
 * result view. The real result comes from the deterministic engine on /growth-plan.
 */
const PLAN_REVEAL_PREVIEW: GrowthPlanResult = {
  matchedRuleId: "preview-fixture",
  startHere: [
    "Publish a clear one-page website that explains what you do and who it's for.",
    "Set up a business email address on your own domain.",
  ],
  connectNext: [
    "Connect a simple contact form to your inbox so enquiries land in one place.",
    "Add privacy-friendly analytics so you can see what's actually working.",
  ],
  addLater: [
    "Start a short email newsletter to stay in touch with the people who visit.",
    "Add booking or checkout once there's steady demand for it.",
  ],
  relevantCapabilities: ["Website & landing pages", "Domain & email setup", "Analytics"],
  exampleTools: ["Google Workspace", "Cloudflare", "Plausible"],
  expectedOutcomes: [
    "A website you own and control.",
    "A professional email address on your own domain.",
    "A clear view of your first visitors.",
  ],
  howWeHelp:
    "We'd set up the first version with you, then hand over the controls so you keep ownership of everything.",
};

export default async function DesignPreviewPage() {
  const { hero, editorial } = await getHomepageOpening();
  const ownership = await getAccountOwnership();
  const journey = await getCustomerJourney();
  const [svcCategories, allServices] = await Promise.all([getServiceCategories(), getServices()]);
  const svcCountByCategory = new Map<string, number>();
  for (const s of allServices) svcCountByCategory.set(s.categorySlug, (svcCountByCategory.get(s.categorySlug) ?? 0) + 1);
  const strategyConfig = getServiceDomainConfig("strategy-discovery");
  const strategyCategory = svcCategories.find((c) => c.slug === "strategy-discovery");
  const strategyServices = allServices.filter((s) => s.categorySlug === "strategy-discovery");
  const websitesCategory = svcCategories.find((c) => c.slug === "websites-development");
  const deliveryModels = await getDeliveryModels();
  // The real factor with the longest blurb, to show long-copy wrapping in a PricingFactorCard.
  const longFactor = [...pricingFactors].sort((a, b) => b.blurb.length - a.blurb.length)[0];

  return (
    <main id="main" className={`theme-light ${styles.wrap}`}>
      <div className={styles.banner}>
        <span className={styles.bannerTag}>Internal · noindex</span>
        <span>
          V2 “Clear Systems” component preview — not a production page. Examples use the real
          primitives; contrast is verified by tests/unit/v2-contrast.test.ts (WCAG 2.2 AA).{" "}
          <a href="/design-preview/shells">Page shells preview →</a>
        </span>
      </div>

      <div className="iw-container">
        {/* 1 · Intro (the one document H1) */}
        <section className={styles.section}>
          <SectionHeader
            as="h1"
            eyebrow="V2 Foundation · Phase 2A"
            title="Clear Systems — core primitives"
            intro="Stripe-style structure and restraint (~70%) warmed with Clay colour, bento and character (~30%), as original Infinite Weblinks identity. Every example uses the production component; V2 styling activates only inside the V2 theme surfaces."
          />
        </section>

        {/* 2 · Surfaces */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Surfaces</h2>
          <div className={styles.gridWide}>
            <div className={`theme-light ${styles.surfacePanel}`}>
              <span className={styles.cardTitle}>theme-light</span>
              <span className={styles.cardBody}>Base near-white canvas (paper). Default V2 surface.</span>
              <div className={styles.row}>
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
              </div>
            </div>
            <div className={`theme-light-alt ${styles.surfacePanel}`}>
              <span className={styles.cardTitle}>theme-light-alt</span>
              <span className={styles.cardBody}>Alternating band (paper-2); raised cards lift to white.</span>
              <div className={styles.row}>
                <Button size="sm">Primary</Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
              </div>
            </div>
            <div className={`theme-night ${styles.surfacePanel}`}>
              <span className={styles.cardTitle}>theme-night</span>
              <span className={styles.cardBody}>Reserved dark signature surface — never a fallback.</span>
              <div className={styles.row}>
                <Button variant="signature" size="sm">
                  Signature
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 3 · Typography (non-semantic specimens — one document H1 only) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Display · Sora 700</span>
            <p className={styles.display} style={{ margin: 0 }}>
              Digital growth, built around your goals
            </p>
          </div>
          {[
            ["H1", styles.h1Sample, "A smarter way to plan and grow"],
            ["H2", styles.h2Sample, "One connected system, in the right order"],
            ["H3", styles.h3Sample, "Start where you are"],
            ["H4", styles.h4Sample, "What you get"],
          ].map(([label, cls, text]) => (
            <div key={label} className={styles.typeRow}>
              <span className={styles.typeLabel}>{label} (visual sample — not a document heading)</span>
              <p className={cls} style={{ margin: 0 }}>
                {text}
              </p>
            </div>
          ))}
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Lead</span>
            <p className={styles.lead}>
              We help you choose the right digital tools and services, build what you need, and make
              everything work together around your goals.
            </p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Body · 10.1:1</span>
            <p className={styles.body}>
              Growth online works as one connected system, where each part feeds the next — and the
              order usually matters more than the number of tools you use.
            </p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Muted · 5.35:1</span>
            <p className={styles.muted}>Secondary and caption text stays readable on every surface.</p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Mono / eyebrow</span>
            <span className={styles.mono}>THE CONNECTED PICTURE</span>
          </div>
        </section>

        {/* 4 · Colour */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Colour</h2>
          <p className={styles.subTitle}>Brand</p>
          <div className={styles.grid}>
            {[
              { name: "brand", v: "var(--v2-brand)", note: "6.12:1 vs white" },
              { name: "brand-strong", v: "var(--v2-brand-strong)", note: "7.87:1 vs white" },
              { name: "brand-tint", v: "var(--v2-brand-tint)", note: "selected surface" },
              { name: "signature grad", v: "var(--v2-grad-signature)", note: "CTAs only · min 5.44:1" },
            ].map((s) => (
              <div key={s.name} className={styles.swatch}>
                <div className={styles.swatchChip} style={{ background: s.v }} />
                <div className={styles.swatchMeta}>
                  <span className={styles.swatchName}>{s.name}</span>
                  <span className={styles.swatchNote}>{s.note}</span>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.subTitle}>Domain wayfinding (ink on its tint)</p>
          <div className={styles.grid}>
            {DOMAINS.map((d) => (
              <div key={d.key} className={styles.swatch}>
                <div
                  className={styles.swatchChip}
                  style={{ background: `var(--v2-domain-${d.key}-tint)`, display: "grid", placeItems: "center" }}
                >
                  <span style={{ color: `var(--v2-domain-${d.key}-ink)`, fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                    {d.label}
                  </span>
                </div>
                <div className={styles.swatchMeta}>
                  <span className={styles.swatchName}>domain-{d.key}</span>
                  <span className={styles.swatchNote}>ink ≥ 4.5:1 on tint</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 · Borders + 6 · Elevation + 7 · Radii */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Borders, elevation &amp; radii</h2>
          <p className={styles.subTitle}>Borders</p>
          <div className={styles.grid}>
            <div className={styles.borderTile} style={{ border: "1px solid var(--hairline)" }}>
              hairline
            </div>
            <div className={styles.borderTile} style={{ border: "1px solid var(--hairline-strong)" }}>
              hairline-strong · 3.66:1
            </div>
          </div>
          <p className={styles.subTitle}>Elevation (neutral shadows, no glow)</p>
          <div className={styles.grid}>
            {["xs", "sm", "md", "lg", "card-hover"].map((n) => (
              <div key={n} className={styles.shadowTile} style={{ boxShadow: `var(--v2-shadow-${n})` }}>
                shadow-{n}
              </div>
            ))}
          </div>
          <p className={styles.subTitle}>Radii</p>
          <div className={styles.grid}>
            {[
              ["sm 8", "var(--v2-radius-sm)"],
              ["md 12", "var(--v2-radius-md)"],
              ["lg 16", "var(--v2-radius-lg)"],
              ["xl 24", "var(--v2-radius-xl)"],
              ["pill", "var(--v2-radius-pill)"],
            ].map(([n, v]) => (
              <div key={n} className={styles.radiusTile} style={{ borderRadius: v }}>
                {n}
              </div>
            ))}
          </div>
        </section>

        {/* 8 · Buttons */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Button</h2>
          <p className={styles.subTitle}>Variants (md)</p>
          <div className={styles.row}>
            <Button variant="primary">Build my growth plan</Button>
            <Button variant="signature">Signature CTA</Button>
            <Button variant="secondary">See how it works</Button>
            <Button variant="ghost">Explore services</Button>
            <Button variant="text">Contact us</Button>
          </div>
          <p className={styles.subTitle}>Sizes</p>
          <div className={styles.row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <p className={styles.subTitle}>Icons, link vs button, disabled &amp; loading</p>
          <div className={styles.row}>
            <Button iconLeft={<Plus size={16} />}>Icon left</Button>
            <Button variant="secondary" iconRight={<ArrowRight size={16} />}>
              Icon right
            </Button>
            <Button href="#main">Rendered as a link</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Saving…</Button>
          </div>
          <p className={styles.subTitle}>IconButton (appearance × size, button + link)</p>
          <div className={styles.row}>
            <IconButton label="Search" icon={<Search />} appearance="primary" size="sm" />
            <IconButton label="Search" icon={<Search />} appearance="primary" size="md" />
            <IconButton label="Search" icon={<Search />} appearance="primary" size="lg" />
            <IconButton label="Settings" icon={<Settings />} appearance="secondary" />
            <IconButton label="Dismiss" icon={<X />} appearance="ghost" />
            <IconButton label="Download the guide" icon={<Download />} appearance="secondary" href="#main" />
          </div>
        </section>

        {/* 9 · Badges & chips */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges &amp; chips</h2>
          <p className={styles.subTitle}>Badge tones</p>
          <div className={styles.row}>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="domain" color="var(--v2-domain-discover-ink)">
              Domain
            </Badge>
            <Badge tone="success">Verified</Badge>
            <Badge tone="warning">Draft</Badge>
            <Badge tone="danger">Blocked</Badge>
            <Badge tone="information">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <p className={styles.subTitle}>Delivery-model badges</p>
          <div className={styles.row}>
            <DeliveryModelBadge model="we-do" />
            <DeliveryModelBadge model="we-expert" />
            <DeliveryModelBadge model="we-run" />
            <DeliveryModelBadge model="you-run" />
          </div>
          <p className={styles.subTitle}>Chips (static) &amp; FilterChips (toggle — aria-pressed)</p>
          <div className={styles.row}>
            <Chip icon={<Icon name="check" />}>Custom quote</Chip>
            <Chip icon={<Icon name="link" />}>Connected</Chip>
            <Chip icon={<Icon name="shield" />}>You own it</Chip>
          </div>
          <div className={styles.row} style={{ marginTop: "var(--space-4)" }}>
            <FilterChip selected>Selected (static)</FilterChip>
            <FilterChip>Unselected (static)</FilterChip>
          </div>
          <div className={styles.row} style={{ marginTop: "var(--space-4)" }}>
            <FilterChipDemo />
          </div>
        </section>

        {/* 10 · Icon tiles */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Icon tiles (flat)</h2>
          <p className={styles.subTitle}>Tones (md)</p>
          <div className={styles.tileRow}>
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-ink-muted)">
                <Icon name="folder" />
              </IconTile>
              <span className={styles.tileCaption}>neutral</span>
            </div>
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-brand)">
                <Icon name="sparkles" />
              </IconTile>
              <span className={styles.tileCaption}>brand</span>
            </div>
            {DOMAINS.map((d) => (
              <div key={d.key} className={styles.tileCell}>
                <IconTile color={`var(--v2-domain-${d.key}-ink)`}>
                  <Icon name={d.icon} />
                </IconTile>
                <span className={styles.tileCaption}>{d.key}</span>
              </div>
            ))}
          </div>
          <p className={styles.subTitle}>Status tones &amp; sizes (sm / md / lg) &amp; filled</p>
          <div className={styles.tileRow}>
            {STATUSES.map((s) => (
              <div key={s.key} className={styles.tileCell}>
                <IconTile color={`var(--v2-${s.key})`}>
                  <Icon name={s.icon} />
                </IconTile>
                <span className={styles.tileCaption}>{s.key}</span>
              </div>
            ))}
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-domain-strategy-ink)" size="sm">
                <Icon name="compass" />
              </IconTile>
              <span className={styles.tileCaption}>sm</span>
            </div>
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-domain-strategy-ink)" size="md">
                <Icon name="compass" />
              </IconTile>
              <span className={styles.tileCaption}>md</span>
            </div>
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-domain-strategy-ink)" size="lg">
                <Icon name="compass" />
              </IconTile>
              <span className={styles.tileCaption}>lg</span>
            </div>
            <div className={styles.tileCell}>
              <IconTile color="var(--v2-domain-convert-ink)" variant="filled">
                <Icon name="git-branch" />
              </IconTile>
              <span className={styles.tileCaption}>filled</span>
            </div>
          </div>
        </section>

        {/* 11 · Cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Card surfaces</h2>
          <div className={styles.gridWide}>
            <Card variant="plain">
              <span className={styles.cardTitle}>Plain</span>
              <span className={styles.cardBody}>No border or shadow — a padded grouping block.</span>
            </Card>
            <Card variant="raised">
              <span className={styles.cardTitle}>Raised</span>
              <span className={styles.cardBody}>Paper + hairline + soft neutral shadow. The default panel.</span>
            </Card>
            <Card variant="outlined">
              <span className={styles.cardTitle}>Outlined</span>
              <span className={styles.cardBody}>Crisp functional border, no shadow.</span>
            </Card>
            <Card variant="tinted" accent="var(--v2-domain-convert-ink)" railed>
              <span className={styles.cardTitle}>Tinted + accent rail</span>
              <span className={styles.cardBody}>One domain accent as a soft tint and a top rail.</span>
            </Card>
            <Card as="article" variant="raised" interactive accent="var(--v2-domain-build-ink)">
              <span className={styles.cardTitle}>
                <a href="#main">Interactive (valid link, focus-within lift)</a>
              </span>
              <span className={styles.cardBody}>Hover/focus lifts ≤ 2px with a neutral shadow — no glow.</span>
            </Card>
            <Card variant="night">
              <span className={styles.cardTitle}>Night</span>
              <span className={styles.cardBody}>Self-contained dark card for a signature moment.</span>
            </Card>
          </div>
        </section>

        {/* 12 · Bento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bento (featured / medium / compact · linked + informational)</h2>
          <BentoGrid>
            <BentoCard
              variant="featured"
              hue="var(--v2-domain-strategy-ink)"
              icon="compass"
              eyebrow="Start here"
              title="Explore by goal"
              blurb="Pick where you want to grow and we map the smallest next step."
              href="#main"
              badge={<DeliveryModelBadge model="we-do" />}
            />
            <BentoCard
              variant="medium"
              hue="var(--v2-domain-build-ink)"
              icon="monitor"
              title="Websites & Development"
              blurb="A fast, owned foundation that everything else connects to."
              href="#main"
            />
            <BentoCard
              variant="medium"
              hue="var(--v2-domain-discover-ink)"
              icon="search"
              title="SEO & Content"
              blurb="Be found by the people already looking for you."
              href="#main"
            />
            <BentoCard
              variant="compact"
              hue="var(--v2-domain-operate-ink)"
              icon="settings"
              index="01"
              eyebrow="Informational"
              title="Deliver & Operate"
              blurb="Non-linked tile (no corner arrow, not a single destination)."
            />
            <BentoCard
              variant="compact"
              hue="var(--v2-domain-retain-ink)"
              icon="heart"
              title="Retain"
              blurb="Turn first orders into repeat customers."
              href="#main"
            />
          </BentoGrid>
        </section>

        {/* 12b · Content cards — CardGrid + ArticleCard + CaseStudyCard */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Content cards</h2>

          <p className={styles.subTitle}>ArticleCard — editorial CardGrid (1 explicitly-featured item spans)</p>
          <CardGrid layout="editorial" aria-label="Article preview">
            <ArticleCard
              featured
              href="#main"
              title="How online growth works as one connected system"
              excerpt="The order usually matters more than the number of tools — why each part feeds the next, in plain English."
              goalLabel="Get found on Google"
              goalTone="var(--domain-discover)"
              readingTime="6 min read"
              icon="search"
            />
            <ArticleCard
              href="#main"
              title="Choosing the right first step"
              excerpt="Where to start when everything feels urgent."
              goalLabel="Turn visitors into buyers"
              goalTone="var(--domain-convert)"
              readingTime="4 min read"
              icon="git-branch"
            />
            <ArticleCard
              href="#main"
              title="What connected tools actually mean"
              excerpt="No jargon: what 'everything talks to everything' looks like day to day."
              goalLabel="Guide"
              goalTone="var(--domain-strategy)"
              icon="book-open"
            />
          </CardGrid>

          <p className={styles.subTitle}>CaseStudyCard — equal CardGrid (every card is an illustrative example)</p>
          <CardGrid layout="equal" aria-label="Case scenario preview">
            <CaseStudyCard
              href="#main"
              title="Turning browsers into buyers"
              forWho="An online store getting visitors but not enough sales"
              summary="Fix the store, tracking and follow-up together so more of the same traffic converts."
              tone="var(--domain-convert)"
            />
            <CaseStudyCard
              href="#main"
              title="From a quiet site to steady enquiries"
              forWho="A local service business that relies on word of mouth"
              summary="Get found locally and catch every enquiry in one place."
              tone="var(--domain-discover)"
            />
            <CaseStudyCard
              href="#main"
              title="Earning more from each customer"
              forWho="An established brand whose growth has stalled"
              summary="Retention, loyalty and automation make each existing customer worth more."
              tone="var(--domain-retain)"
            />
          </CardGrid>
        </section>

        {/* 12d · Catalog & planning cards — ToolCard + RoadmapCard (real public seed content) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Catalog &amp; planning cards</h2>

          <p className={styles.subTitle}>ToolCard — two connected areas, and more than three with a truthful +N</p>
          <CardGrid layout="equal" aria-label="Tool card preview">
            <ToolCard
              href="#main"
              title="Email, SMS & CRM Platforms"
              description="Owning your audience directly, through email, SMS, and a CRM that tracks every contact and lead."
              categoryLabel="Email, SMS & CRM"
              categoryTone="var(--blue)"
              categoryIcon="mail"
              connectedAreaLabels={["Ecommerce & Operations", "Analytics & Tracking"]}
            />
            <ToolCard
              href="#main"
              title="Website & Hosting Platforms"
              description="The platform your site or store runs on, plus the hosting and performance layer that keeps it fast and online."
              categoryLabel="Websites, Hosting & Performance"
              categoryTone="var(--blue)"
              categoryIcon="monitor"
              connectedAreaLabels={[
                "Ecommerce & Operations",
                "Email, SMS & CRM",
                "Analytics & Tracking",
                "Automation & AI",
                "SEO & Content",
              ]}
            />
          </CardGrid>

          <p className={styles.subTitle}>RoadmapCard — three phases, and four phases with a truthful +1 phase</p>
          <CardGrid layout="editorial" aria-label="Roadmap card preview">
            <RoadmapCard
              href="#main"
              title="Creator Roadmap"
              intro="The rough shape we'd follow for an audience-first brand building toward monetisation."
              businessTypeLabel="Creators"
              businessTypeTone="var(--pink)"
              businessTypeIcon="play"
              phases={[{ title: "Build the base" }, { title: "Grow one platform" }, { title: "Monetise" }]}
            />
            <RoadmapCard
              href="#main"
              title="Ecommerce Brand Roadmap"
              intro="The rough shape we'd follow for a product seller or D2C brand, tailored during discovery."
              businessTypeLabel="Ecommerce Brands"
              businessTypeTone="var(--lime)"
              businessTypeIcon="shopping-bag"
              phases={[
                { title: "Build the foundation" },
                { title: "Bring in and convert traffic" },
                { title: "Operate and retain" },
                { title: "Scale with data and automation" },
              ]}
            />
          </CardGrid>
        </section>

        {/* 12e · Detail-page building blocks — LinkChip + RelationshipCard + RoadmapPhaseList */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Detail-page building blocks</h2>

          <p className={styles.subTitle}>LinkChip — internal navigation links (distinct from static Chips)</p>
          <div className={styles.row}>
            <LinkChip href="#main" icon={<Icon name="link" />} tone="var(--domain-build)">
              Websites &amp; Development
            </LinkChip>
            <LinkChip href="#main" tone="var(--domain-discover)">
              SEO &amp; Content
            </LinkChip>
            <LinkChip href="#main">Analytics &amp; Tracking</LinkChip>
          </div>

          <p className={styles.subTitle}>RelationshipCard — a group of links, and a long wrapping label</p>
          <CardGrid layout="equal" aria-label="Relationship card preview">
            <RelationshipCard
              title="Connects with"
              description="Areas this joins up to cleanly."
              icon={<Icon name="link" />}
              tone="var(--domain-build)"
            >
              <LinkChip href="#main">Ecommerce &amp; Operations</LinkChip>
              <LinkChip href="#main">Email, SMS &amp; CRM</LinkChip>
              <LinkChip href="#main">Analytics &amp; Tracking</LinkChip>
            </RelationshipCard>
            <RelationshipCard
              title="Suits these businesses"
              description="Kinds of business this area tends to suit."
              icon={<Icon name="users" />}
              tone="var(--domain-retain)"
            >
              <LinkChip href="#main">
                Local &amp; service businesses that rely on a steady flow of enquiries and bookings
              </LinkChip>
            </RelationshipCard>
          </CardGrid>

          <p className={styles.subTitle}>RoadmapPhaseList — three phases (one with services + goals, two without)</p>
          <RoadmapPhaseList
            phases={[
              {
                id: "preview-phase-1",
                number: 1,
                title: "Build the foundation",
                summary: "Store or redesign, checkout, GA4 and pixels, and core email flows.",
                stage: { slug: "foundation", name: "Foundation", tone: "var(--blue)" },
                services: [
                  {
                    slug: "ga4-google-tag-manager-setup",
                    categorySlug: "analytics-data",
                    name: "GA4 & Google Tag Manager setup",
                  },
                ],
                goals: [{ slug: "launch-professional-store", title: "Launch a professional store" }],
              },
              {
                id: "preview-phase-2",
                number: 2,
                title: "Bring in and convert traffic",
                summary: "Ads and SEO to bring traffic, then reviews and retargeting to convert it.",
                stage: { slug: "get-discovered", name: "Get Discovered", tone: "var(--cyan)" },
                services: [],
                goals: [],
              },
              {
                id: "preview-phase-3",
                number: 3,
                title: "Operate and retain",
                summary: "Fulfilment and support systems, then loyalty and lifecycle messaging.",
                stage: null,
                services: [],
                goals: [],
              },
            ]}
          />
        </section>

        {/* 12f · Article & scenario detail blocks — DomainCard + ArticleMetaLine + ScenarioApproachList */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Article &amp; scenario detail blocks</h2>

          <p className={styles.subTitle}>DomainCard — related service domain, and a long wrapping title</p>
          <CardGrid layout="equal" aria-label="Domain card preview">
            <DomainCard
              href="#main"
              eyebrow="Service domain"
              title="Analytics & Data"
              description="Where the numbers actually live, so decisions are based on evidence."
              icon="bar-chart-3"
              tone="var(--cyan)"
            />
            <DomainCard
              href="#main"
              eyebrow="Service domain"
              title="Retention, Loyalty & Advocacy across every owned channel and lifecycle stage"
              description="Turn first orders into repeat customers and advocates."
              icon="heart"
              tone="var(--domain-retain)"
            />
          </CardGrid>

          <p className={styles.subTitle}>ArticleMetaLine — with reading time + a real date, and without a date</p>
          <p className={styles.body}>
            <ArticleMetaLine readMinutes={6} publishedAt="2025-03-14T12:00:00Z" />
          </p>
          <p className={styles.body}>
            <ArticleMetaLine readMinutes={5} />
          </p>

          <p className={styles.subTitle}>ScenarioApproachList — three steps</p>
          <ScenarioApproachList
            steps={[
              {
                number: 1,
                label: "A store built to convert",
                detail: "Fix the checkout, product pages and speed so the path to buy is clear.",
                icon: "monitor",
                tone: "var(--domain-build)",
              },
              {
                number: 2,
                label: "Tracking you can trust",
                detail: "Set up analytics properly so every step from arrival to purchase is measured.",
                icon: "bar-chart-3",
                tone: "var(--domain-ai)",
              },
              {
                number: 3,
                label: "Follow-up that brings people back",
                detail: "Automated email for abandoned carts and past buyers.",
                icon: "mail",
                tone: "var(--domain-retain)",
              },
            ]}
          />

          <p className={styles.subTitle}>Qualitative illustrative outcome (never a statistic dashboard)</p>
          <Card variant="raised" accent="var(--v2-domain-convert-ink)">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", alignItems: "flex-start" }}>
              <Badge tone="information" icon={<Icon name="sparkles" />}>
                Illustrative outcome
              </Badge>
              <span className={styles.cardTitle}>Checkout completion — Improving</span>
              <span className={styles.cardBody}>
                The same traffic does more, because fewer people fall through the gaps.
              </span>
              <span className={styles.cardBody} style={{ color: "var(--text-muted)" }}>
                Qualitative example, not a measured client result.
              </span>
            </div>
          </Card>
        </section>

        {/* 12g · Goal & business-type detail blocks — GoalPath + GoalCard + ServiceCard + JourneyStageCard */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Goal &amp; business-type detail blocks</h2>

          <p className={styles.subTitle}>
            GoalPath — the three parts of a goal as a semantic ordered list (real seed content)
          </p>
          <GoalPath
            need="A store built to sell, with payments and tracking in place from day one."
            help="We build it in-house and set up your tools."
            outcome="A store that's ready to take orders and measure them."
            tone="var(--lime)"
          />

          <p className={styles.subTitle}>GoalCard — with an audience hint, without one, and a long wrapping title</p>
          <CardGrid layout="equal" aria-label="Goal card preview">
            <GoalCard
              href="#main"
              title="Launch a professional store"
              outcome="A store that's ready to take orders and measure them."
              icon="shopping-bag"
              tone="var(--lime)"
              audienceHint="For brands selling products online for the first time, or replacing a marketplace-only setup."
            />
            <GoalCard
              href="#main"
              title="Get found on Google"
              outcome="Steady organic traffic that builds over time."
              icon="search"
              tone="var(--cyan)"
            />
            <GoalCard
              href="#main"
              title="Understand what's actually working across every channel, campaign and customer touchpoint"
              outcome="Decisions based on real numbers instead of hunches."
              icon="bar-chart-3"
              tone="var(--domain-discover)"
            />
          </CardGrid>

          <p className={styles.subTitle}>
            ServiceCard — each of the four locked delivery models, and a long wrapping title
          </p>
          <CardGrid layout="equal" aria-label="Service card preview">
            <ServiceCard
              href="#main"
              title="Website Design & Development"
              description="Your core website, designed and built to load fast, work on every device, and give visitors a clear reason to stay and act."
              categoryLabel="Websites & Development"
              categoryIcon="monitor"
              categoryTone="var(--blue)"
              deliveryModel="we-do"
            />
            <ServiceCard
              href="#main"
              title="Technical SEO"
              description="Fixing the behind-the-scenes issues, like crawl errors, site structure, and page speed, that stop search engines from properly reading and ranking your site."
              categoryLabel="SEO & Content"
              categoryIcon="search"
              categoryTone="var(--cyan)"
              deliveryModel="we-expert"
            />
            <ServiceCard
              href="#main"
              title="SMS Marketing"
              description="Text-message campaigns and automations that reach customers directly, for time-sensitive offers and reminders email alone won't cover."
              categoryLabel="Email, SMS & CRM"
              categoryIcon="mail"
              categoryTone="var(--blue)"
              deliveryModel="we-run"
            />
            <ServiceCard
              href="#main"
              title="Workflow Automation"
              description="Connecting the tools you already use so repetitive manual steps, like copying data between systems, happen automatically instead."
              categoryLabel="AI & Automation"
              categoryIcon="zap"
              categoryTone="var(--pink)"
              deliveryModel="you-run"
            />
            <ServiceCard
              href="#main"
              title="GA4 & Google Tag Manager Setup for full-funnel measurement and attribution"
              description="Proper analytics and tag setup so every important action on your site or store is actually being measured, not just guessed at."
              categoryLabel="Analytics & Data"
              categoryIcon="bar-chart-3"
              categoryTone="var(--cyan)"
              deliveryModel="you-run"
            />
          </CardGrid>

          <p className={styles.subTitle}>JourneyStageCard — the stage&apos;s real journey position, name and summary</p>
          <CardGrid layout="equal" aria-label="Journey stage card preview">
            <JourneyStageCard
              href="#main"
              order={2}
              title="Foundation"
              summary="Brand, website or store, hosting, tracking, and the legal basics. The base everything else sits on."
              icon="layout"
              tone="var(--blue)"
            />
            <JourneyStageCard
              href="#main"
              order={3}
              title="Get Discovered"
              summary="SEO, content, social, video, ads, and marketplaces, so the right people can actually find you."
              icon="search"
              tone="var(--cyan)"
            />
          </CardGrid>
        </section>

        {/* 12h · Goals-hub blocks — StartingPointCard + BusinessTypeCard + hub-jump nav */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Goals-hub blocks</h2>

          <p className={styles.subTitle}>
            StartingPointCard — with a recommended stage, and with a long wrapping label (real seed situations)
          </p>
          <CardGrid layout="equal" aria-label="Starting point card preview">
            <StartingPointCard
              href="#main"
              order={3}
              title="I have a website but no traffic"
              situation="The site is live, but almost nobody is finding it."
              icon="search"
              tone="var(--cyan)"
              recommendedStageLabel="Get Discovered"
            />
            <StartingPointCard
              href="#main"
              order={5}
              title="I'm getting sales but it's chaotic"
              situation="Orders are coming in, but fulfilment, support, and follow-up feel unmanaged."
              icon="workflow"
              tone="var(--pink)"
              recommendedStageLabel="Deliver & Operate"
            />
            <StartingPointCard
              href="#main"
              order={8}
              title="I want to automate and save time across fulfilment, support and follow-up without breaking what already works"
              situation="The process works, but too much of it is manual and repetitive."
              icon="zap"
              tone="var(--domain-operate)"
              recommendedStageLabel="Deliver & Operate"
            />
          </CardGrid>

          <p className={styles.subTitle}>BusinessTypeCard — a compact audience card, and one with a long name and summary</p>
          <CardGrid layout="equal" aria-label="Business type card preview">
            <BusinessTypeCard
              href="#main"
              title="Ecommerce Brands"
              summary="Selling products online, or moving from a marketplace to your own store."
              icon="shopping-bag"
              tone="var(--lime)"
            />
            <BusinessTypeCard
              href="#main"
              title="Established Brands Ready to Scale across multiple channels, markets and customer lifecycles"
              summary="Already profitable, and ready to push further with retention, advocacy, automation and new channels once the data is trustworthy."
              icon="trending-up"
              tone="var(--domain-strategy)"
            />
          </CardGrid>

          <p className={styles.subTitle}>Hub-jump nav — three real internal section links (not a filter)</p>
          <nav aria-label="Choose how to start (preview)" className={styles.row}>
            <LinkChip href="#main">Start with a goal</LinkChip>
            <LinkChip href="#main">Start with where I am</LinkChip>
            <LinkChip href="#main">Start with my business type</LinkChip>
          </nav>
        </section>

        {/* 12i · How-it-works blocks — journey list, cross-cutting system, connected flow, process, delivery */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How-it-works blocks</h2>

          <p className={styles.subTitle}>GrowthJourneyList — three real stages (ordered list, intended outcomes)</p>
          <GrowthJourneyList
            stages={[
              {
                order: 1,
                slug: "preview-discovery-plan",
                name: "Discovery & Plan",
                summary: "Working out the goal, auditing what's already in place, and turning it into a clear roadmap and budget.",
                whatHappens: "We learn your business, goals, and current setup, then turn that into a written plan with a realistic budget and sequence of work.",
                outcome: "A clear roadmap that tells you what to do first, and why.",
                icon: "compass",
                tone: "var(--violet)",
              },
              {
                order: 2,
                slug: "preview-foundation",
                name: "Foundation",
                summary: "Brand, website or store, hosting, tracking, and the legal basics. The base everything else sits on.",
                whatHappens: "We build or tidy up the brand, the site or store itself, hosting, analytics, and the legal pages every business needs before it markets itself.",
                outcome: "A working, trackable base that's ready to have traffic sent to it.",
                icon: "layout",
                tone: "var(--blue)",
              },
              {
                order: 3,
                slug: "preview-get-discovered",
                name: "Get Discovered",
                summary: "SEO, content, social, video, ads, and marketplaces, so the right people can actually find you.",
                whatHappens: "We put you in front of people already looking for what you offer, through search, content, social, video, ads, and marketplaces.",
                outcome: "A steady, growing stream of the right kind of visitor.",
                icon: "search",
                tone: "var(--cyan)",
              },
            ]}
          />

          <p className={styles.subTitle}>CrossCuttingSystemCard — a real system, and one with a long wrapping title</p>
          <CardGrid layout="equal" aria-label="Cross-cutting system card preview">
            <CrossCuttingSystemCard
              id="preview-ai-automation"
              title="AI & Automation"
              description="Saves time and answers customers at every stage, not just at the end. Applied where it removes real repetitive work, not for its own sake."
              icon="zap"
              tone="var(--pink)"
            />
            <CrossCuttingSystemCard
              id="preview-long-system"
              title="A cross-cutting system with a deliberately long title, to prove the heading wraps cleanly across lines"
              description="Preview-only placeholder for a system that runs across every stage of the growth journey."
              icon="wrench"
              tone="var(--domain-build)"
            />
          </CardGrid>

          <p className={styles.subTitle}>ConnectedSystemFlow — the five parts as one connected sequence (real content)</p>
          <ConnectedSystemFlow />

          <p className={styles.subTitle}>ProcessStepList — four real steps in source order (one coherent accent)</p>
          <ProcessStepList
            steps={[
              { order: 1, title: "Understand Your Goals", description: "We start by learning your business, your goals, and what's getting in the way, before talking about any service.", icon: "compass" },
              { order: 2, title: "Assess What You Already Have", description: "We look honestly at your current site, tools, and setup, so the plan builds on what's working rather than starting from scratch.", icon: "search" },
              { order: 3, title: "Identify Your Starting Point", description: "We work out where you actually are on the growth journey, and the smallest next step that moves you forward.", icon: "target" },
              { order: 4, title: "Build a Connected Plan", description: "We turn goals and gaps into a clear roadmap, scoped to your budget and timeline.", icon: "git-branch" },
            ]}
          />

          <p className={styles.subTitle}>
            DeliveryModelCard — shown in its real section below (Phase 2K), where its derived
            id=&quot;delivery-&lt;key&gt;&quot; is unique on the page.
          </p>

          <p className={styles.subTitle}>Page-jump nav — real internal section links (not tabs)</p>
          <nav aria-label="How it works sections (preview)" className={styles.row}>
            <LinkChip href="#main">Growth journey</LinkChip>
            <LinkChip href="#main">How it connects</LinkChip>
            <LinkChip href="#main">Our process</LinkChip>
            <LinkChip href="#main">Ways of working</LinkChip>
          </nav>
        </section>

        {/* 12c · Callouts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Callout tones (note by default, not an alert)</h2>
          <div className={styles.stack}>
            <Callout tone="neutral" title="Neutral note">
              A quiet aside for supporting context. Meaning is carried by the icon and copy, not colour.
            </Callout>
            <Callout tone="information" title="Information">
              Used on the case-studies hub to make clear the scenarios are illustrative examples, not real clients.
            </Callout>
            <Callout tone="warning" title="Worth checking first">
              A caution the reader should notice before acting — still a passive note, never a live alert.
            </Callout>
          </div>
        </section>

        {/* 13 · Form fields */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form-field surfaces &amp; focus</h2>
          <div className={styles.gridWide}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Your name</span>
              <input className={styles.control} type="text" placeholder="Jordan Miles" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>What do you sell?</span>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Choose one…
                </option>
                <option>Products</option>
                <option>Services</option>
                <option>Both</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email (error state)</span>
              <input
                className={`${styles.control} ${styles.controlError}`}
                type="email"
                defaultValue="not-an-email"
                aria-invalid="true"
                aria-describedby="preview-email-err"
              />
              <span id="preview-email-err" className={styles.fieldError}>
                Enter a valid email address.
              </span>
            </label>
          </div>
        </section>

        {/* 14 · Status states */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status states</h2>
          <div className={styles.gridWide}>
            {STATUSES.map((s) => (
              <div
                key={s.key}
                className={styles.note}
                style={{
                  ["--note-tint" as string]: `var(--v2-${s.key}-tint)`,
                  ["--note-ink" as string]: `var(--v2-${s.key})`,
                }}
              >
                <Icon name={s.icon} className={styles.noteIcon} />
                <span>
                  <strong>{s.label}.</strong> Colour on white and on its own tint both measure ≥ 4.5:1.
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 15 · Spacing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing &amp; section rhythm</h2>
          {[
            ["space-4 · 16", "16px"],
            ["space-6 · 24", "24px"],
            ["space-8 · 32", "32px"],
            ["space-12 · 48", "48px"],
            ["section-y-tight", "var(--section-y-tight)"],
            ["section-y", "var(--section-y)"],
          ].map(([label, w]) => (
            <div key={label} className={styles.spaceRow}>
              <span className={styles.spaceBar} style={{ width: w }} />
              <span className={styles.spaceLabel}>{label}</span>
            </div>
          ))}
        </section>

        {/* 16 · Phase 2K — homepage spine (real sections, real seed content) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phase 2K · Homepage spine</h2>

          <p className={styles.subTitle}>
            GrowthPlanPreview — a truthful STATIC structure (inputs → three ordering buckets), no
            fabricated plan, price, percentage or form control
          </p>
          <div className={styles.previewNarrow}>
            <GrowthPlanPreview />
          </div>

          <p className={styles.subTitle}>
            Homepage hero — labelled shell (never a second document H1). Real seed eyebrow, slogan,
            headline, support and both CTAs, plus the works-with rail
          </p>
          <div className={`theme-light ${styles.surfacePanel}`}>
            <span className={styles.cardEyebrow}>{hero.eyebrow}</span>
            <span className={styles.cardBody}>{hero.slogan}</span>
            <span className={styles.cardTitle}>
              {hero.headline.pre}
              {hero.headline.accent}
              {hero.headline.post}
            </span>
            <span className={styles.cardBody}>{hero.support}</span>
            <div className={styles.row}>
              <Button size="sm" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
                {hero.primaryCta.label}
              </Button>
              <Button variant="secondary" size="sm">
                {hero.secondaryCta.label}
              </Button>
            </div>
            <p className={styles.railPreviewLabel}>Works with the tools your business already uses.</p>
            <ul className={styles.railPreview} aria-label="Example tools (preview)">
              {hero.platforms.map((p) => (
                <li key={p.slug} className={styles.railPreviewItem}>
                  <BrandLogo slug={p.slug} name={p.name} />
                </li>
              ))}
            </ul>
            <p className={styles.cardBody}>Examples only. No partnership or endorsement implied.</p>
          </div>

          <p className={styles.subTitle}>HomepageProblemSection — the editorial verbatim, three static point cards</p>
          <HomepageProblemSection data={editorial} />

          <p className={styles.subTitle}>HomepageGoalRouterSection — every goal into the plan builder (id=goals)</p>
          <HomepageGoalRouterSection />

          <p className={styles.subTitle}>
            HomepageConnectedSystemSection — the connected flow + three onward bridge cards
            (id=how-it-connects, growth-journey / customer-journey / services)
          </p>
          <HomepageConnectedSystemSection />

          <p className={styles.subTitle}>
            DeliveryModelsExplainerSection — homepage configuration: alt surface, NO ownership strip,
            no per-card delivery fragment targets
          </p>
          <DeliveryModelsExplainerSection surface="alt" showOwnership={false} cardFragmentTargets={false} />

          <p className={styles.subTitle}>HomepageTrustSection — ownership + honest expectations merged (id=ownership, id=honest)</p>
          <HomepageTrustSection surface="light" />

          <p className={styles.subTitle}>HomepageLearningSection — the first three real guides (id=learn)</p>
          <HomepageLearningSection surface="alt" />
        </section>

        {/* 17 · Phase 2L — brand / ownership / connected-growth building blocks (composition-only,
            rendered without their route section ids so they don't collide with the blocks above) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phase 2L · Brand, ownership &amp; connected blocks</h2>

          <p className={styles.subTitle}>PrincipleCard — static positioning cards, incl. a long wrapping title</p>
          <CardGrid layout="equal" aria-label="Principle card preview">
            <PrincipleCard
              title="We understand before we sell"
              body="We learn your business, goals and current setup before recommending anything."
              icon="compass"
              tone="var(--domain-strategy)"
            />
            <PrincipleCard
              title="A deliberately long principle title, to prove the heading and body wrap cleanly across several lines without clipping"
              body="Preview-only placeholder body for a principle with a long heading, so the card layout can be checked at width."
              icon="link"
              tone="var(--domain-discover)"
            />
          </CardGrid>

          <p className={styles.subTitle}>OwnershipDetails — vault, build flow, guarantees + closing (real seed, no section root)</p>
          <OwnershipDetails data={ownership} />

          <p className={styles.subTitle}>HonestExpectationsPanel — standalone (no id here to avoid colliding with #honest above)</p>
          <HonestExpectationsPanel heading="Honest expectations" intro="The plain version." columnLevel={3} />

          <p className={styles.subTitle}>CustomerJourneyList — six illustrative steps as a vertical ordered list (no phone strip)</p>
          <CustomerJourneyList steps={journey} />

          <p className={styles.subTitle}>ConnectedExampleCard — static illustrative combination, incl. long wrapping content</p>
          <CardGrid layout="equal" aria-label="Connected example card preview">
            <ConnectedExampleCard
              title="Turn visitors into customers"
              summary="Improve the store, the tracking and the advertising together, so more of the people who arrive actually complete a purchase."
              goalHint="Sell more products"
              services={["Store & checkout", "Conversion", "Paid ads"]}
              tone="var(--pink)"
            />
            <ConnectedExampleCard
              title="A deliberately long connected-example title that must wrap cleanly across lines"
              summary="Preview-only placeholder summary describing a combination with a long title and several service labels, to check wrapping and chip flow at width."
              goalHint="Reach more people"
              services={["Short-form video", "Content", "Social ads", "Analytics", "Reporting"]}
              tone="var(--blue)"
            />
          </CardGrid>

          <p className={styles.subTitle}>ConnectedGrowthExamplesSection — the real illustrative-combination grid (id=examples)</p>
          <ConnectedGrowthExamplesSection surface="light" />
        </section>

        {/* 18 · Phase 2M — services hub + service-domain system (real seed/config; service cards
            use withFragmentTarget={false} so production service fragment ids don't leak here) */}
        {strategyConfig && strategyCategory && websitesCategory ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Phase 2M · Services system</h2>

            <p className={styles.subTitle}>ServiceCategoryCard — whole-card route with a real service count, plus a long-title case</p>
            <CardGrid layout="equal" aria-label="Service category card preview">
              <ServiceCategoryCard
                order={strategyCategory.order}
                title={strategyCategory.name}
                description={strategyCategory.intro}
                href={`/services/${strategyCategory.slug}`}
                icon={strategyCategory.icon}
                tone={strategyConfig.hue}
                serviceCount={svcCountByCategory.get(strategyCategory.slug) ?? 0}
              />
              <ServiceCategoryCard
                order={99}
                title="A deliberately long service-area name that must wrap cleanly across two or three lines"
                description="Preview-only placeholder intro for a service area with a long name and a long description, so the card layout and the service-count footer can be checked at width without clipping."
                href="#main"
                icon="layers"
                tone="var(--domain-operate)"
                serviceCount={1}
              />
            </CardGrid>

            <p className={styles.subTitle}>ServiceOfferingCard — with delivery badge, whatYouGet and example tools (no fragment id)</p>
            <CardGrid layout="equal" aria-label="Service offering card preview">
              {strategyServices.slice(0, 2).map((service) => (
                <ServiceOfferingCard
                  key={service.slug}
                  slug={service.slug}
                  title={service.name}
                  summary={strategyConfig.serviceCopy?.[service.slug] ?? service.plainDescription}
                  deliveryModel={service.deliveryModel}
                  whatYouGet={service.whatYouGet}
                  exampleTools={service.exampleTools}
                  categoryIcon={strategyCategory.icon}
                  categoryTone={strategyConfig.hue}
                  withFragmentTarget={false}
                />
              ))}
            </CardGrid>

            <p className={styles.subTitle}>ServiceOfferingCard — without example tools (the chips list is omitted)</p>
            {strategyServices[0] ? (
              <div className={styles.previewNarrow}>
                <ServiceOfferingCard
                  slug={strategyServices[0].slug}
                  title={strategyServices[0].name}
                  summary={strategyServices[0].plainDescription}
                  deliveryModel={strategyServices[0].deliveryModel}
                  whatYouGet={strategyServices[0].whatYouGet}
                  exampleTools={[]}
                  categoryIcon={strategyCategory.icon}
                  categoryTone={strategyConfig.hue}
                  withFragmentTarget={false}
                />
              </div>
            ) : null}

            <p className={styles.subTitle}>One complete cluster — heading (h3) + intro + a grid of ServiceOfferingCards</p>
            <h3 className={styles.subTitle}>{strategyConfig.clusters[1]?.heading}</h3>
            <p className={styles.subTitle}>{strategyConfig.clusters[1]?.intro}</p>
            <CardGrid layout="equal" aria-label="Cluster preview">
              {(strategyConfig.clusters[1]?.serviceSlugs ?? []).map((slug) => {
                const service = strategyServices.find((s) => s.slug === slug);
                if (!service) return null;
                return (
                  <ServiceOfferingCard
                    key={service.slug}
                    slug={service.slug}
                    title={service.name}
                    summary={strategyConfig.serviceCopy?.[service.slug] ?? service.plainDescription}
                    deliveryModel={service.deliveryModel}
                    whatYouGet={service.whatYouGet}
                    exampleTools={service.exampleTools}
                    categoryIcon={strategyCategory.icon}
                    categoryTone={strategyConfig.hue}
                    withFragmentTarget={false}
                  />
                );
              })}
            </CardGrid>

            <p className={styles.subTitle}>One service-outcome card treatment</p>
            {strategyConfig.outcomes[0] ? (
              <div className={styles.previewNarrow}>
                <Card as="article" variant="outlined">
                  <IconTile color="var(--v2-domain-strategy-ink)" size="md">
                    <Icon name={strategyConfig.outcomes[0].icon} />
                  </IconTile>
                  <h3 className={styles.cardTitle}>{strategyConfig.outcomes[0].title}</h3>
                  <span className={styles.cardBody}>{strategyConfig.outcomes[0].body}</span>
                </Card>
              </div>
            ) : null}

            <p className={styles.subTitle}>ServiceConnectionList — the current area first, then each connectsTo</p>
            <ServiceConnectionList
              categoryTitle={strategyCategory.name}
              categoryDescription={strategyConfig.definition}
              categoryIcon={strategyCategory.icon}
              categoryTone={strategyConfig.hue}
              connectsTo={strategyConfig.connectsTo}
            />

            <p className={styles.subTitle}>Next-domain card (DomainCard) + service page-jump navigation</p>
            <div className={styles.previewNarrow}>
              <DomainCard
                title={strategyConfig.next.name}
                description={websitesCategory.intro}
                href={`/services/${strategyConfig.next.slug}`}
                icon={websitesCategory.icon}
                tone={strategyConfig.next.hue}
                eyebrow="Next in the journey"
              />
            </div>
            <nav aria-label="Service area sections (preview)" className={styles.row}>
              <LinkChip href="#main">Why it matters</LinkChip>
              <LinkChip href="#main">Services included</LinkChip>
              <LinkChip href="#main">How it connects</LinkChip>
              <LinkChip href="#main">When this helps</LinkChip>
              <LinkChip href="#main">What comes next</LinkChip>
            </nav>
          </section>
        ) : null}

        {/* 19 · Phase 2N — pricing & quoting (real exported pricing content; no fake price, package,
            discount, delivery model, FAQ, urgency or proof). */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phase 2N · Pricing &amp; quoting</h2>

          <p className={styles.subTitle}>PricingFactorCard — a quote factor, plus a long-copy case</p>
          <CardGrid layout="equal" aria-label="Pricing factor cards (preview)">
            <PricingFactorCard
              title={pricingFactors[0].title}
              body={pricingFactors[0].blurb}
              icon={pricingFactors[0].icon}
              tone={pricingFactors[0].tone}
            />
            <PricingFactorCard
              title={longFactor.title}
              body={longFactor.blurb}
              icon={longFactor.icon}
              tone={longFactor.tone}
            />
          </CardGrid>

          <p className={styles.subTitle}>PricingDeliveryCard — all four ways of working (exact cost notes)</p>
          <CardGrid layout="equal" aria-label="Pricing delivery cards (preview)">
            {deliveryModels.map((model) => (
              <PricingDeliveryCard key={model.key} modelKey={model.key} tagline={model.tagline} />
            ))}
          </CardGrid>

          <p className={styles.subTitle}>EngagementShapeCard — the three shapes (quoted to scope)</p>
          <CardGrid layout="equal" aria-label="Engagement shape cards (preview)">
            {pricingEngagementShapes.map((shape) => (
              <EngagementShapeCard
                key={shape.title}
                title={shape.title}
                body={shape.blurb}
                note={shape.note}
                icon={shape.icon}
                tone={shape.tone}
              />
            ))}
          </CardGrid>

          <p className={styles.subTitle}>QuoteProcessList — the four steps to a written quote</p>
          <QuoteProcessList steps={pricingQuoteSteps} />

          <p className={styles.subTitle}>PricingFaqList — the five pricing questions (always visible)</p>
          <PricingFaqList faqs={pricingFaqs} />

          <p className={styles.subTitle}>Pricing page-jump navigation</p>
          <nav aria-label="Pricing sections (preview)" className={styles.row}>
            <LinkChip href="#main">Why we quote</LinkChip>
            <LinkChip href="#main">What shapes a quote</LinkChip>
            <LinkChip href="#main">Ways of working</LinkChip>
            <LinkChip href="#main">Engagement shapes</LinkChip>
            <LinkChip href="#main">Getting a price</LinkChip>
            <LinkChip href="#main">Pricing questions</LinkChip>
          </nav>
        </section>

        {/* 20 · Phase 2O — contact experience (real seed content; no fake enquiry, success delivery,
            response time, contact channel, office or phone). ContactForm itself is previewed at
            /contact to avoid duplicate production ids; its visual sub-blocks are shown here. */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phase 2O · Contact experience</h2>

          <p className={styles.subTitle}>Trust points — flat IconTiles, mapped V2 tones</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-4)" }}>
            {contactTrustPoints.map((t) => (
              <li key={t.label} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <IconTile color={t.tone} size="sm">
                  <Icon name={t.icon} />
                </IconTile>
                <span className={styles.cardBody}>{t.label}</span>
              </li>
            ))}
          </ul>

          <p className={styles.subTitle}>ProcessStepList — the three contact steps</p>
          <ProcessStepList
            steps={contactProcessSteps.map((s) => ({
              order: s.order,
              title: s.title,
              description: s.body,
              icon: s.icon,
            }))}
          />

          <p className={styles.subTitle}>ContactPathCard — email (mailto) and growth plan</p>
          <CardGrid layout="equal" aria-label="Contact paths (preview)">
            {contactAlternativePaths.map((p) => (
              <ContactPathCard
                key={p.title}
                title={p.title}
                body={p.body}
                href={p.href}
                icon={p.icon}
                tone={p.tone}
                external={p.external}
              />
            ))}
          </CardGrid>

          <p className={styles.subTitle}>V2 form controls, long error text, success + delivery-unavailable panels</p>
          <ContactPreviewDemo />
        </section>

        {/* 21 · Phase 2P — growth plan builder experience (real components; the full PlanBuilder is
            previewed at /growth-plan to avoid duplicate production ids. Its primitives, the plan-include
            cards and the deterministic result view are shown here with preview ids / an illustrative
            fixture). */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phase 2P · Growth plan builder</h2>

          <p className={styles.subTitle}>Stepper — four steps, current marked, completed shown with a check + status word</p>
          <Stepper
            steps={["Business", "Goal", "Setup", "How we'd work"]}
            current={1}
            ariaLabel="Growth plan steps (preview)"
          />

          <p className={styles.subTitle}>ProgressChecklist — explicit status words (Done / In progress / To do)</p>
          <div className={styles.previewNarrow}>
            <ProgressChecklist
              title="Your plan is taking shape"
              items={[
                { label: "Business", state: "done" },
                { label: "Goal", state: "current" },
                { label: "Setup", state: "pending" },
                { label: "How we'd work", state: "pending" },
              ]}
              note="Your information is safe. We'll never share your details."
            />
          </div>

          <p className={styles.subTitle}>
            OptionCards (selected + error), the V2 follow-up controls, and the review-request success and
            delivery-unavailable panels
          </p>
          <GrowthPlanPreviewDemo />

          <p className={styles.subTitle}>PlanIncludeCard — what a plan can include (six illustrative items)</p>
          <CardGrid layout="equal" aria-label="Plan include cards (preview)">
            {growthPlanIncludes.map((item) => (
              <PlanIncludeCard key={item.title} title={item.title} body={item.body} icon={item.icon} tone={item.tone} />
            ))}
          </CardGrid>

          <p className={styles.subTitle}>
            PlanReveal — the deterministic result view on flat V2 cards (illustrative fixture; every
            section shown, with the truthful reusable-model framing and the example-tools disclaimer)
          </p>
          <div className={`theme-light-alt ${styles.surfacePanel}`}>
            <PlanReveal result={PLAN_REVEAL_PREVIEW} />
          </div>
        </section>
      </div>
    </main>
  );
}
