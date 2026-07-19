import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FaqAccordion, type FaqGroup } from "@/components/routes/FaqAccordion";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Straight answers to the questions we hear most often: how we work, pricing and budgets, how long results take, and who owns the accounts and data. No sales pressure.",
  path: "/faq",
});

// Category order + wayfinding hue. Categories come from faqs.ts; anything unmapped falls to
// a neutral hue and sorts last, so adding a category never breaks the page.
const CATEGORY_ORDER = ["Getting started", "How we work", "Pricing", "Timelines", "Ownership"];
const CATEGORY_HUE: Record<string, string> = {
  "Getting started": "var(--domain-strategy)",
  "How we work": "var(--domain-build)",
  Pricing: "var(--domain-convert)",
  Timelines: "var(--domain-operate)",
  Ownership: "var(--domain-retain)",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  // Group by category, ordered by CATEGORY_ORDER (unknown categories keep their first-seen
  // order after the known ones).
  const labels = Array.from(new Set(faqs.map((f) => f.category ?? "More questions")));
  labels.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const groups: FaqGroup[] = labels.map((label) => ({
    label,
    hue: CATEGORY_HUE[label] ?? "var(--domain-ai)",
    items: faqs
      .filter((f) => (f.category ?? "More questions") === label)
      .map((f) => ({ slug: f.slug, question: f.question, answer: f.answer })),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      {/* FAQPage JSON-LD is emitted only because the full FAQ is rendered on this page. */}
      {faqs.length > 0 && (
        <JsonLd data={faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
      )}

      <CosmicPageHero
        id="faq-hero"
        breadcrumbs={[{ name: "FAQ" }]}
        eyebrow="FAQ"
        title="Questions, answered plainly"
        lead="The questions we hear most often, with straight answers on how we work, what it costs, how long things take, and who owns everything. If yours isn't here, ask us and we'll cover it."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/contact" variant="ghost" size="lg">
              Ask a question
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--violet)" size={128} emphasis="bright">
              <Icon name="message-square" />
            </NodeOrb>
          </span>
        }
      />

      <section id="faq" className="theme-cosmic iw-section" aria-label="Questions by topic">
        <div className="iw-container">
          <FaqAccordion groups={groups} />
        </div>
      </section>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
