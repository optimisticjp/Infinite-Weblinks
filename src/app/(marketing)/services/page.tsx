import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServiceCategories, getServices } from "@/lib/content";
import { getServiceDomainConfig } from "@/lib/services/domains";

/**
 * /services — the router of the sixteen service domains, now fully on the Constellation kit.
 * The hero H1 is server text (LCP); below it every domain is a hue-tinted bento tile that
 * links straight to its own page (/services/<category>), coloured in the SAME domain hue that
 * recolours the destination, so the colour itself is wayfinding. No catalogue of seventy
 * services here — those fold into each domain page as anchored blocks.
 */
export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Everything Infinite Weblinks can build and run for you, grouped the way you actually need it. Sixteen connected domains. Pick one, or build a plan and we'll sequence the right ones for you.",
  path: "/services",
});

export default async function ServicesIndexPage() {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);
  const countByCategory = new Map<string, number>();
  for (const s of services) {
    countByCategory.set(s.categorySlug, (countByCategory.get(s.categorySlug) ?? 0) + 1);
  }

  // Each card is tinted in its destination domain page's hue (falling back to the category's
  // own accent), so the map colour-matches the page it opens.
  const hueFor = (slug: string, fallback: string) =>
    getServiceDomainConfig(slug)?.hue ?? fallback;

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Service domains",
          categories.map((c) => ({ name: c.name, path: `/services/${c.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <CosmicPageHero
        id="services-hero"
        breadcrumbs={[{ name: "Services" }]}
        eyebrow="The services constellation"
        title={
          <>
            Everything your business needs, <span className="iw-gradient-word">connected</span> around
            your goals
          </>
        }
        lead="Sixteen areas of work, grouped the way you actually need them. Each is its own page, and every service inside shows who does the work. Pick a domain, or build a plan and we'll sequence the right ones for you."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#service-domains" variant="ghost" size="lg">
              See all domains
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--violet)" size={128} emphasis="bright">
              <Icon name="link" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="service-domains"
        eyebrow="The full map"
        title={
          <>
            Sixteen connected <span className="iw-gradient-word">domains</span>
          </>
        }
        lead="On their own each one helps. Sequenced around your goals, they compound. Open any domain to see exactly what's inside and how we'd deliver it."
        align="start"
      >
        <BentoGrid>
          {categories.map((category, i) => {
            const count = countByCategory.get(category.slug) ?? 0;
            return (
              <BentoCard
                key={category.slug}
                href={`/services/${category.slug}`}
                hue={hueFor(category.slug, category.color)}
                icon={category.icon}
                index={String(i + 1).padStart(2, "0")}
                eyebrow={count > 0 ? `${count} service${count === 1 ? "" : "s"}` : undefined}
                title={category.name}
                blurb={category.intro}
                variant={i === 0 ? "featured" : "medium"}
              />
            );
          })}
        </BentoGrid>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
