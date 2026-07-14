import type { Metadata } from "next";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/validation/forms";
import { supportEmail } from "@/lib/forms/config";

/**
 * /contact — "Ask Our Team" / "Send Us Your Goals". Honours `?subject=growth-goals`
 * (and the other known subjects) to prefill the form; noindex per the brief, this is a
 * conversion utility page, not evergreen content.
 */
export const metadata: Metadata = {
  title: "Contact",
  description: "Ask our team a question or send us your growth goals — we reply by email.",
  robots: { index: false, follow: false },
};

function isContactSubject(value: string | undefined): value is ContactSubject {
  return Boolean(value) && (CONTACT_SUBJECTS as readonly string[]).includes(value as string);
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const subject = isContactSubject(params.subject) ? params.subject : undefined;

  return (
    <section className="theme-dark iw-section" aria-labelledby="contact-heading">
      <div className="iw-container">
        <SectionHeader
          as="h1"
          id="contact-heading"
          eyebrow="Contact"
          title="Ask our team, or send us your goals"
          intro="Tell us what you're working on and we'll reply by email — no calls, no pressure."
        />
        <p className="iw-lead">
          Prefer to skip the form? Email us directly at{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and we&apos;ll pick it up.
        </p>
        <ContactForm subject={subject} />
      </div>
    </section>
  );
}
