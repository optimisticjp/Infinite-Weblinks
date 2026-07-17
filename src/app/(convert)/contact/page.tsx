import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  UserRound,
  Lock,
  HeartHandshake,
  PencilLine,
  Eye,
  MailCheck,
  Compass,
  Unplug,
  LayoutTemplate,
  Filter,
  Workflow,
  Network,
  Globe,
  Server,
  BarChart3,
  Megaphone,
  Database,
  FileCode2,
  KeyRound,
  Map as MapIcon,
  ScanSearch,
  LayoutGrid,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Button } from "@/components/primitives/Button";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { GlobeArc } from "@/components/viz/GlobeArc";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/forms/ContactForm";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/validation/forms";
import { pageMetadata } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/jsonld";
import { supportEmail } from "@/lib/forms/config";
import styles from "./contact.module.css";

const META_DESCRIPTION =
  "Contact Infinite Weblinks, a Digital Growth Partner. Tell us where your business is now and what you want to achieve — a real person reads every message and replies by email with a practical next step. No obligation.";

/**
 * /contact — the Contact Us page. A content-ful, indexable page (not a bare form utility):
 * it explains why and when to get in touch, sets expectations for what happens after you
 * send, and states the ownership guarantee — so it legitimately earns an index slot and
 * supports "contact a Digital Growth Partner" searches. The self-canonical keeps every
 * `?subject=` deep-link variant consolidated onto the clean /contact URL.
 */
export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: META_DESCRIPTION,
  path: "/contact",
});

function isContactSubject(value: string | undefined): value is ContactSubject {
  return Boolean(value) && (CONTACT_SUBJECTS as readonly string[]).includes(value as string);
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string }>;
}

/* ---- Hero: why/when to get in touch ---- */
const TRUST: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: Sparkles, label: "Practical advice, not a pitch", color: "var(--violet)" },
  { icon: UserRound, label: "A real person reads every message", color: "var(--cyan)" },
  { icon: Lock, label: "Your details stay private", color: "var(--orange)" },
  { icon: HeartHandshake, label: "No pressure, no obligation", color: "var(--pink)" },
];

/* Decorative globe pins (desktop only). Percent coordinates within the visual box. */
const PINS: { label: string; color: string; x: number; y: number }[] = [
  { label: "Canada", color: "var(--violet)", x: 13, y: 55 },
  { label: "UK", color: "var(--cyan)", x: 40, y: 45 },
  { label: "Europe", color: "var(--violet-bright)", x: 55, y: 63 },
  { label: "US", color: "var(--pink)", x: 20, y: 77 },
  { label: "India", color: "var(--orange)", x: 80, y: 45 },
  { label: "Australia", color: "var(--blue)", x: 70, y: 89 },
];
const HUB = { x: 80, y: 15 };

/* ---- What happens after you send ---- */
const STEPS: { icon: LucideIcon; title: string; body: string; color: string }[] = [
  {
    icon: PencilLine,
    title: "You send a few details",
    body: "Your situation and what you'd like to achieve — as much or as little as you like. No long forms.",
    color: "var(--violet)",
  },
  {
    icon: Eye,
    title: "A person reviews it",
    body: "Someone here reads your message properly and looks at what you've described. Not a bot, not an auto-responder.",
    color: "var(--pink)",
  },
  {
    icon: MailCheck,
    title: "You get a practical reply",
    body: "A clear next step for your situation, by email. If we're not the right fit, we'll say so and point you somewhere better.",
    color: "var(--orange)",
  },
];

/* ---- Good reasons to get in touch ---- */
const REASONS: { icon: LucideIcon; title: string; body: string; color: string }[] = [
  {
    icon: Compass,
    title: "You're not sure what to prioritise",
    body: "You know things could work better online, but not which change to make first.",
    color: "var(--violet)",
  },
  {
    icon: Unplug,
    title: "Your website and marketing don't talk",
    body: "The pieces exist, but they aren't joined up — so effort leaks and nothing compounds.",
    color: "var(--pink)",
  },
  {
    icon: LayoutTemplate,
    title: "You need a new website or foundation",
    body: "You're starting fresh, or the current site is quietly holding the business back.",
    color: "var(--blue)",
  },
  {
    icon: Filter,
    title: "Traffic comes in but doesn't convert",
    body: "People visit, but too few turn into enquiries or customers, and it's not clear why.",
    color: "var(--cyan)",
  },
  {
    icon: Workflow,
    title: "Your tools create manual work",
    body: "You're re-keying data between systems and doing by hand what software should handle.",
    color: "var(--orange)",
  },
  {
    icon: Network,
    title: "You have providers but need coordination",
    body: "Different people handle different pieces; you need someone to make them work as one.",
    color: "var(--lime)",
  },
];

/* ---- Ownership: what stays yours ---- */
const OWNED: { icon: LucideIcon; label: string }[] = [
  { icon: Globe, label: "Domains" },
  { icon: Server, label: "Hosting" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Megaphone, label: "Advertising accounts" },
  { icon: Database, label: "CRM & customer data" },
  { icon: FileCode2, label: "Source files" },
  { icon: KeyRound, label: "Platform logins" },
];

/* ---- Alternative paths (secondary — must not out-shout the form) ---- */
const ALT_PATHS: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
  color: string;
}[] = [
  {
    icon: MapIcon,
    title: "Build a Digital Growth Plan",
    body: "Answer a few guided questions and get a structured starting point — what to do first, and what can wait.",
    href: "/growth-plan",
    cta: "Start the plan",
    color: "var(--violet)",
  },
  {
    icon: ScanSearch,
    title: "Try the Growth Troubleshooter",
    body: "Describe what isn't working and see where the problem most likely comes from, in a couple of minutes.",
    href: "/troubleshooter",
    cta: "Open the troubleshooter",
    color: "var(--cyan)",
  },
  {
    icon: LayoutGrid,
    title: "Explore services & goals",
    body: "Browse what we plan, build and connect — organised around the outcomes you're aiming for.",
    href: "/services",
    cta: "Explore what we do",
    color: "var(--orange)",
  },
];

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const subject = isContactSubject(params.subject) ? params.subject : undefined;

  return (
    <>
      <JsonLd data={contactPageJsonLd(META_DESCRIPTION)} />

      {/* ============ Hero + form ============ */}
      <section className={`theme-dark iw-section ${styles.hero}`} aria-labelledby="contact-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={`iw-container iw-container--wide ${styles.heroInner}`}>
          <div className={styles.intro}>
            <Breadcrumbs trail={[{ name: "Contact", path: "/contact" }]} />
            <p className={styles.eyebrow}>Get in touch</p>
            <h1 id="contact-heading" className={styles.heading}>
              Let&apos;s work out your <span className="iw-gradient-text">best next step</span>{" "}
              online.
            </h1>
            <p className={styles.subhead}>
              Tell us where your business is now and what you want to achieve. A real person reads
              every message and replies by email with a clear, practical next step — whether
              that&apos;s a new website, joining up your tools, or simply deciding what to do first.
            </p>
            <a href="#contact-form" className={styles.heroCta}>
              Start your message
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.formCol}>
            <Card variant="glass" className={styles.formCard}>
              <div className={styles.formHead}>
                <h2 className={styles.formTitle}>Send us your goals</h2>
                <p className={styles.formSub}>
                  Fields marked <span aria-hidden="true">*</span>
                  <span className="iw-visually-hidden">with an asterisk</span> are required. The
                  rest just help us reply well.
                </p>
                <span className={styles.formRule} aria-hidden="true" />
              </div>
              <ContactForm subject={subject} />
            </Card>
          </div>

          <ul className={styles.trust}>
            {TRUST.map(({ icon: TrustIcon, label, color }) => (
              <li key={label} className={styles.trustItem}>
                <IconTile color={color} size={40}>
                  <TrustIcon aria-hidden="true" />
                </IconTile>
                <span className={styles.trustLabel}>{label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.visual} aria-hidden="true">
            <GlobeArc className={styles.visualGlobe} />
            <svg className={styles.visualArcs} viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="contactArc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="rgba(34,211,238,0.0)" />
                  <stop offset="45%" stopColor="rgba(168,85,247,0.55)" />
                  <stop offset="100%" stopColor="rgba(255,122,24,0.0)" />
                </linearGradient>
              </defs>
              {PINS.map((p) => {
                const cx = (HUB.x + p.x) / 2;
                const cy = Math.min(HUB.y, p.y) + Math.abs(p.y - HUB.y) * 0.15;
                return (
                  <path
                    key={p.label}
                    d={`M ${HUB.x} ${HUB.y} Q ${cx} ${cy} ${p.x} ${p.y}`}
                    fill="none"
                    stroke="url(#contactArc)"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <span className={styles.visualMark}>
              <InfinityMark size={96} />
            </span>
            <ul className={styles.pins}>
              {PINS.map((pin) => (
                <li
                  key={pin.label}
                  className={styles.pin}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    ["--pin-color" as string]: pin.color,
                  }}
                >
                  <span className={styles.pinDot} />
                  <span className={styles.pinLabel}>{pin.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ What happens after you send ============ */}
      <section
        className={`theme-band-bright iw-section ${styles.next}`}
        aria-labelledby="contact-next-heading"
      >
        <div className={`iw-container iw-container--wide ${styles.nextInner}`}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrowInk}>What happens next</p>
            <h2 id="contact-next-heading" className={styles.sectionTitle}>
              No message disappears into a void.
            </h2>
            <p className={styles.sectionLead}>
              Here&apos;s exactly what to expect after you hit send — so getting in touch feels like
              an easy first move, not a leap.
            </p>
          </div>

          <ol className={styles.steps}>
            {STEPS.map(({ icon: StepIcon, title, body, color }, i) => (
              <li key={title} className={styles.step} style={{ ["--accent" as string]: color }}>
                <span className={styles.stepNum} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.stepIcon} aria-hidden="true">
                  <StepIcon />
                </span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepBody}>{body}</p>
              </li>
            ))}
          </ol>

          <p className={styles.nextNote}>
            <ShieldCheck size={18} aria-hidden="true" className={styles.nextNoteIcon} />
            The first conversation is exploratory. It&apos;s there to help you understand your
            options — not to sign you up to anything.
          </p>
        </div>
      </section>

      {/* ============ Good reasons to get in touch ============ */}
      <section
        className={`theme-dark iw-section ${styles.reasons}`}
        aria-labelledby="contact-reasons-heading"
      >
        <div className="iw-container iw-container--wide">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>When to reach out</p>
            <h2 id="contact-reasons-heading" className={styles.sectionTitle}>
              Good reasons to start a conversation.
            </h2>
            <p className={styles.sectionLead}>
              If any of these sound familiar, a short message is worth it — including when
              you&apos;re planning a new phase of growth and want the digital side to keep pace.
            </p>
          </div>

          <ul className={styles.reasonGrid}>
            {REASONS.map(({ icon: ReasonIcon, title, body, color }) => (
              <li key={title}>
                <Card
                  as="article"
                  variant="raised"
                  railed
                  accent={color}
                  className={styles.reasonCard}
                >
                  <IconTile size={44} color={color}>
                    <ReasonIcon aria-hidden="true" />
                  </IconTile>
                  <h3 className={styles.reasonTitle}>{title}</h3>
                  <p className={styles.reasonBody}>{body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ Ownership guarantee ============ */}
      <section
        className={`theme-dark iw-section iw-section--tight ${styles.own}`}
        aria-labelledby="contact-own-heading"
      >
        <div className={`iw-container iw-container--wide ${styles.ownInner}`}>
          <div className={styles.ownText}>
            <p className={styles.eyebrow}>Your digital world, owned by you</p>
            <h2 id="contact-own-heading" className={styles.sectionTitle}>
              Whatever we build, it stays yours.
            </h2>
            <p className={styles.sectionLead}>
              We set up and connect your digital systems in your name, with clear access and plain
              documentation. If we ever part ways, you keep everything and carry on — no hostage
              accounts, no hidden lock-in.
            </p>
            <p className={styles.ownReassure}>
              <ShieldCheck size={16} aria-hidden="true" />
              Owned and controlled by you — accounts, data and access.
            </p>
          </div>

          <Card variant="glass" className={styles.ownCard}>
            <p className={styles.ownCardLabel}>Stays in your hands</p>
            <ul className={styles.ownList}>
              {OWNED.map(({ icon: OwnIcon, label }) => (
                <li key={label} className={styles.ownItem}>
                  <span className={styles.ownIcon} aria-hidden="true">
                    <OwnIcon size={17} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ============ Alternative paths (secondary) ============ */}
      <section
        className={`theme-dark iw-section iw-section--tight ${styles.alt}`}
        aria-labelledby="contact-alt-heading"
      >
        <div className="iw-container iw-container--wide">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Prefer a different start?</p>
            <h2 id="contact-alt-heading" className={styles.altTitle}>
              A message isn&apos;t the only way in.
            </h2>
            <p className={styles.sectionLead}>
              If you&apos;d rather explore on your own first, these are quicker, self-serve routes.
              The form above is still the best way to reach a person.
            </p>
          </div>

          <ul className={styles.altGrid}>
            {ALT_PATHS.map(({ icon: AltIcon, title, body, href, cta, color }) => (
              <li key={title}>
                <Card
                  as="article"
                  variant="outline"
                  accent={color}
                  interactive
                  className={styles.altCard}
                >
                  <span
                    className={styles.altIcon}
                    style={{ ["--accent" as string]: color }}
                    aria-hidden="true"
                  >
                    <AltIcon size={20} />
                  </span>
                  <h3 className={styles.altCardTitle}>{title}</h3>
                  <p className={styles.altCardBody}>{body}</p>
                  <Link href={href} className={styles.altLink}>
                    {cta}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ Closing CTA → footer ============ */}
      <section
        className={`theme-dark iw-section iw-section--loose ${styles.close}`}
        aria-labelledby="contact-close-heading"
      >
        <div className={styles.closeGlobe} aria-hidden="true">
          <GlobeArc />
        </div>
        <div className={`iw-container ${styles.closeInner}`}>
          <span className={styles.closeMark} aria-hidden="true">
            <InfinityMark size={132} glow />
          </span>
          <p className={styles.eyebrow}>Ready when you are</p>
          <h2 id="contact-close-heading" className={styles.closeTitle}>
            Tell us your goals, and we&apos;ll help you find{" "}
            <span className="iw-gradient-text">the next step.</span>
          </h2>
          <p className={styles.closeLead}>
            One message is all it takes to get a clear, practical view of what to do next — with no
            obligation to go any further.
          </p>
          <div className={styles.closeActions}>
            <Button
              href={`mailto:${supportEmail}`}
              variant="primary"
              size="lg"
              iconLeft={<Mail aria-hidden="true" />}
            >
              Email us directly
            </Button>
            <a href="#contact-form" className={styles.closeSecondary}>
              <ArrowUp size={16} aria-hidden="true" />
              or send the form above
            </a>
          </div>
          <p className={styles.closeEmail}>
            <Mail size={14} aria-hidden="true" />
            {supportEmail}
          </p>
        </div>
      </section>
    </>
  );
}
