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
  "draft" | "placeholder" | "approvalRequired" | "verified" | "readyToPublish";

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

/* ------ proof (placeholder-gated — hidden until verified AND fully verified for publication) ------ */

/**
 * Publication-verification metadata shared by every kind of proof (case study / testimonial /
 * example). A proof item is publishable ONLY when it has a renderable status AND every one of these is
 * satisfied. This is a second, independent gate on top of the render status — so a status flipped to
 * "verified" without genuine consent/approval still stays hidden.
 */
export interface ProofVerification {
  /** The client/subject has confirmed consent to be shown publicly. */
  consentConfirmed: boolean;
  /** Their identity / name / logo use is approved. */
  identityApproved: boolean;
  /** Every claim, quote and figure has been verified against real evidence. */
  claimsVerified: boolean;
  /** The owner has approved this specific item for publication. */
  approvedForPublication: boolean;
  /** INTERNAL reference to where the consent/evidence lives (e.g. a ticket id) — NEVER the
   *  confidential evidence itself and NEVER visitor PII stored in the repo. Must be non-empty. */
  evidenceReference: string;
}

/** Any proof item: a statused record that may carry publication-verification metadata. */
export type ProofItem = Statused & { verification?: ProofVerification };

export interface CaseStudy extends Statused {
  slug: string;
  title: string;
  client?: string;
  summary: string;
  verification?: ProofVerification;
}
export interface Testimonial extends Statused {
  quote: string;
  attribution?: string;
  rating?: number;
  verification?: ProofVerification;
}
export interface Example extends Statused {
  slug: string;
  title: string;
  summary: string;
  verification?: ProofVerification;
}

/**
 * The single source of truth for whether a proof item may render publicly. It requires BOTH a
 * renderable status AND complete, affirmative verification metadata (all flags true and a non-empty
 * evidence reference). Used by every proof getter, in seed AND live-Sanity modes, so the gate is
 * identical everywhere. A placeholder, an unapproved item, or one missing any flag stays hidden.
 */
export function isPublishableProof(item: ProofItem): boolean {
  if (!isRenderable(item)) return false;
  const v = item.verification;
  return Boolean(
    v &&
    v.consentConfirmed === true &&
    v.identityApproved === true &&
    v.claimsVerified === true &&
    v.approvedForPublication === true &&
    typeof v.evidenceReference === "string" &&
    v.evidenceReference.trim().length > 0,
  );
}

/* ------ legal ------ */
export interface LegalBlock {
  heading?: string;
  paragraphs: string[];
}
/**
 * Whether a legal page's WORDING has had professional legal review. This is DELIBERATELY separate
 * from `ContentStatus` (which only governs whether a page renders): a page can be `status:"verified"`
 * (renderable, structurally accurate to the stack) while its legal wording is still `"draft"` and
 * requires a qualified professional's review. `"professionallyReviewed"` must ONLY ever be set with
 * owner-supplied confirmation — never inferred from the render status.
 */
export type LegalReviewStatus = "draft" | "professionallyReviewed";
export interface LegalPage extends Statused {
  slug: string;
  title: string;
  updated: string;
  /** Explicit legal-review state of the WORDING (not the render gate). */
  legalReviewStatus: LegalReviewStatus;
  /** Optional: when the wording was professionally reviewed (owner-supplied). */
  reviewedAt?: string;
  /** Optional: an internal reference for the review (owner-supplied) — never personal data. */
  reviewReference?: string;
  /** Visible editorial notice shown while the wording is a draft. */
  reviewNote?: string;
  intro: string;
  blocks: LegalBlock[];
}

/* ------------------------------------------------------------------ homepage sections */

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

/**
 * Case scenario — a worked, illustrative example of how a connected system fits together for
 * a kind of business. NOT a real client: every scenario is clearly labelled an example, and
 * carries no client name, logo, testimonial, or invented numeric result. Results are stated
 * only qualitatively. Real, verified client case studies use the status-gated `CaseStudy`
 * type instead; when one exists it renders unlabelled alongside these.
 */
export interface CaseScenario {
  slug: string;
  /** The scenario title, framed as a situation not a client. */
  title: string;
  /** Who this pattern is for (e.g. "A local service business"). */
  forWho: string;
  /** One-line summary for the index card. */
  summary: string;
  /** Wayfinding hue token, e.g. "var(--domain-convert)". */
  hue: string;
  /** The starting situation / blocker. */
  challenge: string;
  /** The connected parts used, each tied to a domain hue (the "one system" story). */
  approach: { label: string; detail: string; hue: string; icon: string }[];
  /** What the work involved, as plain points. */
  work: string[];
  /** The qualitative outcome (no invented figures). */
  outcome: string;
  /** A qualitative result marker for the StatCard (e.g. { label: "Repeat orders", value: "Compounding" }). */
  result: { label: string; value: string };
  /** Service category slugs the scenario touches, for linking to the domain pages. */
  categorySlugs: string[];
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
