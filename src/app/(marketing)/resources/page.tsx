import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getLearnArticles } from "@/lib/content";
import styles from "./resources.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Guides, business roadmaps, the tool universe and answers to common questions — everything to help you understand your options before you spend a thing.",
  path: "/resources",
});

/** The resource areas this hub points into (all real, existing routes). V2 domain inks. */
const AREAS = [
  {
    href: "/learn",
    title: "Guides & articles",
    description: "Plain-English explainers on how online growth actually works, one step at a time.",
    icon: "book-open",
    color: "var(--v2-domain-strategy-ink)",
  },
  {
    href: "/how-it-works",
    title: "How everything connects",
    description: "The 8-stage growth journey and the systems that run across all of it.",
    icon: "git-branch",
    color: "var(--v2-domain-discover-ink)",
  },
  {
    href: "/roadmaps",
    title: "Business roadmaps",
    description: "Sequenced plans for different kinds of business, what to do first, and why.",
    icon: "workflow",
    color: "var(--v2-domain-operate-ink)",
  },
  {
    href: "/tools",
    title: "Tool universe",
    description: "The categories of tools we help you choose and connect, set up in your name.",
    icon: "layers",
    color: "var(--v2-domain-build-ink)",
  },
  {
    href: "/pricing",
    title: "How pricing works",
    description: "Why there is no fixed price list, what shapes a quote, and how you get a written price.",
    icon: "credit-card",
    color: "var(--v2-domain-convert-ink)",
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "Straight answers to the questions we hear most, with no jargon.",
    icon: "help-circle",
    color: "var(--v2-domain-retain-ink)",
  },
] as const;

/** Three resource types previewed in the header aside — supports the message; no new
    destinations, links or metrics (they mirror the real areas listed below). */
const PREVIEW = [
  { title: "Guides & articles", icon: "book-open", color: "var(--v2-domain-strategy-ink)" },
  { title: "Business roadmaps", icon: "workflow", color: "var(--v2-domain-operate-ink)" },
  { title: "Tool universe", icon: "layers", color: "var(--v2-domain-build-ink)" },
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

      <PageHeader
        id="resources-hero"
        breadcrumbs={[{ name: "Resources" }]}
        eyebrow="Resources"
        accent="var(--v2-domain-discover-ink)"
        title="Understand your options before you spend a thing"
        lead="We'd rather you made an informed decision than a fast one. Start with a guide, follow a roadmap, explore the tools, or see how pricing works, all in plain English."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/learn" variant="secondary">
              Browse the guides
            </Button>
          </>
        }
        aside={
          <ul className={styles.preview}>
            {PREVIEW.map((p) => (
              <li key={p.title}>
                <Card variant="tinted" accent={p.color} className={styles.previewCard}>
                  <IconTile color={p.color} size="sm">
                    <Icon name={p.icon} />
                  </IconTile>
                  <span className={styles.previewTitle}>{p.title}</span>
                </Card>
              </li>
            ))}
          </ul>
        }
      />

      <SectionShell
        surface="alt"
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
          surface="light"
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
                hue="var(--v2-domain-strategy-ink)"
                icon="book-open"
                title={article.title}
                blurb={article.excerpt}
                variant={i === 0 ? "featured" : "medium"}
                badge={
                  article.readMinutes ? (
                    <Badge tone="neutral">{article.readMinutes} min read</Badge>
                  ) : undefined
                }
              />
            ))}
          </BentoGrid>
        </SectionShell>
      )}

      {/* Restrained final CTA — shared V2 night band, no cosmic decoration. */}
      <FinalCtaSection
        id="get-started"
        title="Ready to make an informed decision?"
        lead="Build a plan around your goals, or talk it through with us first — no obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
