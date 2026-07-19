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
import { getLearnArticles, getGoals } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Learn",
  description:
    "Short, plain-English guides on how online growth fits together as one connected system: the reasoning behind the work, with no hype and no invented statistics.",
  path: "/learn",
});

export default async function LearnIndexPage() {
  const [articles, goals] = await Promise.all([getLearnArticles(), getGoals()]);
  const goalBySlug = new Map(goals.map((g) => [g.slug, g] as const));

  // Each card is tagged and tinted by the goal the article relates to (wayfinding), falling
  // back to a neutral "Guide" tag in the discover hue when an article has no related goal.
  function tagFor(slugs: string[] | undefined): { label: string; hue: string } {
    const goal = slugs?.map((s) => goalBySlug.get(s)).find(Boolean);
    return goal ? { label: goal.title, hue: goal.color } : { label: "Guide", hue: "var(--domain-discover)" };
  }

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Learn",
          articles.map((a) => ({ name: a.title, path: `/learn/${a.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />

      <CosmicPageHero
        id="learn-hero"
        breadcrumbs={[{ name: "Learn" }]}
        eyebrow="Learn"
        hue="var(--domain-discover)"
        title={
          <>
            Understand how it all <span className="iw-gradient-word">fits together</span>
          </>
        }
        lead="Short reads on the thinking behind the work: how growth works as one connected system, how to choose the right first step, and what connected tools actually mean in practice. Educational first, no hard sell."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#articles" variant="ghost" size="lg">
              Browse the guides
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--domain-discover)" size={128} emphasis="bright">
              <Icon name="book-open" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="articles"
        eyebrow="The guides"
        title="Plain-English reads on connected growth"
        lead="No jargon, no invented numbers. Just the reasoning we use ourselves, written to be understood."
        align="start"
      >
        <BentoGrid>
          {articles.map((article, i) => {
            const tag = tagFor(article.relatedGoalSlugs);
            const read = article.readMinutes ? `${article.readMinutes} min read` : "Guide";
            return (
              <BentoCard
                key={article.slug}
                href={`/learn/${article.slug}`}
                hue={tag.hue}
                icon="book-open"
                eyebrow={`${tag.label} · ${read}`}
                title={article.title}
                blurb={article.excerpt}
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
