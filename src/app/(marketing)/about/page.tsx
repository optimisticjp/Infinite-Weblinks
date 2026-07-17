import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { AccountOwnershipSection } from "@/components/sections/AccountOwnershipSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Infinite Weblinks is a Digital Growth Partner — a full-stack web development and digital marketing services company that helps businesses choose the right digital tools and services and connect everything around their goals.",
  path: "/about",
});

/** The locked positioning principles — grounded only in the approved Growth Guide. */
const PRINCIPLES: { title: string; body: string; icon: string; color: string }[] = [
  {
    title: "We understand before we sell",
    body: "We learn your business, goals and current setup before recommending anything. Education comes first; the work, if there's a genuine fit, follows from it.",
    icon: "compass",
    color: "var(--violet)",
  },
  {
    title: "Growth is one connected system",
    body: "Search, your site or store, analytics, email and support work far better joined up than run as separate projects. We connect them, so a change in one place shows up correctly everywhere else.",
    icon: "link",
    color: "var(--cyan)",
  },
  {
    title: "We start with the smallest next step",
    body: "You don't need to do everything at once. We find the smallest step that removes your biggest current blocker, then move to the next one once it's working.",
    icon: "target",
    color: "var(--orange)",
  },
  {
    title: "You own your accounts, data and tools",
    body: "Whichever way we're involved, your accounts, data and tools stay in your name. Nothing is locked to Infinite Weblinks.",
    icon: "shield",
    color: "var(--lime)",
  },
  {
    title: "More tools is not better",
    body: "We set up a few tools that talk to each other cleanly, in your name — rather than a longer list nobody maintains.",
    icon: "wrench",
    color: "var(--pink)",
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

      <PageHero
        eyebrow="About"
        title="Your Digital Growth Partner"
        intro="Infinite Weblinks is a full-stack web development and digital marketing services company that helps businesses choose the right digital tools and services, build what they need, and connect everything around their goals."
        breadcrumbs={[{ name: "About" }]}
        accent="var(--cyan)"
        aside={
          <div className={styles.heroMark} aria-hidden="true">
            <span className={styles.heroGlow} />
            <span className={styles.heroRing} />
            <span className={styles.heroRingInner} />
            <InfinityMark size={188} glow />
          </div>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="about-who-heading">
        <div className="iw-container">
          <div className={styles.prose}>
            <SectionHeader
              id="about-who-heading"
              eyebrow="Who we are"
              title="One partner for the whole picture, not another point tool"
            />
            <p className={styles.lead}>
              Most businesses end up with a website from one place, marketing from another, and a
              pile of tools that don&apos;t talk to each other. We exist to join that up. As a Digital
              Growth Partner, we help you decide what you actually need, build or set it up, and make
              the pieces work together — so your website, marketing and tools pull in the same
              direction.
            </p>
            <p className={styles.body}>
              We&apos;re not tied to any one platform and we don&apos;t sell software. That leaves us free to
              recommend what genuinely fits your size, budget and goals, and to be honest about what
              you don&apos;t need yet. The aim is always the next real step forward, not the longest
              possible invoice.
            </p>
          </div>
        </div>
      </section>

      <section className="theme-dark iw-section" aria-labelledby="about-principles-heading">
        <div className="iw-container">
          <SectionHeader
            id="about-principles-heading"
            eyebrow="How we think"
            title="The principles behind every plan"
            intro="These aren't slogans we bolt on afterwards — they decide what we recommend, and what we tell you to skip."
          />
          <ul className={styles.principles}>
            {PRINCIPLES.map((principle) => (
              <li
                key={principle.title}
                className={styles.principle}
                style={{ ["--accent" as string]: principle.color }}
              >
                <span className={styles.principleTile} aria-hidden="true">
                  <Icon name={principle.icon} />
                </span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleBody}>{principle.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The ownership promise, reused whole (ref 13): we build and connect everything in
          your name — you keep control of it. */}
      <AccountOwnershipSection />

      <section className="theme-band iw-section" aria-labelledby="about-cta-heading">
        <div className="iw-container">
          <div className={styles.cta}>
            <p className={styles.slogan}>Digital growth, built around your goals.</p>
            <h2 id="about-cta-heading" className={styles.ctaTitle}>
              Let&apos;s work out your next step
            </h2>
            <p className={styles.ctaBody}>
              Tell us where you are and what you&apos;re trying to achieve. We&apos;ll map the smallest sensible
              next step, and the ones that follow — around what you already have.
            </p>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
