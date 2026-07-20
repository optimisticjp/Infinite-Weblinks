import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { Button } from "@/components/primitives/Button";
import { FaqAccordion, type FaqGroup } from "@/components/routes/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/content";
import styles from "./faq.module.css";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Straight answers to the questions we hear most often: how we work, pricing and budgets, how long results take, and who owns the accounts and data. No sales pressure.",
  path: "/faq",
});

// Category order + wayfinding hue. Categories come from faqs.ts; anything unmapped falls to
// a neutral hue and sorts last, so adding a category never breaks the page. V2 canary: the
// hues are the accessible V2 domain inks (measured for light surfaces).
const CATEGORY_ORDER = ["Getting started", "How we work", "Pricing", "Timelines", "Ownership"];
const CATEGORY_HUE: Record<string, string> = {
  "Getting started": "var(--v2-domain-strategy-ink)",
  "How we work": "var(--v2-domain-build-ink)",
  Pricing: "var(--v2-domain-convert-ink)",
  Timelines: "var(--v2-domain-operate-ink)",
  Ownership: "var(--v2-domain-retain-ink)",
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
    hue: CATEGORY_HUE[label] ?? "var(--v2-domain-ai-ink)",
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

      <PageHeader
        id="faq-hero"
        breadcrumbs={[{ name: "FAQ" }]}
        eyebrow="FAQ"
        title="Questions, answered plainly"
        lead="The questions we hear most often, with straight answers on how we work, what it costs, how long things take, and who owns everything. If yours isn't here, ask us and we'll cover it."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/contact" variant="secondary">
              Ask a question
            </Button>
          </>
        }
        trustNote="No sales pressure."
      />

      <SectionShell surface="alt" id="faq" ariaLabel="Questions by topic">
        <FaqAccordion groups={groups} />
      </SectionShell>

      {/* Restrained final CTA — reserved .theme-night band, no cosmic decoration. */}
      <SectionShell
        surface="night"
        id="get-started"
        title="Still have a question?"
        lead="Get a plan built around your goals, or just ask us directly — no obligation."
        align="center"
      >
        <div className={styles.ctaActions}>
          <Button href="/growth-plan" variant="signature" size="lg">
            Build my growth plan
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Ask a question
          </Button>
        </div>
      </SectionShell>
    </>
  );
}
