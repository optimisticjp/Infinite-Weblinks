import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { ProcessStepList } from "@/components/routes/ProcessStepList";
import { ContactPathCard } from "@/components/cards/ContactPathCard";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import type { SelectOption } from "@/components/forms/fields/SelectField";
import { getBusinessTypes, getGoals, getStages } from "@/lib/content";
import { contactProcessSteps, contactAlternativePaths, contactClosingNote } from "@/lib/content/data/contact";
import { pageMetadata } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/jsonld";
import { supportEmail } from "@/lib/forms/config.public";
import styles from "./contact.module.css";

/**
 * /contact — the V2 light-first contact experience. PageHeader (server H1 = LCP text) → the
 * two-column ContactFormSection (form-first, the existing ContactForm client component unchanged) →
 * "what happens next" (ProcessStepList) → "other ways to reach us" (ContactPathCard) → the single
 * reserved dark FinalCtaSection. No cosmic hero/starfield, GlobeArc, InfinityMark, NodeOrb, glass
 * card, gradient word or decorative location claim. The clean canonical URL, metadata, ContactPage
 * JSON-LD, goal-prefill query and support-email fallback are all preserved. Server Component.
 */

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

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  const [businessTypes, stages, goals] = await Promise.all([getBusinessTypes(), getStages(), getGoals()]);

  const businessTypeOptions: SelectOption[] = businessTypes.map((b) => ({ value: b.slug, label: b.name }));
  const stageOptions: SelectOption[] = stages.map((s) => ({ value: s.slug, label: s.name }));
  const goalOptions: SelectOption[] = goals.map((g) => ({ value: g.slug, label: g.title }));

  const initialGoal = goals.some((g) => g.slug === params.goal) ? params.goal : undefined;

  return (
    <>
      <JsonLd data={contactPageJsonLd(META_DESCRIPTION)} />

      <PageHeader
        id="contact-hero"
        surface="light"
        breadcrumbs={[{ name: "Contact" }]}
        eyebrow="Let's connect"
        title="Let's plan your next connected step."
        lead="Tell us where your business is now and what you want to achieve. A real person reads every message and replies by email with one practical next step. No sales script, no obligation."
        actions={
          <>
            <Button href="#contact-form" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Start your message
            </Button>
            <Button href={`mailto:${supportEmail}`} variant="secondary" size="lg">
              Email us directly
            </Button>
          </>
        }
        trustNote="A real person reads every message. No pressure and no obligation."
      />

      <ContactFormSection
        businessTypeOptions={businessTypeOptions}
        stageOptions={stageOptions}
        goalOptions={goalOptions}
        initialGoal={initialGoal}
      />

      <SectionShell
        surface="alt"
        id="what-happens-next"
        eyebrow="What happens next"
        title="No message disappears into a void."
        lead="Here's exactly what to expect after you hit send, so getting in touch feels like an easy first move."
        align="start"
        spacing="tight"
      >
        <ProcessStepList
          steps={contactProcessSteps.map((s) => ({
            order: s.order,
            title: s.title,
            description: s.body,
            icon: s.icon,
          }))}
        />
      </SectionShell>

      <SectionShell
        surface="light"
        id="other-ways"
        eyebrow="Prefer a different start?"
        title="Other ways to reach us."
        lead="The form is the best way to reach a person. If you'd rather start elsewhere, these are open too."
        align="start"
        spacing="tight"
      >
        <CardGrid layout="equal" aria-label="Other ways to reach us">
          {contactAlternativePaths.map((path) => (
            <ContactPathCard
              key={path.title}
              title={path.title}
              body={path.body}
              href={path.href}
              icon={path.icon}
              tone={path.tone}
              external={path.external}
            />
          ))}
        </CardGrid>

        <p className={styles.closingNote}>
          <ShieldCheck size={16} aria-hidden="true" className={styles.closingIcon} />
          {contactClosingNote}
        </p>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Ready to send the details?"
        lead="Tell us where you are and what you want to achieve. A real person will read it and reply by email with a practical next step."
        primary={{ href: "#contact-form", label: "Start your message" }}
        secondary={{ href: `mailto:${supportEmail}`, label: "Email us directly" }}
      />
    </>
  );
}
