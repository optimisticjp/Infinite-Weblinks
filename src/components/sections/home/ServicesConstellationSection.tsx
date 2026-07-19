import { ArrowRight, LayoutGrid } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { ConstellationLayout, type ConstellationItem } from "@/components/viz/ConstellationLayout";
import { GlowButton } from "@/components/primitives/GlowButton";
import styles from "./ServicesConstellationSection.module.css";

/**
 * ServicesConstellationSection — the service router as an interactive constellation. Seven
 * service worlds orbit a central card; selecting one swaps the card to show what's inside and
 * a link into that part of the services catalogue. Grouped from the real service categories.
 */
const WORLDS: ConstellationItem[] = [
  {
    key: "strategy",
    label: "Strategy",
    icon: "compass",
    color: "var(--domain-strategy)",
    title: "Plan the right moves first",
    blurb: "Before anything gets built, we work out the goal and the order to do things in.",
    items: ["Discovery workshop", "Website and SEO audits", "Brand strategy"],
    href: "/services/strategy-discovery",
    cta: "Explore strategy",
  },
  {
    key: "build",
    label: "Build and launch",
    icon: "monitor",
    color: "var(--domain-build)",
    title: "Websites and stores that convert",
    blurb: "The foundation everything else sits on, built to be found and to sell.",
    items: ["Website design", "Shopify and store builds", "Landing pages", "CRO"],
    href: "/services/websites-development",
    cta: "Explore build and launch",
  },
  {
    key: "discover",
    label: "Get discovered",
    icon: "search",
    color: "var(--domain-discover)",
    title: "The right people find you",
    blurb: "Search, ads and social that bring the people most likely to buy.",
    items: ["SEO and content", "Paid ads", "Social media"],
    href: "/services/seo-content",
    cta: "Explore visibility",
  },
  {
    key: "convert",
    label: "Convert and engage",
    icon: "target",
    color: "var(--domain-convert)",
    title: "Turn interest into sales",
    blurb: "The steps that move a visitor from curious to customer, then keep them close.",
    items: ["Funnels and conversion", "Email, SMS and CRM", "Courses and memberships"],
    href: "/services/funnels-conversion",
    cta: "Explore conversion",
  },
  {
    key: "operate",
    label: "Deliver and operate",
    icon: "workflow",
    color: "var(--domain-operate)",
    title: "Run it smoothly after the sale",
    blurb: "The systems that keep customers happy once they have bought.",
    items: ["Ecommerce operations", "Support systems", "Marketplaces"],
    href: "/services/ecommerce-ops-delivery",
    cta: "Explore operations",
  },
  {
    key: "retain",
    label: "Retain and grow",
    icon: "heart",
    color: "var(--domain-retain)",
    title: "Bring customers back",
    blurb: "The work that grows what each customer is worth over time.",
    items: ["Loyalty programs", "Reviews", "Referrals and affiliates"],
    href: "/services/retention-loyalty-advocacy",
    cta: "Explore retention",
  },
  {
    key: "ai",
    label: "AI and data",
    icon: "zap",
    color: "var(--domain-ai)",
    title: "Save time and decide with data",
    blurb: "Automation that removes real busywork, and clean tracking behind every decision.",
    items: ["AI and automation", "Analytics and dashboards", "Tracking setup"],
    href: "/services/ai-automation",
    cta: "Explore AI and data",
  },
];

export function ServicesConstellationSection() {
  return (
    <SectionShell
      id="services"
      align="start"
      eyebrow="Services, connected"
      title={
        <>
          Everything your business needs, <span className="iw-gradient-word">connected</span> around
          your goals.
        </>
      }
      lead="Pick one service or connect them all. Choose a world to see what's inside, and we plan the order so each part strengthens the next."
    >
      <ConstellationLayout items={WORLDS} ariaLabel="Service worlds" />

      <div className={styles.ctas}>
        <GlowButton href="/services" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
          Explore services
        </GlowButton>
        <GlowButton
          href="/services"
          variant="ghost"
          size="lg"
          iconLeft={<LayoutGrid size={18} aria-hidden="true" />}
        >
          View all services
        </GlowButton>
      </div>
    </SectionShell>
  );
}
