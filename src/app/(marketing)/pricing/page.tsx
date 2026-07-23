import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Callout } from "@/components/primitives/Callout";
import { LinkChip } from "@/components/primitives/LinkChip";
import { PricingFactorCard } from "@/components/cards/PricingFactorCard";
import { PricingDeliveryCard } from "@/components/cards/PricingDeliveryCard";
import { EngagementShapeCard } from "@/components/cards/EngagementShapeCard";
import { QuoteProcessList } from "@/components/routes/QuoteProcessList";
import { PricingFaqList } from "@/components/routes/PricingFaqList";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDeliveryModels } from "@/lib/content";
import { domainInk } from "@/lib/design/domainColor";
import {
  pricingFactors,
  pricingDeliveryCostNotes,
  pricingEngagementShapes,
  pricingQuoteSteps,
  pricingFaqs,
} from "@/lib/content/data/pricing";
import styles from "./pricing.module.css";

/**
 * /pricing — the V2 light-first "how pricing works" page. PageHeader (server H1 = LCP text) → a
 * wrapping page-jump nav → why we quote → what shapes a quote (PricingFactorCard) → how the delivery
 * model shapes cost (PricingDeliveryCard) → engagement shapes (EngagementShapeCard) → getting a price
 * (QuoteProcessList) → pricing FAQ (PricingFaqList) → the single reserved dark final CTA. Every word
 * comes from the centralised pricing content; the same pricingFaqs array feeds the visible list and
 * the FAQPage JSON-LD. No cosmic hero, starfield, glow button, node orb, bento card, legacy
 * delivery-colour map, gradient word, invented price or featured-first content. Server Component.
 */
export const metadata: Metadata = pageMetadata({
  title: "How pricing works",
  description:
    "We quote each piece of work after we understand it, rather than publishing a fixed price list. Here is what shapes a quote, how the way of working affects cost, and how you get a written price before anything starts.",
  path: "/pricing",
});

const JUMP = [
  { href: "#why-quotes", label: "Why we quote" },
  { href: "#what-shapes-a-quote", label: "What shapes a quote" },
  { href: "#delivery-cost", label: "Ways of working" },
  { href: "#engagement-shapes", label: "Engagement shapes" },
  { href: "#how-to-get-a-quote", label: "Getting a price" },
  { href: "#pricing-faq", label: "Pricing questions" },
];

export default async function PricingPage() {
  const models = await getDeliveryModels();
  const accent = domainInk("var(--domain-convert)");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How pricing works", path: "/pricing" },
        ])}
      />
      <JsonLd data={faqJsonLd(pricingFaqs)} />

      <PageHeader
        id="pricing-hero"
        surface="light"
        breadcrumbs={[{ name: "How pricing works" }]}
        eyebrow="Pricing"
        accent={accent}
        title="How pricing works"
        lead="We do not publish a fixed price list, because the same job can be small or large depending on your goals and where you are starting from. Instead we scope the work with you and quote it honestly. Here is what shapes that quote."
        actions={
          <>
            <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Talk it through
            </Button>
          </>
        }
        trustNote="A clear written quote before any work starts."
      />

      <div className={`theme-light ${styles.jumpBand}`}>
        <div className="iw-container iw-container--wide">
          <nav aria-label="Pricing sections" className={styles.jumpNav}>
            {JUMP.map((j) => (
              <LinkChip key={j.href} href={j.href}>
                {j.label}
              </LinkChip>
            ))}
          </nav>
        </div>
      </div>

      {/* ============ Why we quote ============ */}
      <SectionShell
        surface="alt"
        id="why-quotes"
        eyebrow="Why we quote"
        title="A clear price for your work, not a list that rarely fits"
        lead="A price list would either be so broad it means nothing, or so specific it is wrong for most people. We would rather understand what you need first, then give you a straight answer."
        align="start"
      >
        <p className={styles.body}>
          The aim is always the next real step forward, not the longest possible invoice. We are not tied
          to any one platform and we do not sell software, so we are free to recommend what genuinely fits
          your size, budget and goals, and to be honest about what you do not need yet. When we do quote,
          it is in writing, with the scope spelled out, so there are no surprises later.
        </p>
        <Callout tone="information" className={styles.callout}>
          You get the scope and the price in writing before anything starts — and nothing begins until you
          agree to it.
        </Callout>
      </SectionShell>

      {/* ============ What shapes a quote ============ */}
      <SectionShell
        surface="light"
        id="what-shapes-a-quote"
        eyebrow="What shapes a quote"
        title="Six things that move the number"
        lead="These are the factors we weigh when we scope your work. None of them is a hidden fee. They are just the honest reasons two projects can cost very different amounts."
        align="start"
      >
        <CardGrid layout="equal" aria-label="What shapes a quote">
          {pricingFactors.map((factor) => (
            <PricingFactorCard
              key={factor.title}
              title={factor.title}
              body={factor.blurb}
              icon={factor.icon}
              tone={factor.tone}
            />
          ))}
        </CardGrid>
      </SectionShell>

      {/* ============ How the delivery model shapes cost ============ */}
      <SectionShell
        surface="alt"
        id="delivery-cost"
        eyebrow="The way of working"
        title="How the delivery model shapes cost"
        lead="Every service uses exactly one of four ways of working, so it is always clear who does the work, and how it is paid for."
        align="start"
      >
        <CardGrid layout="equal" aria-label="How each way of working shapes cost">
          {models.map((model) => (
            <PricingDeliveryCard
              key={model.key}
              modelKey={model.key}
              tagline={model.tagline}
              costNote={pricingDeliveryCostNotes[model.key]}
            />
          ))}
        </CardGrid>
        <p className={styles.footnote}>
          Want the full description of each way of working?{" "}
          <Link className={styles.inlineLink} href="/how-it-works#delivery-we-do">
            See how we deliver
          </Link>
          .
        </p>
      </SectionShell>

      {/* ============ Engagement shapes ============ */}
      <SectionShell
        surface="light"
        id="engagement-shapes"
        eyebrow="Rough shapes"
        title="What engagements tend to look like"
        lead="Not a menu, and not a set of prices. Just the three shapes most work falls into, so you have a sense of where yours might sit before we scope it together."
        align="start"
      >
        <CardGrid layout="equal" aria-label="Engagement shapes">
          {pricingEngagementShapes.map((shape) => (
            <EngagementShapeCard
              key={shape.title}
              title={shape.title}
              body={shape.blurb}
              note={shape.note}
              icon={shape.icon}
              tone={shape.tone}
            />
          ))}
        </CardGrid>
      </SectionShell>

      {/* ============ Getting a price ============ */}
      <SectionShell
        surface="alt"
        id="how-to-get-a-quote"
        eyebrow="Getting a price"
        title="How you get a written quote"
        lead="Four steps from where you are now to a clear price you can decide on, with no pressure and nothing starting until you say so."
        align="start"
      >
        <QuoteProcessList steps={pricingQuoteSteps} />
      </SectionShell>

      {/* ============ Pricing FAQ ============ */}
      <SectionShell
        surface="light"
        id="pricing-faq"
        eyebrow="Straight answers"
        title="Common questions about cost"
        align="start"
        spacing="tight"
      >
        <PricingFaqList faqs={pricingFaqs} />
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Tell us what you need, and we'll scope it together"
        lead="You get a written quote with clear scope and price. Nothing starts until you have agreed to both."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
