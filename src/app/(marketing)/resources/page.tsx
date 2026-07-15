import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
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
    title: "Guides & Articles",
    description: "Plain-English explainers on how online growth actually works, one step at a time.",
    icon: "book-open",
    color: "var(--violet)",
  },
  {
    href: "/how-it-works",
    title: "How Everything Connects",
    description: "The 8-stage growth journey and the systems that run across all of it.",
    icon: "git-branch",
    color: "var(--cyan)",
  },
  {
    href: "/roadmaps",
    title: "Business Roadmaps",
    description: "Sequenced plans for different kinds of business — what to do first, and why.",
    icon: "workflow",
    color: "var(--orange)",
  },
  {
    href: "/tools",
    title: "Tool Universe",
    description: "The categories of tools we help you choose and connect — set up in your name.",
    icon: "layers",
    color: "var(--lime)",
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "Straight answers to the questions we hear most, with no jargon.",
    icon: "help-circle",
    color: "var(--blue)",
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

      <PageHero
        eyebrow="Resources"
        title="Understand your options before you spend a thing"
        intro="We'd rather you made an informed decision than a fast one. Start with a guide, follow a roadmap, or explore the tools — all in plain English."
        breadcrumbs={[{ name: "Resources" }]}
      />

      <section className="theme-band iw-section" aria-labelledby="resources-areas-heading">
        <div className="iw-container">
          <h2 id="resources-areas-heading" className="iw-visually-hidden">
            Resource areas
          </h2>
          <HubGrid>
            {AREAS.map((area) => (
              <HubGridItem key={area.href}>
                <IndexCard
                  href={area.href}
                  title={area.title}
                  description={area.description}
                  icon={area.icon}
                  color={area.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="theme-dark iw-section" aria-labelledby="resources-latest-heading">
          <div className="iw-container">
            <h2 id="resources-latest-heading" className="iw-eyebrow">
              Latest guides
            </h2>
            <HubGrid>
              {latest.map((article) => (
                <HubGridItem key={article.slug}>
                  <IndexCard
                    href={`/learn/${article.slug}`}
                    title={article.title}
                    description={article.excerpt}
                    icon="book-open"
                    footer={article.readMinutes ? `${article.readMinutes} min read` : undefined}
                  />
                </HubGridItem>
              ))}
            </HubGrid>
          </div>
        </section>
      )}
    </>
  );
}
