import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { PrincipleCard } from "@/components/cards/PrincipleCard";
import { DeliveryModelsExplainerSection } from "@/components/sections/DeliveryModelsExplainerSection";
import { HonestExpectationsPanel } from "@/components/routes/HonestExpectationsPanel";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Infinite Weblinks is a Digital Growth Partner: a full-stack web development and digital marketing company that helps businesses choose the right digital tools and services and connect everything around their goals.",
  path: "/about",
});

/** The locked positioning principles — grounded only in the approved Growth Guide. */
const PRINCIPLES: { title: string; body: string; icon: string; color: string }[] = [
  {
    title: "We understand before we sell",
    body: "We learn your business, goals and current setup before recommending anything. Education comes first; the work, if there's a genuine fit, follows from it.",
    icon: "compass",
    color: "var(--domain-strategy)",
  },
  {
    title: "Growth is one connected system",
    body: "Search, your site or store, analytics, email and support work far better joined up than run as separate projects. We connect them, so a change in one place shows up correctly everywhere else.",
    icon: "link",
    color: "var(--domain-discover)",
  },
  {
    title: "We start with the smallest next step",
    body: "You don't need to do everything at once. We find the smallest step that removes your biggest current blocker, then move to the next one once it's working.",
    icon: "target",
    color: "var(--domain-operate)",
  },
  {
    title: "You own your accounts, data and tools",
    body: "Whichever way we're involved, your accounts, data and tools stay in your name. Nothing is locked to Infinite Weblinks.",
    icon: "shield",
    color: "var(--domain-retain)",
  },
  {
    title: "More tools is not better",
    body: "We set up a few tools that talk to each other cleanly, in your name, rather than a longer list nobody maintains.",
    icon: "wrench",
    color: "var(--domain-convert)",
  },
];

/**
 * /about — the V2 light-first brand-story page. PageHeader (server H1 = LCP text) → who-we-are →
 * the five positioning principles → the four ways of working (delivery models, ownership strip
 * shown once here) → honest expectations → the single reserved dark final CTA. No cosmic hero,
 * GlowButton, InfinityMark aside, BentoCard, gradient word or NodeOrb; the approved copy is
 * unchanged. Server Component.
 */
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHeader
        id="about-hero"
        breadcrumbs={[{ name: "About" }]}
        eyebrow="About us"
        title="Your digital growth partner"
        lead="Infinite Weblinks is a full-stack web development and digital marketing company. We help businesses decide what they actually need, build or set it up, and connect everything around their goals, so the website, marketing and tools pull in the same direction."
        actions={
          <>
            <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/how-it-works" variant="secondary" size="lg">
              See how we work
            </Button>
          </>
        }
      />

      <SectionShell
        surface="alt"
        id="who-we-are"
        eyebrow="Who we are"
        title="One partner for the whole picture, not another point tool"
        lead="Most businesses end up with a website from one place, marketing from another, and a pile of tools that don't talk to each other. We exist to join that up: decide what you actually need, build or set it up, and make the pieces work together."
        align="start"
      >
        <p className={styles.body}>
          We&apos;re not tied to any one platform and we don&apos;t sell software. That leaves us free to
          recommend what genuinely fits your size, budget and goals, and to be honest about what you
          don&apos;t need yet. The aim is always the next real step forward, not the longest possible
          invoice.
        </p>
      </SectionShell>

      <SectionShell
        surface="light"
        id="principles"
        eyebrow="How we think"
        title="The principles behind every plan"
        lead="These aren't slogans we bolt on afterwards. They decide what we recommend, and what we tell you to skip."
        align="start"
      >
        <CardGrid layout="equal" aria-label="Our positioning principles">
          {PRINCIPLES.map((principle) => (
            <PrincipleCard
              key={principle.title}
              title={principle.title}
              body={principle.body}
              icon={principle.icon}
              tone={principle.color}
            />
          ))}
        </CardGrid>
      </SectionShell>

      {/* The four ways we can be involved. Ownership is covered here once (the ownership strip),
          so it isn't repeated elsewhere on the page. Delivery cards carry no fragment target — the
          delivery-<key> anchors are page-scoped to /how-it-works. */}
      <DeliveryModelsExplainerSection id="ways-of-working" surface="alt" cardFragmentTargets={false} />

      <SectionShell
        surface="light"
        id="honest"
        eyebrow="Honest expectations"
        title="What we promise, and what we won't."
        lead="We sell honesty as much as we sell growth. Here's the plain version, so there are no surprises later."
        align="start"
      >
        <HonestExpectationsPanel columnLevel={3} />
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Build your digital growth plan, one connected step at a time."
        lead="Tell us where you are and what you want to achieve. We'll help you find the right starting point, then map what to build first and what to connect next."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/how-it-works", label: "See how we work" }}
      />
    </>
  );
}
