/**
 * Content types for the Infinite Weblinks site.
 *
 * These mirror the CMS model in data-model.md. Until a Sanity project is provisioned,
 * the app renders from typed local seed data (see ./data/*) that carries the *approved*
 * taxonomy and plain-English educational copy grounded in the Growth Guide — no invented
 * metrics, testimonials, client names or partnership claims. Getters apply the same
 * public status gate in both the seed and (future) Sanity paths.
 */

/* ------------------------------------------------------------------ status */

export type ContentStatus =
  | "draft"
  | "placeholder"
  | "approvalRequired"
  | "verified"
  | "readyToPublish";

/** Only these statuses ever render publicly (brief §14). */
export const RENDERABLE_STATUSES: ContentStatus[] = ["verified", "readyToPublish"];

export interface Statused {
  status: ContentStatus;
  /** When true, excluded from sitemap/indexing even if renderable. */
  noindex?: boolean;
}

export function isRenderable(item: Statused): boolean {
  return RENDERABLE_STATUSES.includes(item.status);
}

/* ------------------------------------------------------------------ shared */

export type CtaStyle = "primary" | "secondary" | "text";
export interface Cta {
  label: string;
  route: string;
  style: CtaStyle;
}

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  /** Optional icon name (see primitives/Icon) — used by the icon-led mega-menu. */
  icon?: string;
}

export interface Headline {
  pre: string;
  accent: string;
  post: string;
}

/* ------------------------------------------------------------------ chrome */

export interface MegaMenuColumn {
  heading: string;
  items: NavLink[];
}
export interface MegaMenuPromo {
  heading: string;
  body: string;
  cta: Cta;
}
export interface MegaMenu {
  title: string;
  columns: MegaMenuColumn[];
  promo?: MegaMenuPromo;
}
export interface NavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenu;
}
export interface SiteNav {
  primary: NavItem[];
  ctas: Cta[];
}

export type SocialPlatform = "Facebook" | "Instagram" | "YouTube" | "Pinterest";
export interface SocialLink {
  platform: SocialPlatform;
  url?: string; // hidden until a valid URL exists (brief §23)
}
export interface FooterContent {
  supportEmail: string;
  tagline: string;
  columns: { heading: string; links: NavLink[] }[];
  legal: NavLink[];
  social: SocialLink[];
}
export interface SiteChrome {
  nav: SiteNav;
  footer: FooterContent;
}

/* ------------------------------------------------------------------ hero */

export interface HeroArea {
  key: string;
  label: string;
  color: string;
  icon: string;
}
export interface HeroContent {
  eyebrow: string;
  slogan: string;
  headline: Headline;
  support: string;
  reassurance: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  areas: HeroArea[];
  /**
   * Example platforms shown in the hero rail ("the tools your business already uses").
   * Rendered as real, locally-stored brand logos (see public/brand-logos) for an
   * illustrative "works with" display — never presented as partners, clients or
   * endorsements. `slug` maps to /public/brand-logos/<slug>.svg.
   */
  platforms: { name: string; slug: string }[];
}

/* ------------------------------------------------------------------ taxonomy */

export type DeliveryModelKey = "we-do" | "we-expert" | "we-run" | "you-run";
export interface DeliveryModel {
  key: DeliveryModelKey;
  name: string; // locked exact name
  tagline: string;
  description: string;
}

export interface GrowthStage extends Statused {
  order: number; // 1..8
  slug: string;
  name: string; // locked exact name
  summary: string;
  whatHappens: string;
  outcome: string;
  color: string;
  icon: string;
  serviceSlugs?: string[];
}

export interface CrossCuttingSystem {
  key: string;
  name: string; // locked exact name
  description: string;
  color: string;
  icon: string;
}

export interface Goal extends Statused {
  slug: string;
  title: string;
  audienceHint?: string;
  whatYouNeed: string;
  howWeHelp: string;
  outcome: string;
  exampleTools: string[];
  stageSlugs: string[];
  serviceSlugs: string[];
  icon: string;
  color: string;
}

export interface BusinessType extends Statused {
  slug: string;
  name: string;
  summary: string;
  description: string;
  goalSlugs: string[];
  roadmapSlug?: string;
  icon: string;
  color: string;
}

export interface StartingPoint extends Statused {
  slug: string;
  label: string;
  situation: string;
  recommendation: string;
  recommendedStageSlug: string;
  cta: Cta;
  icon: string;
  color: string;
}

export interface ServiceCategory extends Statused {
  slug: string;
  name: string;
  intro: string;
  order: number;
  icon: string;
  color: string;
}

export interface Service extends Statused {
  slug: string;
  name: string;
  categorySlug: string;
  deliveryModel: DeliveryModelKey;
  plainDescription: string;
  whatYouGet: string[];
  relatedToolSlugs: string[];
  goalSlugs: string[];
  stageSlugs: string[];
  businessTypeSlugs: string[];
  exampleTools: string[];
  outcome?: string;
}

export interface ToolCategory extends Statused {
  slug: string;
  name: string;
  intro: string;
  order: number;
  icon: string;
  color: string;
}

export interface Tool extends Statused {
  slug: string;
  name: string; // the tool category / example area we help with
  categorySlug: string;
  whatItDoes: string;
  whyUseful: string;
  connectsWith: string[];
  suitsBusinessTypeSlugs: string[];
  whenNotNeeded: string;
  relatedServiceSlugs: string[];
  stageSlugs: string[];
  exampleTools: string[]; // named example products (labelled "tools we can connect")
}

export interface RoadmapPhase {
  title: string;
  summary: string;
  stageSlug: string;
  serviceSlugs: string[];
  goalSlugs?: string[];
}
export interface Roadmap extends Statused {
  slug: string;
  name: string;
  forBusinessTypeSlug: string;
  intro: string;
  phases: RoadmapPhase[];
}

export interface ProcessStep {
  order: number;
  title: string;
  description: string;
  icon: string;
}

export interface ValueProp {
  title: string;
  body: string;
  icon: string;
  color: string;
}

export interface Faq extends Statused {
  slug: string;
  question: string;
  answer: string;
  category?: string;
}

export interface LearnArticle extends Statused {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  readMinutes?: number;
  relatedGoalSlugs?: string[];
  publishedAt?: string;
}

/* ------ proof (placeholder-gated — hidden until verified) ------ */
export interface CaseStudy extends Statused {
  slug: string;
  title: string;
  client?: string;
  summary: string;
}
export interface Testimonial extends Statused {
  quote: string;
  attribution?: string;
  rating?: number;
}
export interface Example extends Statused {
  slug: string;
  title: string;
  summary: string;
}

/* ------ trust / how-we-work (interim trust layer, review §3/§5/§14; brief §P1-01/§P3-05) ------
   An HONEST interim trust device that stands in for social proof the business does not yet
   have. It states method, standards and an ownership promise — NEVER a fabricated client,
   logo, testimonial, metric or partnership. Code-authoritative (brand-locked), like the hero
   and editorial content, so it always renders and is never confused with gated proof. */
export interface TrustStep {
  title: string;
  body: string;
}
export interface TrustStandard {
  title: string;
  body: string;
  icon: string;
  color: string;
}
export interface TrustNarrative {
  eyebrow: string;
  title: string;
  lead: string;
  steps: TrustStep[];
  standards: TrustStandard[];
  /** Honest note that real, verified proof will appear here once it exists. */
  reassurance: string;
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
}

/* ------ legal ------ */
export interface LegalBlock {
  heading?: string;
  paragraphs: string[];
}
export interface LegalPage extends Statused {
  slug: string;
  title: string;
  updated: string;
  reviewNote?: string;
  intro: string;
  blocks: LegalBlock[];
}

/* ------------------------------------------------------------------ homepage sections */

export type SectionType =
  | "editorialStatement"
  | "growthJourney"
  | "goalExplorer"
  | "startingPointSelector"
  | "servicesExplorer"
  | "toolUniverse"
  | "deliveryModels"
  | "processSteps"
  | "whyInfiniteWeblinks"
  | "connectedSystem"
  | "customerJourney"
  | "connectedExamples"
  | "accountOwnership"
  | "trustMethodology"
  | "caseStudyShowcase"
  | "testimonialWall"
  | "learningResources"
  | "faqSection"
  | "finalCtaBanner";

export interface SectionConfig {
  type: SectionType;
  enabled: boolean;
  anchorId?: string;
}

export interface EditorialSection {
  eyebrow: string;
  heading: Headline;
  body: string[];
  points?: { title: string; body: string; color: string; icon: string }[];
}

/* ------ customer journey (ref 15) — follow one customer along a connected path ------
   Code-authoritative structural content. Screens are stylised, generic interface states
   with NO fabricated brand, client, quote or metric (brief §14). */
export interface CustomerJourneyScreen {
  kind: "social" | "store" | "product" | "message" | "confirmation" | "loyalty";
  heading: string;
  lines?: string[];
}
export interface CustomerJourneyStep {
  order: number;
  phase: string; // "Discover", "Visit Store", "Take Action", ...
  caption: string;
  color: string;
  screen: CustomerJourneyScreen;
}

/* ------ connected examples (ref 16) — simple combinations that work together ------ */
export interface ConnectedExample {
  slug: string;
  title: string;
  summary: string;
  goalHint: string;
  services: string[]; // plain-text chip labels ("tools we can connect")
  color: string;
  theme: "dark" | "band";
  featured?: boolean;
}

/* ------ account ownership (ref 13) — you own your digital world ------ */
export interface OwnershipAsset {
  label: string;
  icon: string;
}
export interface OwnershipFlowStep {
  label: string;
  icon: string;
  color: string;
}
export interface OwnershipGuarantee {
  title: string;
  body: string;
  icon: string;
  color: string;
}
export interface AccountOwnership {
  eyebrow: string;
  heading: Headline;
  body: string;
  vaultLabel: string;
  assets: OwnershipAsset[];
  flow: OwnershipFlowStep[];
  guarantees: OwnershipGuarantee[];
  closing: Headline;
  primaryCta: Cta;
  secondaryCta: Cta;
}

/* ------ growth troubleshooter (ref 06) — "tell us what is not working" ------
   Code-authoritative educational guidance. No fabricated metrics or client results. */
export interface TroubleshooterReason {
  title: string;
  body: string;
  icon: string;
}
export interface TroubleshooterProblem {
  slug: string;
  label: string;
  icon: string;
  color: string;
  /** Plain-English explanation of why this usually happens. */
  explanation: string;
  reasons: TroubleshooterReason[];
  checks: string[];
  focusFirst: string;
  recommendedStageSlug: string;
}
