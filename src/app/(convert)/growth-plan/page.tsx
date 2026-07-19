import type { Metadata } from "next";
import {
  ArrowDown,
  MapPin,
  GitBranch,
  Boxes,
  Wrench,
  ListChecks,
  Users,
  Check,
  type LucideIcon,
} from "lucide-react";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import { ConnectorPath } from "@/components/viz/ConnectorPath";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { StatCard, ChartCard } from "@/components/viz/FloatingCards";
import { PlanBuilder } from "@/components/builder/PlanBuilder";
import { canonical } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals } from "@/lib/content";
import styles from "./growth-plan.module.css";

/**
 * /growth-plan — the Growth Plan Builder, the site's primary conversion tool. `noindex,
 * follow` per the SEO spec: the tool is kept out of the index but link equity flows through
 * it, and a self-canonical consolidates any tracking-param variants onto the clean URL.
 */
export const metadata: Metadata = {
  title: "Build my growth plan",
  description:
    "Answer a few short questions and get a clear, honest starting plan for your business online: what to do first, what to connect next, and the tools that fit. No account needed.",
  robots: { index: false, follow: true },
  alternates: { canonical: canonical("/growth-plan") },
};

/** What the plan will contain (shown in the hero preview card). */
const PREVIEW: string[] = [
  "A recommended starting point",
  "A connected roadmap in phases",
  "The services and ways we can deliver them",
  "The right tools for your setup",
  "An honest note on how we'd help",
];

const INCLUDES: { icon: LucideIcon; title: string; body: string; hue: string }[] = [
  { icon: MapPin, title: "A starting point", body: "The stage that fits you now, and why it's the sensible place to begin.", hue: "var(--domain-strategy)" },
  { icon: GitBranch, title: "A connected roadmap", body: "What to do first, what to connect next, and what can wait, in order.", hue: "var(--domain-discover)" },
  { icon: Boxes, title: "Relevant services", body: "The services that move you forward, and the delivery model options for each.", hue: "var(--domain-convert)" },
  { icon: Wrench, title: "The right tools", body: "Real tools that fit your setup, chosen to work together, never a random list.", hue: "var(--domain-build)" },
  { icon: ListChecks, title: "Priorities for later", body: "What to add once the first steps are working, so effort compounds.", hue: "var(--domain-operate)" },
  { icon: Users, title: "How we'd help", body: "A plain note on where we'd do the work and where you'd keep control.", hue: "var(--domain-retain)" },
];

export default async function GrowthPlanPage() {
  const [businessTypes, goals] = await Promise.all([getBusinessTypes(), getGoals()]);

  return (
    <>
      {/* ============ Hero ============ */}
      <section className={`theme-cosmic iw-section ${styles.hero}`} aria-labelledby="gp-heading">
        <CosmicBackground horizon />
        <div className={`iw-container iw-container--wide ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Build your plan</p>
            <h1 id="gp-heading" className={styles.heading}>
              Build your growth plan, one <span className="iw-gradient-word">connected</span> step at a
              time.
            </h1>
            <p className={styles.subhead}>
              Answer a few short questions and get a clear, honest starting plan. What to do first,
              what connects next, and the tools that fit. No account needed, and the plan is yours to
              keep.
            </p>
            <ul className={styles.heroPoints}>
              {["Takes a couple of minutes", "No sign-up, no cost", "Honest advice, not a sales pitch"].map(
                (point, i) => (
                  <li key={point} className={styles.heroPoint}>
                    <NodeOrb
                      hue={["var(--domain-strategy)", "var(--domain-discover)", "var(--domain-retain)"][i]}
                      size={28}
                    >
                      <Check aria-hidden="true" strokeWidth={2.5} />
                    </NodeOrb>
                    {point}
                  </li>
                ),
              )}
            </ul>
            <a href="#builder" className={styles.heroJump}>
              Start with the first question
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <ConnectorPath className={styles.heroTrail} dots={2} d="M0 20 C 30 20, 40 6, 70 6 S 100 6, 100 6" />
            <div className={styles.previewCard}>
              <div className={styles.previewHead}>
                <InfinityMark size={44} luminous />
                <span className={styles.previewTitle}>Your growth plan</span>
              </div>
              <ul className={styles.previewList}>
                {PREVIEW.map((item, i) => (
                  <li key={item} className={styles.previewItem} style={{ ["--i" as string]: `${i}` }}>
                    <span className={styles.previewCheck}>
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <StatCard label="Repeat customers" value="Growing" hue="var(--domain-retain)" className={styles.floatA} />
            <ChartCard label="What's working" hue="var(--domain-discover)" className={styles.floatB} />
          </div>
        </div>
      </section>

      {/* ============ The builder (light breather panel) ============ */}
      <section id="builder" className={`theme-dark ${styles.builderSection}`} aria-label="Growth plan builder">
        <div className="iw-container iw-container--wide">
          <div className={`theme-band-bright ${styles.panel}`}>
            <PlanBuilder businessTypes={businessTypes} goals={goals} />
          </div>
        </div>
      </section>

      {/* ============ What your plan can include ============ */}
      <section className="theme-cosmic iw-section iw-section--tight" aria-labelledby="gp-includes">
        <div className="iw-container iw-container--wide">
          <header className={styles.includesHead}>
            <p className={styles.eyebrow}>What you get</p>
            <h2 id="gp-includes" className={styles.includesTitle}>
              What your plan can include
            </h2>
          </header>
          <ul className={styles.includesGrid}>
            {INCLUDES.map(({ icon: Icon, title, body, hue }) => (
              <li key={title} className={styles.includeCard} style={{ ["--inc-hue" as string]: hue }}>
                <NodeOrb hue={hue} size={44}>
                  <Icon aria-hidden="true" />
                </NodeOrb>
                <h3 className={styles.includeTitle}>{title}</h3>
                <p className={styles.includeBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
