import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Callout } from "@/components/primitives/Callout";
import { ServiceCategoryCard } from "@/components/cards/ServiceCategoryCard";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServiceCategories, getServices } from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";
import styles from "./services.module.css";

/**
 * /services — the V2 light-first hub for the sixteen service areas. PageHeader (server H1 = LCP
 * text) → a grid of ServiceCategoryCards that each route into their own category page, with the
 * real renderable service count → the single reserved dark final CTA. No cosmic hero, starfield,
 * GlowButton, NodeOrb, BentoCard or gradient word. Every category name/intro/icon/order comes from
 * the ServiceCategory; the domain config only tints the wayfinding. Server Component.
 */
export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Everything Infinite Weblinks can build and run for you, grouped the way you actually need it. Sixteen connected service areas. Pick one, or build a plan and we'll sequence the right ones for you.",
  path: "/services",
});

export default async function ServicesIndexPage() {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);
  const countByCategory = new Map<string, number>();
  for (const s of services) {
    countByCategory.set(s.categorySlug, (countByCategory.get(s.categorySlug) ?? 0) + 1);
  }

  // The card is tinted in its destination domain page's tone (falling back to the category's own
  // accent). The public name, intro, icon and order still come from the category.
  const toneFor = (slug: string, fallback: string) => getServiceDomainConfig(slug)?.hue ?? fallback;

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Service areas",
          categories.map((c) => ({ name: c.name, path: `/services/${c.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHeader
        id="services-hero"
        breadcrumbs={[{ name: "Services" }]}
        eyebrow="Services"
        title="Everything your business needs, connected around your goals"
        lead="Sixteen areas of work, grouped the way you actually need them. Each is its own page, and every service inside shows who does the work. Pick a domain, or build a plan and we'll sequence the right ones for you."
        actions={
          <>
            <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#service-domains" variant="secondary" size="lg">
              See all service areas
            </Button>
          </>
        }
        trustNote="Every service shows who does the work."
      />

      <SectionShell
        surface="alt"
        id="service-domains"
        eyebrow="The full map"
        title="Sixteen connected service areas"
        lead="On their own each one helps. Sequenced around your goals, they compound. Open any area to see exactly what's inside and how we'd deliver it."
        align="start"
      >
        <Callout tone="information" className={styles.note}>
          You don&apos;t need to choose everything. Build a plan and we&apos;ll sequence the service
          areas that fit your goal, in the right order.
        </Callout>

        <CardGrid layout="equal" aria-label="Service areas">
          {categories.map((category, i) => (
            <ServiceCategoryCard
              key={category.slug}
              order={i + 1}
              title={category.name}
              description={category.intro}
              href={`/services/${category.slug}`}
              icon={category.icon}
              tone={toneFor(category.slug, category.color)}
              serviceCount={countByCategory.get(category.slug) ?? 0}
            />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Not sure which service area you need first?"
        lead="That's what the plan is for. Tell us your goal and where you are, and we'll map the smallest next step, then the ones that follow."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/how-it-works", label: "See how it all works" }}
      />
    </>
  );
}
