import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { Badge } from "@/components/primitives/Badge";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getLearnArticles } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Guides, business roadmaps, the tool universe and answers to common questions — everything to help you understand your options before you spend a thing.",
  path: "/resources",
});

/** The resource areas this hub points into (all real, existing routes). */
const AREAS = [
  {
    href: "/learn",
    title: "Guides & articles",
    description: "Plain-English explainers on how online growth actually works, one step at a time.",
    icon: "book-open",
    color: "var(--domain-strategy)",
  },
  {
    href: "/how-it-works",
    title: "How everything connects",
    description: "The 8-stage growth journey and the systems that run across all of it.",
    icon: "git-branch",
    color: "var(--domain-discover)",
  },
  {
    href: "/roadmaps",
    title: "Business roadmaps",
    description: "Sequenced plans for different kinds of business, what to do first, and why.",
    icon: "workflow",
    color: "var(--domain-operate)",
  },
  {
    href: "/tools",
    title: "Tool universe",
    description: "The categories of tools we help you choose and connect, set up in your name.",
    icon: "layers",
    color: "var(--domain-build)",
  },
  {
    href: "/pricing",
    title: "How pricing works",
    description: "Why there is no fixed price list, what shapes a quote, and how you get a written price.",
    icon: "credit-card",
    color: "var(--domain-convert)",
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "Straight answers to the questions we hear most, with no jargon.",
    icon: "help-circle",
    color: "var(--domain-retain)",
  },
] as const;

export default async function ResourcesHubPage() {
  const articles = await getLearnArticles();
  const latest = articles.slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />

      <CosmicPageHero
        id="resources-hero"
        breadcrumbs={[{ name: "Resources" }]}
        eyebrow="Resources"
        hue="var(--domain-discover)"
        title={
          <>
            Understand your options before you <span className="iw-gradient-word">spend a thing</span>
          </>
        }
        lead="We'd rather you made an informed decision than a fast one. Start with a guide, follow a roadmap, explore the tools, or see how pricing works, all in plain English."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/learn" variant="ghost" size="lg">
              Browse the guides
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--domain-discover)" size={128} emphasis="bright">
              <Icon name="compass" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="resource-areas"
        eyebrow="Where to start"
        title="Six ways in, all in plain English"
        lead="Each of these is a real, free resource. Open the one that matches where you are right now."
        align="start"
      >
        <BentoGrid>
          {AREAS.map((area, i) => (
            <BentoCard
              key={area.href}
              href={area.href}
              hue={area.color}
              icon={area.icon}
              title={area.title}
              blurb={area.description}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      {latest.length > 0 && (
        <SectionShell
          id="latest-guides"
          eyebrow="Latest guides"
          title="Fresh from the blog"
          lead="Recent explainers on getting the fundamentals right before you spend."
          align="start"
        >
          <BentoGrid>
            {latest.map((article, i) => (
              <BentoCard
                key={article.slug}
                href={`/learn/${article.slug}`}
                hue="var(--domain-strategy)"
                icon="book-open"
                title={article.title}
                blurb={article.excerpt}
                variant={i === 0 ? "featured" : "medium"}
                badge={
                  article.readMinutes ? (
                    <Badge color="var(--domain-strategy)">{article.readMinutes} min read</Badge>
                  ) : undefined
                }
              />
            ))}
          </BentoGrid>
        </SectionShell>
      )}

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
