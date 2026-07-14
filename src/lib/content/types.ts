/**
 * Content types for the homepage opening (Milestones M3–M4).
 *
 * These mirror the initial CMS slice in data-model.md. Until a Sanity project is
 * provisioned, the app renders from local seed data (see ./seed.ts) that carries the
 * *approved* copy from the locked brief; getters swap to Sanity when configured.
 */

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
}

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
  /** Top-level destination (also the mega-menu's "overview" link). */
  href: string;
  megaMenu?: MegaMenu;
}

export interface SiteNav {
  primary: NavItem[];
  ctas: Cta[];
}

/** A connected area/node in the hero universe. `color` is a CSS custom property. */
export interface HeroArea {
  key: string;
  label: string;
  color: string;
  /** Lucide icon name. */
  icon: string;
}

export interface Headline {
  pre: string;
  accent: string;
  post: string;
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
}

export interface EditorialSection {
  eyebrow: string;
  heading: Headline;
  body: string[];
  points?: { title: string; body: string; color: string; icon: string }[];
}

export type SocialPlatform = "Facebook" | "Instagram" | "YouTube" | "Pinterest";

export interface SocialLink {
  platform: SocialPlatform;
  /** Hidden until a valid URL exists (brief §23). */
  url?: string;
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
