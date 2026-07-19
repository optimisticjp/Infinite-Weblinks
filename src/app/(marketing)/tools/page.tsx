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
import { getToolCategories, getTools } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Tools",
  description:
    "The tool areas we help you choose, configure and connect, from websites and ecommerce to email, analytics and automation. More tools is not better: we set up a few that talk to each other cleanly, always in your name.",
  path: "/tools",
});

export default async function ToolsIndexPage() {
  const [categories, tools] = await Promise.all([getToolCategories(), getTools()]);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Tools",
          tools.map((t) => ({ name: t.name, path: `/tools/${t.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
        ])}
      />

      <CosmicPageHero
        id="tools-hero"
        breadcrumbs={[{ name: "Tools" }]}
        eyebrow="Tools"
        hue="var(--domain-build)"
        title={
          <>
            Tools we help you choose, configure and <span className="iw-gradient-word">connect</span>
          </>
        }
        lead="More tools is not better. We'd rather set up a few that talk to each other cleanly than a dozen that don't, and whatever we set up sits in your name. Here are the areas we help with."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#tool-areas" variant="ghost" size="lg">
              Browse the areas
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--domain-build)" size={128} emphasis="bright">
              <Icon name="wrench" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="tool-areas"
        eyebrow="The tool areas"
        title="Ten areas, connected around your goals"
        lead="Each area is a category of tools we help you pick and join up, not a product we sell. Open one to see what it does, when you might not need it yet, and example tools we can connect."
        align="start"
      >
        <BentoGrid>
          {tools.map((tool, i) => {
            const category = categoryBySlug.get(tool.categorySlug);
            return (
              <BentoCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                hue={category?.color ?? "var(--domain-build)"}
                icon={category?.icon ?? "wrench"}
                index={String(i + 1).padStart(2, "0")}
                title={tool.name}
                blurb={tool.whatItDoes}
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
