import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/primitives/Button";
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

      <PageHeader
        id="tools-hero"
        breadcrumbs={[{ name: "Tools" }]}
        eyebrow="Tools"
        title="Tools we help you choose, configure and connect"
        lead="More tools is not better. We'd rather set up a few that talk to each other cleanly than a dozen that don't. Here are the areas we help with."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#tool-areas" variant="secondary">
              Browse the areas
            </Button>
          </>
        }
        trustNote="Accounts and billing stay in your name."
      />

      <SectionShell
        surface="alt"
        id="tool-areas"
        eyebrow="The tool areas"
        title="Ten areas, connected around your goals"
        lead="Each area is a category of tools we help you pick and join up, not a product we sell. Open one to see what it does, when you might not need it yet, and example tools we can connect."
        align="start"
      >
        <CardGrid layout="equal" aria-label="Tool areas">
          {tools.map((tool) => {
            const category = categoryBySlug.get(tool.categorySlug);
            // Resolve connected-area SLUGS to real category NAMES; never display raw slugs, and
            // drop any that don't resolve rather than inventing a label.
            const connectedAreaLabels = tool.connectsWith
              .map((slug) => categoryBySlug.get(slug)?.name)
              .filter((name): name is string => Boolean(name));
            return (
              <ToolCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.name}
                description={tool.whatItDoes}
                categoryLabel={category?.name ?? "Tool area"}
                categoryTone={category?.color}
                categoryIcon={category?.icon ?? "wrench"}
                connectedAreaLabels={connectedAreaLabels}
              />
            );
          })}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Fewer tools, better connected"
        lead="Tell us your goals and we'll help you choose a small stack that talks to each other cleanly — set up in your name, not ours. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
