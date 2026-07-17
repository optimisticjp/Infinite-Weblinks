import type { Metadata } from "next";
import {
  Briefcase,
  Target,
  Monitor,
  Users,
  Clock,
  Compass,
  GitBranch,
  Layers,
  Wrench,
  Star,
  MapPin,
  Boxes,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { GrowthPlanBuilder } from "@/components/builder/GrowthPlanBuilder";
import { canonical } from "@/lib/seo/metadata";
import { getBusinessTypes, getGoals, getStages } from "@/lib/content";
import styles from "./growth-plan.module.css";

/**
 * /growth-plan — the site's primary CTA destination ("Build My Digital Growth Plan").
 * `noindex, follow` per the SEO spec: this conversion tool is kept out of the index, but
 * link equity still flows through it. A self-canonical keeps any tracking-param variants
 * consolidated onto the clean URL.
 */
export const metadata: Metadata = {
  title: "Build My Digital Growth Plan",
  description:
    "Answer a few guided questions about your business and get a structured starting point — what to build first, what to connect next, and what can wait.",
  robots: { index: false, follow: true },
  alternates: { canonical: canonical("/growth-plan") },
};

const STREAM_INPUTS: { label: string; icon: LucideIcon; color: string; y: number }[] = [
  { label: "Business info", icon: Briefcase, color: "var(--violet)", y: 12 },
  { label: "Goals", icon: Target, color: "var(--pink)", y: 31 },
  { label: "Current setup", icon: Monitor, color: "var(--orange)", y: 50 },
  { label: "Resources", icon: Users, color: "var(--lime)", y: 69 },
  { label: "Timeline", icon: Clock, color: "var(--cyan)", y: 88 },
];

const PLAN_OUTPUTS: { label: string; icon: LucideIcon }[] = [
  { label: "Strategy", icon: Compass },
  { label: "Roadmap", icon: GitBranch },
  { label: "Services", icon: Layers },
  { label: "Tools", icon: Wrench },
  { label: "Priorities", icon: Star },
];

const INCLUDES: { icon: LucideIcon; title: string; desc: string; color: string }[] = [
  {
    icon: MapPin,
    title: "Recommended starting point",
    desc: "A clear first step based on your goals.",
    color: "var(--violet)",
  },
  {
    icon: GitBranch,
    title: "Connected roadmap",
    desc: "A step-by-step plan aligned to growth.",
    color: "var(--pink)",
  },
  {
    icon: Boxes,
    title: "Relevant services",
    desc: "The services that move you forward.",
    color: "var(--orange)",
  },
  {
    icon: Wrench,
    title: "Example tools",
    desc: "Tools and platforms that fit your plan.",
    color: "var(--yellow)",
  },
  {
    icon: ListChecks,
    title: "Priorities for later",
    desc: "Smart sequencing for long-term results.",
    color: "var(--lime)",
  },
  {
    icon: Users,
    title: "How we can help",
    desc: "Flexible support at every stage.",
    color: "var(--cyan)",
  },
];

export default async function GrowthPlanPage() {
  // getBusinessTypes / getGoals / getStages all exist in @/lib/content today (status-gated
  // seed data), so the builder always has real options to render.
  const [businessTypes, goals, stages] = await Promise.all([
    getBusinessTypes(),
    getGoals(),
    getStages(),
  ]);

  return (
    <>
      {/* ---- Hero: header + data-streams-into-plan visual ---- */}
      <section className={`theme-dark iw-section ${styles.heroSection}`} aria-labelledby="growth-plan-heading">
        <div className={`iw-container iw-container--wide ${styles.hero}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Build your plan</p>
            <h1 id="growth-plan-heading" className={styles.heading}>
              Let&apos;s build your digital growth plan<span className={styles.dot}>.</span>
            </h1>
            <p className={styles.subhead}>
              Answer a few clear questions and we&apos;ll show you a practical starting point based on
              your goals and current setup.
            </p>
          </div>

          <div className={styles.streams} aria-hidden="true">
            <ul className={styles.streamList}>
              {STREAM_INPUTS.map(({ label, icon: StreamIcon, color }) => (
                <li key={label} className={styles.streamItem}>
                  <IconTile size={40} color={color}>
                    <StreamIcon aria-hidden="true" />
                  </IconTile>
                  <span className={styles.streamLabel}>{label}</span>
                </li>
              ))}
            </ul>

            <svg className={styles.streamLines} viewBox="0 0 100 100" preserveAspectRatio="none">
              {STREAM_INPUTS.map(({ label, color, y }) => (
                <path
                  key={label}
                  d={`M0 ${y} C 42 ${y}, 58 50, 100 50`}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.72"
                />
              ))}
            </svg>

            <div className={styles.planCard}>
              <p className={styles.planCardTitle}>Your growth plan</p>
              <span className={styles.planMark}>
                <InfinityMark size={76} />
              </span>
              <ul className={styles.planOutputs}>
                {PLAN_OUTPUTS.map(({ label, icon: OutIcon }) => (
                  <li key={label} className={styles.planOutput}>
                    <OutIcon size={16} aria-hidden="true" className={styles.planOutputIcon} />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The builder, on a daylight panel ---- */}
      <section className={`theme-dark ${styles.builderSection}`} aria-label="Growth plan builder">
        <div className="iw-container iw-container--wide">
          <div className={`theme-band-bright ${styles.panel}`}>
            <GrowthPlanBuilder businessTypes={businessTypes} goals={goals} stages={stages} />
          </div>
        </div>
      </section>

      {/* ---- What your plan can include ---- */}
      <section
        className="theme-dark iw-section iw-section--tight"
        aria-labelledby="growth-plan-includes-heading"
      >
        <div className="iw-container iw-container--wide">
          <div className={styles.includesHead}>
            <h2 id="growth-plan-includes-heading" className={styles.includesTitle}>
              What your plan can include
            </h2>
            <span className={styles.includesRule} aria-hidden="true" />
          </div>
          <ul className={styles.includesGrid}>
            {INCLUDES.map(({ icon: IncIcon, title, desc, color }) => (
              <li key={title}>
                <Card as="article" variant="raised" railed accent={color} className={styles.includeCard}>
                  <IconTile size={44} color={color}>
                    <IncIcon aria-hidden="true" />
                  </IconTile>
                  <h3 className={styles.includeTitle}>{title}</h3>
                  <p className={styles.includeDesc}>{desc}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
