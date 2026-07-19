import type { Metadata } from "next";
import Link from "next/link";
import {
  MessagesSquare,
  UserRound,
  Lock,
  HeartHandshake,
  PencilLine,
  Eye,
  MailCheck,
  Mail,
  Map as MapIcon,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { GlobeArc } from "@/components/viz/GlobeArc";
import { SectionShell } from "@/components/sections/SectionShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/forms/ContactForm";
import type { SelectOption } from "@/components/forms/fields/SelectField";
import { getBusinessTypes, getGoals, getStages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/jsonld";
import { supportEmail } from "@/lib/forms/config";
import styles from "./contact.module.css";

const META_DESCRIPTION =
  "Contact Infinite Weblinks, a Digital Growth Partner. Tell us where your business is now and what you want to achieve, and a real person replies by email with a practical next step. No obligation.";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: META_DESCRIPTION,
  path: "/contact",
});

interface ContactPageProps {
  // `goal` prefills the Main goal select; legacy params (e.g. `subject`) are simply ignored.
  searchParams: Promise<{ goal?: string; subject?: string }>;
}

/* ---- Trust points, each in a different domain hue so the row reads as a small spectrum ---- */
const TRUST: { icon: LucideIcon; label: string; hue: string }[] = [
  { icon: MessagesSquare, label: "Clear, practical advice, not a sales pitch", hue: "var(--domain-strategy)" },
  { icon: UserRound, label: "A real person reads every message", hue: "var(--domain-discover)" },
  { icon: Lock, label: "Your details stay private, never sold", hue: "var(--domain-operate)" },
  { icon: HeartHandshake, label: "No pressure and no obligation", hue: "var(--domain-retain)" },
];

/* ---- Coded globe pins (desktop visual only; decorative) ---- */
const PINS: { label: string; hue: string; x: number; y: number }[] = [
  { label: "Canada", hue: "var(--domain-strategy)", x: 14, y: 54 },
  { label: "UK", hue: "var(--domain-discover)", x: 40, y: 44 },
  { label: "Europe", hue: "var(--domain-convert)", x: 56, y: 60 },
  { label: "US", hue: "var(--domain-build)", x: 24, y: 76 },
  { label: "India", hue: "var(--domain-operate)", x: 80, y: 46 },
  { label: "Australia", hue: "var(--domain-retain)", x: 70, y: 84 },
];
const HUB = { x: 80, y: 14 };

/* ---- What happens after you send ---- */
const STEPS: { icon: LucideIcon; title: string; body: string; hue: string }[] = [
  {
    icon: PencilLine,
    title: "You send a few details",
    body: "Your situation and what you'd like to achieve, in as much or as little detail as you like.",
    hue: "var(--domain-strategy)",
  },
  {
    icon: Eye,
    title: "A person reviews it",
    body: "Someone here reads your message properly and looks at what you've described. Not a bot, not an auto-responder.",
    hue: "var(--domain-convert)",
  },
  {
    icon: MailCheck,
    title: "You get a practical reply",
    body: "One clear next step for your situation, by email. If we're not the right fit, we'll say so and point you somewhere better.",
    hue: "var(--domain-operate)",
  },
];

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  const [businessTypes, stages, goals] = await Promise.all([
    getBusinessTypes(),
    getStages(),
    getGoals(),
  ]);

  const businessTypeOptions: SelectOption[] = businessTypes.map((b) => ({
    value: b.slug,
    label: b.name,
  }));
  const stageOptions: SelectOption[] = stages.map((s) => ({ value: s.slug, label: s.name }));
  const goalOptions: SelectOption[] = goals.map((g) => ({ value: g.slug, label: g.title }));

  const initialGoal = goals.some((g) => g.slug === params.goal) ? params.goal : undefined;

  return (
    <>
      <JsonLd data={contactPageJsonLd(META_DESCRIPTION)} />

      {/* ============ Hero + form ============ */}
      <SectionShell
        background="horizon"
        labelledBy="contact-heading"
        contentClassName={styles.heroInner}
        className={styles.hero}
      >
        {/* Left: the pitch */}
        <div className={styles.intro}>
          <Breadcrumbs trail={[{ name: "Contact", path: "/contact" }]} />
          <p className={styles.eyebrow}>Let&apos;s connect</p>
          <h1 id="contact-heading" className={styles.heading}>
            Let&apos;s plan your next <span className="iw-gradient-word">connected</span> step.
          </h1>
          <p className={styles.subhead}>
            Tell us where your business is now and what you want to achieve. A real person reads
            every message and replies by email with one practical next step. No sales script, no
            obligation.
          </p>
          <a href="#contact-form" className={styles.heroCta}>
            Start your message
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

        {/* Right: the form card */}
        <div className={styles.formCol}>
          <Card variant="glass" className={styles.formCard}>
            <div className={styles.formHead}>
              <h2 className={styles.formTitle}>Send us your goals</h2>
              <p className={styles.formSub}>
                Fields marked <span aria-hidden="true">*</span>
                <span className="iw-visually-hidden">with an asterisk</span> are required. The rest
                just help us reply well.
              </p>
              <span className={styles.formRule} aria-hidden="true" />
            </div>
            <ContactForm
              businessTypeOptions={businessTypeOptions}
              stageOptions={stageOptions}
              goalOptions={goalOptions}
              initialGoal={initialGoal}
            />
          </Card>
        </div>

        {/* Left, below the pitch: trust points */}
        <ul className={styles.trust}>
          {TRUST.map(({ icon: TrustIcon, label, hue }) => (
            <li key={label} className={styles.trustItem}>
              <NodeOrb hue={hue} size={40}>
                <TrustIcon aria-hidden="true" />
              </NodeOrb>
              <span className={styles.trustLabel}>{label}</span>
            </li>
          ))}
        </ul>

        {/* Left, bottom: coded connected globe (desktop only) */}
        <div className={styles.visual} aria-hidden="true">
          <GlobeArc className={styles.visualGlobe} />
          <svg className={styles.visualArcs} viewBox="0 0 100 100" preserveAspectRatio="none">
            {PINS.map((p) => {
              const cx = (HUB.x + p.x) / 2;
              const cy = Math.min(HUB.y, p.y) + Math.abs(p.y - HUB.y) * 0.15;
              return (
                <path
                  key={p.label}
                  className={styles.visualArc}
                  style={{ ["--arc-color" as string]: p.hue }}
                  d={`M ${p.x} ${p.y} Q ${cx} ${cy} ${HUB.x} ${HUB.y}`}
                  fill="none"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  pathLength={1}
                />
              );
            })}
          </svg>
          <span className={styles.visualMark}>
            <InfinityMark size={84} luminous />
          </span>
          <ul className={styles.pins}>
            {PINS.map((pin) => (
              <li
                key={pin.label}
                className={styles.pin}
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, ["--pin-color" as string]: pin.hue }}
              >
                <span className={styles.pinDot} />
                <span className={styles.pinLabel}>{pin.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      {/* ============ What happens next ============ */}
      <SectionShell
        id="what-happens-next"
        eyebrow="What happens next"
        title={
          <>
            No message disappears into a <span className="iw-gradient-word">void</span>.
          </>
        }
        lead="Here's exactly what to expect after you hit send, so getting in touch feels like an easy first move."
        spacing="tight"
      >
        <ol className={styles.steps}>
          {STEPS.map(({ icon: StepIcon, title, body, hue }, i) => (
            <li key={title} className={styles.step} style={{ ["--accent" as string]: hue }}>
              <span className={styles.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <NodeOrb hue={hue} size={46}>
                <StepIcon aria-hidden="true" />
              </NodeOrb>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepBody}>{body}</p>
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* ============ Prefer a different way in ============ */}
      <SectionShell
        id="other-ways"
        eyebrow="Prefer a different start?"
        title="Other ways to reach us."
        lead="The form is the best way to reach a person. If you'd rather start elsewhere, these are open too."
        spacing="tight"
      >
        <ul className={styles.altGrid}>
          <li>
            <Card as="article" variant="outline" accent="var(--domain-operate)" className={styles.altCard}>
              <NodeOrb hue="var(--domain-operate)" size={44}>
                <Mail aria-hidden="true" />
              </NodeOrb>
              <h3 className={styles.altTitle}>Email us directly</h3>
              <p className={styles.altBody}>
                Prefer your own inbox? Write to us and the same real person will reply.
              </p>
              <a href={`mailto:${supportEmail}`} className={styles.altLink}>
                {supportEmail}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Card>
          </li>
          <li>
            <Card as="article" variant="outline" accent="var(--domain-strategy)" className={styles.altCard}>
              <NodeOrb hue="var(--domain-strategy)" size={44}>
                <MapIcon aria-hidden="true" />
              </NodeOrb>
              <h3 className={styles.altTitle}>Build a growth plan</h3>
              <p className={styles.altBody}>
                Answer a few guided questions and get a structured starting point: what to do first,
                and what can wait.
              </p>
              <Link href="/growth-plan" className={styles.altLink}>
                Start the plan
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </Card>
          </li>
        </ul>

        <p className={styles.closingNote}>
          <ShieldCheck size={16} aria-hidden="true" className={styles.closingIcon} />
          The first conversation is exploratory. It&apos;s there to help you understand your options,
          not to sign you up to anything.
        </p>
      </SectionShell>
    </>
  );
}
