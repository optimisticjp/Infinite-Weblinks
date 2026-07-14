import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Straight answers to the questions we hear most often — how we work, who owns the accounts and data, delivery models, and where to start. No sales pressure.",
  path: "/faq",
});

export default async function FaqPage() {
  const faqs = await getFaqs();

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

      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly"
        intro="The questions we hear most often, with straight answers. If yours isn't here, tell us your goals and we'll cover it."
        breadcrumbs={[{ name: "FAQ" }]}
      />

      <FaqSection anchorId="faq" />
    </>
  );
}
