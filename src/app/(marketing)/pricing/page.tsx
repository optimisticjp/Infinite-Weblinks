import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDeliveryModels } from "@/lib/content";
import styles from "./pricing.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How pricing works",
  description:
    "We quote each piece of work after we understand it, rather than publishing a fixed price list. Here is what shapes a quote, how the way of working affects cost, and how you get a written price before anything starts.",
  path: "/pricing",
});

const HUE = "var(--domain-convert)";

/** What actually moves a quote up or down. Plain factors, no numbers. */
const FACTORS: { title: string; blurb: string; icon: string; hue: string }[] = [
  {
    title: "The scope of the work",
    blurb: "How much there is to build or set up, and how much of it is new versus tidying what you already have.",
    icon: "layers",
    hue: "var(--domain-build)",
  },
  {
    title: "The goal behind it",
    blurb: "A quick fix to unblock one thing costs less than building a system meant to grow with you for years.",
    icon: "target",
    hue: "var(--domain-strategy)",
  },
  {
    title: "The way we work together",
    blurb: "Whether our team does it, we bring in a specialist, we run it for you, or we hand it over changes the cost.",
    icon: "workflow",
    hue: "var(--domain-operate)",
  },
  {
    title: "How much connects",
    blurb: "Joining a few tools cleanly is more involved than a single standalone page, and it shows in the quote.",
    icon: "git-branch",
    hue: "var(--domain-discover)",
  },
  {
    title: "One-off or ongoing",
    blurb: "Some work is a single project. Some is a monthly arrangement where we keep improving what is live.",
    icon: "gauge",
    hue: "var(--domain-retain)",
  },
  {
    title: "How soon you need it",
    blurb: "A comfortable timeline keeps costs steady. Compressing the work to hit a hard date can add to it.",
    icon: "compass",
    hue: "var(--domain-ai)",
  },
];

/** How each delivery model shapes what you pay. Honest cost shapes, never invented prices. */
const COST_NOTE: Record<string, string> = {
  "we-do":
    "A project fee for one-off builds, or a monthly amount when it is ongoing. Priced to the scope we agree up front.",
  "we-expert":
    "The specialist's rate for their part, plus our time to brief and manage them. Expert work without hiring in-house.",
  "we-run":
    "Usually a recurring fee, since we keep the platform running for you. It scales with how much we manage day to day.",
  "you-run":
    "Set-up is a one-off. After we hand over, the running cost is the tools' own subscriptions, paid by you, in your name.",
};

/** Indicative engagement shapes. Descriptive, not a price list, so each is "quoted to scope". */
const SHAPES: { title: string; blurb: string; icon: string; hue: string; note: string }[] = [
  {
    title: "A focused fix",
    blurb: "One clear job: a specific page, a broken step in a funnel, or a single integration that is holding you up.",
    icon: "check",
    hue: "var(--domain-strategy)",
    note: "Quoted to scope",
  },
  {
    title: "A build project",
    blurb: "A website, store, or connected set of tools built and configured, then handed to you or run on your behalf.",
    icon: "layout",
    hue: "var(--domain-build)",
    note: "Quoted to scope",
  },
  {
    title: "An ongoing partnership",
    blurb: "We plan, build and connect in stages, and keep improving what is live as your goals move on.",
    icon: "trending-up",
    hue: "var(--domain-retain)",
    note: "Monthly, quoted to scope",
  },
];

/** The path to a written price. */
const STEPS: { title: string; blurb: string }[] = [
  {
    title: "Build a plan",
    blurb: "Use the growth plan builder. It is free, takes a few minutes, and gives you a prioritised list of steps.",
  },
  {
    title: "We scope it with you",
    blurb: "A short conversation to confirm what matters now, and what is fine to leave for a later step.",
  },
  {
    title: "You get a written quote",
    blurb: "Clear scope and a clear price for the agreed work, in writing, before anything starts.",
  },
  {
    title: "We start on the first step",
    blurb: "The smallest step that moves you forward, done and working, then on to the next one.",
  },
];

/** Short, honest answers. Rendered on the page, so a FAQPage node is emitted to match. */
const FAQS: { question: string; answer: string }[] = [
  {
    question: "Do you have a fixed price list?",
    answer:
      "No. What things cost depends on the scope, the goal, and the way we work together, so we quote each piece of work after we understand it rather than publishing set prices that would rarely fit.",
  },
  {
    question: "How do I get a price?",
    answer:
      "Build a growth plan or get in touch. We scope the work with you and send a written quote with clear scope and price before any work begins.",
  },
  {
    question: "Does the growth plan cost anything?",
    answer:
      "No. Building a plan on this site is free and takes a few minutes. It gives you a prioritised list of steps. A quote for any work follows once we have scoped it with you.",
  },
  {
    question: "Is it a one-off cost or ongoing?",
    answer:
      "It can be either. Some work is a single project with a project fee. Some is a monthly arrangement where we keep running or improving what is live. The way of working you choose decides which.",
  },
  {
    question: "Will I be locked in?",
    answer:
      "No. Whichever way we work, your accounts, data and tools stay in your name. Nothing is locked to Infinite Weblinks, and you can take your work with you.",
  },
];

export default async function PricingPage() {
  const models = await getDeliveryModels();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How pricing works", path: "/pricing" },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      <CosmicPageHero
        id="pricing-hero"
        breadcrumbs={[{ name: "How pricing works" }]}
        eyebrow="Pricing"
        hue={HUE}
        title={
          <>
            How <span className="iw-gradient-word">pricing</span> works
          </>
        }
        lead="We do not publish a fixed price list, because the same job can be small or large depending on your goals and where you are starting from. Instead we scope the work with you and quote it honestly. Here is what shapes that quote."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/contact" variant="ghost" size="lg">
              Talk it through
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue={HUE} size={128} emphasis="bright">
              <Icon name="credit-card" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
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
      </SectionShell>

      <SectionShell
        id="what-shapes-a-quote"
        eyebrow="What shapes a quote"
        title="Six things that move the number"
        lead="These are the factors we weigh when we scope your work. None of them is a hidden fee. They are just the honest reasons two projects can cost very different amounts."
        align="start"
      >
        <BentoGrid>
          {FACTORS.map((factor, i) => (
            <BentoCard
              key={factor.title}
              hue={factor.hue}
              icon={factor.icon}
              title={factor.title}
              blurb={factor.blurb}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      <SectionShell
        id="delivery-cost"
        eyebrow="The way of working"
        title="How the delivery model shapes cost"
        lead="Every service uses exactly one of four ways of working, so it is always clear who does the work, and how it is paid for."
        align="start"
      >
        <BentoGrid>
          {models.map((model, i) => (
            <BentoCard
              key={model.key}
              hue={DELIVERY_COLOR[model.key] ?? HUE}
              eyebrow={model.tagline}
              title={model.name}
              blurb={COST_NOTE[model.key] ?? model.description}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
        <p className={styles.footnote}>
          Want the full description of each way of working?{" "}
          <a className={styles.inlineLink} href="/how-it-works#delivery-we-do">
            See how we deliver
          </a>
          .
        </p>
      </SectionShell>

      <SectionShell
        id="engagement-shapes"
        eyebrow="Rough shapes"
        title="What engagements tend to look like"
        lead="Not a menu, and not a set of prices. Just the three shapes most work falls into, so you have a sense of where yours might sit before we scope it together."
        align="start"
      >
        <BentoGrid>
          {SHAPES.map((shape, i) => (
            <BentoCard
              key={shape.title}
              hue={shape.hue}
              icon={shape.icon}
              title={shape.title}
              blurb={shape.blurb}
              variant={i === 0 ? "featured" : "medium"}
              badge={<Badge color={shape.hue}>{shape.note}</Badge>}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      <SectionShell
        id="how-to-get-a-quote"
        eyebrow="Getting a price"
        title="How you get a written quote"
        lead="Four steps from where you are now to a clear price you can decide on, with no pressure and nothing starting until you say so."
        align="start"
      >
        <ol className={styles.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBlurb}>{step.blurb}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionShell>

      <SectionShell
        id="pricing-faq"
        eyebrow="Straight answers"
        title="Common questions about cost"
        align="start"
        spacing="tight"
      >
        <dl className={styles.faq}>
          {FAQS.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <dt className={styles.faqQ}>{faq.question}</dt>
              <dd className={styles.faqA}>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
