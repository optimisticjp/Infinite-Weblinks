"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Mail,
  User,
  Briefcase,
  Globe,
  Target,
  Send,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { FormField } from "@/components/forms/FormField";
import { TurnstileField } from "@/components/forms/Turnstile";
import { contactSchema, type ContactSubject } from "@/lib/validation/forms";
import { supportEmail } from "@/lib/forms/config";
import formFieldStyles from "./FormField.module.css";
import styles from "./ContactForm.module.css";

export interface ContactFormProps {
  /** Prefilled subject, e.g. from `?subject=growth-goals`. */
  subject?: ContactSubject;
  className?: string;
}

const SUBJECT_OPTIONS: { value: ContactSubject; label: string }[] = [
  { value: "growth-goals", label: "Sharing my goals for a growth plan" },
  { value: "general", label: "A general enquiry" },
  { value: "services", label: "A specific service or support area" },
];

const MESSAGE_MAX = 2000;

/** Stable ids + labels so the error summary can link to (and focus) each control. Ordered
 * to match the visual field order so the summary reads top-to-bottom. */
const FIELD_ORDER = ["name", "email", "company", "website", "subject", "message"] as const;
const FIELD_META: Record<string, { id: string; label: string }> = {
  name: { id: "contact-name", label: "Name" },
  email: { id: "contact-email", label: "Email" },
  company: { id: "contact-company", label: "Business name" },
  website: { id: "contact-website", label: "Website" },
  subject: { id: "contact-subject", label: "How we can help" },
  message: { id: "contact-message", label: "Message" },
};

interface FormState {
  name: string;
  email: string;
  subject: ContactSubject;
  company: string;
  website: string;
  message: string;
}

type Status = "idle" | "submitting" | "success" | "delivery-unavailable" | "error";

/**
 * Contact form — the primary interaction on /contact ("Send us your goals"). Honours
 * `subject` for the `?subject=growth-goals` deep link. Client validation is UX only; the
 * internal Route Handler re-validates and is the authority (contracts/forms-and-email.md).
 * Delivery goes only to support@infiniteweblinks.com via Formspree, and the support-email
 * fallback is always visible — never hidden behind a failure state, and the form never
 * claims success when nothing was actually delivered.
 */
export function ContactForm({ subject, className }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: subject ?? "general",
    company: "",
    website: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSkipped, setTurnstileSkipped] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Bumped after every submit outcome to drive focus management in an effect — focusing a
  // ref right after setState would target a node that hasn't rendered yet.
  const [focusSignal, setFocusSignal] = useState(0);

  // Captured in an effect (not during render) — Date.now() is impure and the
  // react-hooks purity rule disallows calling it directly in the render body.
  const mountedAt = useRef(0);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Move focus to the summary/notice AFTER it renders, so a keyboard or screen-reader user
  // is taken straight to the outcome. Whichever block rendered owns the focus target: the
  // error summary in the error state, the status/notice panel otherwise.
  useEffect(() => {
    if (focusSignal === 0) return;
    (statusRef.current ?? errorSummaryRef.current)?.focus();
  }, [focusSignal]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function focusField(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const elapsedMs = Date.now() - mountedAt.current;
    const parsed = contactSchema.safeParse({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      company: form.company || undefined,
      website: form.website || undefined,
      _gotcha: honeypot,
      turnstileToken: turnstileToken ?? undefined,
      elapsedMs,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(flat)) {
        if (msgs && msgs[0]) next[field] = msgs[0];
      }
      setFieldErrors(next);
      setStatus("error");
      setStatusMessage(null);
      setFocusSignal((s) => s + 1);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: { ok: boolean; code?: string; message?: string } = await res.json();

      if (data.ok) {
        setStatus("success");
        setStatusMessage(null);
      } else if (data.code === "delivery-unavailable" || data.code === "delivery-failed") {
        setStatus("delivery-unavailable");
        setStatusMessage(
          data.message ??
            `Form delivery isn't configured on this preview yet — please email ${supportEmail} and we'll pick it up.`,
        );
      } else {
        setStatus("error");
        setStatusMessage(
          data.message ?? "Something went wrong. Please try again or email us directly.",
        );
      }
    } catch {
      setStatus("delivery-unavailable");
      setStatusMessage(
        `We couldn't reach the server just now — please email ${supportEmail} and we'll pick it up.`,
      );
    } finally {
      setFocusSignal((s) => s + 1);
    }
  }

  const orderedErrors = FIELD_ORDER.filter((f) => fieldErrors[f]).map(
    (f) => [f, fieldErrors[f]] as const,
  );
  const messageLength = form.message.length;

  if (status === "success") {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
        <div ref={statusRef} tabIndex={-1} role="status" className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">
            <CheckCircle2 />
          </span>
          <h3 className={styles.successTitle}>Thanks — your message is on its way.</h3>
          <p className={styles.successBody}>
            A real person will read it and reply by email with a practical next step. There&apos;s
            no obligation, and nothing gets added to a mailing list.
          </p>
          <p className={styles.fallback}>
            Prefer email directly?{" "}
            <a href={`mailto:${supportEmail}`}>
              <Mail size={14} aria-hidden="true" className={styles.mailIcon} />
              {supportEmail}
            </a>
          </p>
          <div className={styles.successLinks}>
            <Link href="/growth-plan" className={styles.successLink}>
              Build a Digital Growth Plan
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/services" className={styles.successLink}>
              Explore what we do
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.honeypotWrap} aria-hidden="true">
        <label htmlFor="contact-company-check">Leave this field blank</label>
        <input
          id="contact-company-check"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === "error" && orderedErrors.length > 0 ? (
        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className={styles.errorSummary}>
          <p className={styles.errorSummaryHeading}>Please fix the following before sending:</p>
          <ul>
            {orderedErrors.map(([field, msg]) => (
              <li key={field}>
                <a
                  href={`#${FIELD_META[field]?.id ?? ""}`}
                  className={styles.errorLink}
                  onClick={(e) => {
                    e.preventDefault();
                    focusField(FIELD_META[field]?.id ?? "");
                  }}
                >
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status === "delivery-unavailable" && statusMessage ? (
        <div ref={statusRef} tabIndex={-1} role="alert" className={styles.notice}>
          {statusMessage}
        </div>
      ) : null}

      {status === "error" && orderedErrors.length === 0 && statusMessage ? (
        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className={styles.errorSummary}>
          {statusMessage}
        </div>
      ) : null}

      <div className={styles.grid}>
        <FormField id="contact-name" label="Your name" required error={fieldErrors.name}>
          {(controlProps) => (
            <span className={styles.inputWrap}>
              <User className={styles.inputIcon} size={18} aria-hidden="true" />
              <input
                {...controlProps}
                type="text"
                placeholder="Your name"
                className={`${formFieldStyles.control} ${styles.hasIcon}`}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="name"
              />
            </span>
          )}
        </FormField>

        <FormField id="contact-email" label="Email" required error={fieldErrors.email}>
          {(controlProps) => (
            <span className={styles.inputWrap}>
              <Mail className={styles.inputIcon} size={18} aria-hidden="true" />
              <input
                {...controlProps}
                type="email"
                inputMode="email"
                placeholder="you@yourbusiness.com"
                className={`${formFieldStyles.control} ${styles.hasIcon}`}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
              />
            </span>
          )}
        </FormField>

        <FormField
          id="contact-company"
          label="Business name"
          hint="Optional"
          error={fieldErrors.company}
        >
          {(controlProps) => (
            <span className={styles.inputWrap}>
              <Briefcase className={styles.inputIcon} size={18} aria-hidden="true" />
              <input
                {...controlProps}
                type="text"
                placeholder="Your business name"
                className={`${formFieldStyles.control} ${styles.hasIcon}`}
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                autoComplete="organization"
              />
            </span>
          )}
        </FormField>

        <FormField id="contact-website" label="Website" hint="Optional" error={fieldErrors.website}>
          {(controlProps) => (
            <span className={styles.inputWrap}>
              <Globe className={styles.inputIcon} size={18} aria-hidden="true" />
              <input
                {...controlProps}
                type="url"
                inputMode="url"
                placeholder="yourbusiness.com"
                className={`${formFieldStyles.control} ${styles.hasIcon}`}
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                autoComplete="url"
              />
            </span>
          )}
        </FormField>

        <FormField
          id="contact-subject"
          label="How can we help?"
          required
          error={fieldErrors.subject}
          className={styles.fullWidth}
        >
          {(controlProps) => (
            <span className={styles.inputWrap}>
              <Target className={styles.inputIcon} size={18} aria-hidden="true" />
              <select
                {...controlProps}
                className={`${formFieldStyles.control} ${styles.hasIcon} ${styles.select}`}
                value={form.subject}
                onChange={(e) => update("subject", e.target.value as ContactSubject)}
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectChevron} size={18} aria-hidden="true" />
            </span>
          )}
        </FormField>

        <FormField
          id="contact-message"
          label="Your message"
          required
          hint="Where your business is now, what you'd like to achieve, and anything already in place. 10–2000 characters."
          error={fieldErrors.message}
          className={styles.fullWidth}
        >
          {(controlProps) => (
            <span className={styles.textareaWrap}>
              <textarea
                {...controlProps}
                className={formFieldStyles.control}
                placeholder="For example: “We run a small e-commerce shop. Traffic is steady but sales have stalled, and our email tool and store aren't joined up. Not sure what to fix first.”"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={6}
                maxLength={MESSAGE_MAX}
              />
              <span
                className={[styles.counter, messageLength >= MESSAGE_MAX ? styles.counterFull : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                {messageLength} / {MESSAGE_MAX}
              </span>
            </span>
          )}
        </FormField>
      </div>

      <TurnstileField onToken={setTurnstileToken} onSkipped={() => setTurnstileSkipped(true)} />
      {turnstileSkipped ? (
        <p className={styles.hintNote}>
          Human verification isn&apos;t active in this preview — your submission is still checked
          server-side.
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className={styles.submit}
          iconLeft={<Send size={18} aria-hidden="true" />}
          aria-busy={status === "submitting"}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send My Goals"}
        </Button>
        <p className={styles.reassure}>
          <ShieldCheck size={15} aria-hidden="true" className={styles.reassureIcon} />A real person
          replies by email. No obligation.
        </p>
        <p className={styles.consent}>
          By sending this, you agree we can reply to your enquiry. We&apos;ll never sell your
          details — see our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p className={styles.fallback}>
          Prefer email directly?{" "}
          <a href={`mailto:${supportEmail}`}>
            <Mail size={14} aria-hidden="true" className={styles.mailIcon} />
            {supportEmail}
          </a>
        </p>
      </div>
    </form>
  );
}
