import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Button } from "@/components/primitives/Button";
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

  // Each card is labelled and tinted by the goal the article relates to (wayfinding), falling
  // back to a neutral "Guide" label in the discover hue when an article has no related goal.
  // The colour token is mapped to an accessible V2 ink inside ArticleCard.
  function tagFor(slugs: string[] | undefined): { label: string; tone: string } {
    const goal = slugs?.map((s) => goalBySlug.get(s)).find(Boolean);
    return goal ? { label: goal.title, tone: goal.color } : { label: "Guide", tone: "var(--domain-discover)" };
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

      <PageHeader
        id="learn-hero"
        breadcrumbs={[{ name: "Learn" }]}
        eyebrow="Learn"
        title="Understand how it all fits together"
        lead="Short reads on the thinking behind the work: how growth works as one connected system, how to choose the right first step, and what connected tools actually mean in practice. Educational first, no hard sell."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#articles" variant="secondary">
              Browse the guides
            </Button>
          </>
        }
        trustNote="Educational first, no hard sell."
      />

      <SectionShell
        surface="alt"
        id="articles"
        eyebrow="The guides"
        title="Plain-English reads on connected growth"
        lead="No jargon, no invented numbers. Just the reasoning we use ourselves, written to be understood."
        align="start"
      >
        <CardGrid layout="editorial" aria-label="Guides">
          {articles.map((article) => {
            const tag = tagFor(article.relatedGoalSlugs);
            return (
              <ArticleCard
                key={article.slug}
                href={`/learn/${article.slug}`}
                title={article.title}
                excerpt={article.excerpt}
                goalLabel={tag.label}
                goalTone={tag.tone}
                readingTime={article.readMinutes ? `${article.readMinutes} min read` : undefined}
                icon="book-open"
              />
            );
          })}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Ready to put it into practice?"
        lead="Turn what you've read into a plan built around your goals — we'll help you find the right first step. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
