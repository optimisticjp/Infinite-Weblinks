import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { DeliveryModelsSection } from "@/components/sections/DeliveryModelsSection";
import { HonestExpectationsSection } from "@/components/sections/home/HonestExpectationsSection";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
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

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <CosmicPageHero
        id="about-hero"
        breadcrumbs={[{ name: "About" }]}
        eyebrow="About us"
        hue="var(--cyan)"
        title={
          <>
            Your <span className="iw-gradient-word">digital growth</span> partner
          </>
        }
        lead="Infinite Weblinks is a full-stack web development and digital marketing company. We help businesses decide what they actually need, build or set it up, and connect everything around their goals, so the website, marketing and tools pull in the same direction."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/how-it-works" variant="ghost" size="lg">
              See how we work
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <InfinityMark size={168} glow />
          </span>
        }
      />

      <SectionShell
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
        id="principles"
        eyebrow="How we think"
        title={
          <>
            The <span className="iw-gradient-word">principles</span> behind every plan
          </>
        }
        lead="These aren't slogans we bolt on afterwards. They decide what we recommend, and what we tell you to skip."
        align="start"
      >
        <BentoGrid>
          {PRINCIPLES.map((principle, i) => (
            <BentoCard
              key={principle.title}
              hue={principle.color}
              icon={principle.icon}
              title={principle.title}
              blurb={principle.body}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      {/* The four ways we can be involved. */}
      <DeliveryModelsSection anchorId="ways-of-working" />

      {/* The honest positioning: what we promise, and what we won't. */}
      <HonestExpectationsSection />

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
