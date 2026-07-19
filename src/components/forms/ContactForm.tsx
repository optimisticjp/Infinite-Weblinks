"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Mail,
  User,
  Briefcase,
  Globe,
  TrendingUp,
  Target,
  Send,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { GlowButton } from "@/components/primitives/GlowButton";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField, type SelectOption } from "@/components/forms/fields/SelectField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { TurnstileField } from "@/components/forms/Turnstile";
import { contactSchema } from "@/lib/validation/forms";
import { supportEmail } from "@/lib/forms/config";
import styles from "./ContactForm.module.css";

export interface ContactFormProps {
  businessTypeOptions: SelectOption[];
  stageOptions: SelectOption[];
  goalOptions: SelectOption[];
  /** Prefill the Main goal select, e.g. from a `?goal=<slug>` deep link. */
  initialGoal?: string;
  className?: string;
}

const MESSAGE_MAX = 1000;

/** Field order for the error summary — reads top-to-bottom, matching the visual layout. */
const FIELD_ORDER = ["name", "email", "company", "website", "message"] as const;
const FIELD_META: Record<string, { id: string; label: string }> = {
  name: { id: "contact-name", label: "Name" },
  email: { id: "contact-email", label: "Email" },
  company: { id: "contact-company", label: "Business name" },
  website: { id: "contact-website", label: "Website" },
  message: { id: "contact-message", label: "Message" },
};

interface FormState {
  name: string;
  email: string;
  company: string;
  website: string;
  businessType: string;
  currentStage: string;
  mainGoal: string;
  message: string;
}

type Status = "idle" | "submitting" | "success" | "delivery-unavailable" | "error";

/**
 * Contact form — the primary interaction on /contact ("Send us your goals"). Client
 * validation is UX only; the internal Route Handler re-validates and is the authority
 * (contracts/forms-and-email.md). Delivery goes only to support@infiniteweblinks.com via
 * Formspree, the support-email fallback stays visible in every state, and the form never
 * claims success when nothing was actually delivered.
 */
export function ContactForm({
  businessTypeOptions,
  stageOptions,
  goalOptions,
  initialGoal,
  className,
}: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    website: "",
    businessType: "",
    currentStage: "",
    mainGoal: initialGoal ?? "",
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

  // Captured in an effect (not during render) — Date.now() is impure and the react-hooks
  // purity rule disallows calling it directly in the render body.
  const mountedAt = useRef(0);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Move focus to the outcome (summary / notice / success) AFTER it renders, so a keyboard
  // or screen-reader user is taken straight to it.
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
      message: form.message,
      company: form.company || undefined,
      website: form.website || undefined,
      businessType: form.businessType || undefined,
      currentStage: form.currentStage || undefined,
      mainGoal: form.mainGoal || undefined,
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
            `Form delivery isn't set up on this preview yet. Please email ${supportEmail} and we'll pick it up.`,
        );
      } else {
        setStatus("error");
        setStatusMessage(
          data.message ?? "Something went wrong. Please try again, or email us directly.",
        );
      }
    } catch {
      setStatus("delivery-unavailable");
      setStatusMessage(
        `We couldn't reach the server just now. Please email ${supportEmail} and we'll pick it up.`,
      );
    } finally {
      setFocusSignal((s) => s + 1);
    }
  }

  const orderedErrors = FIELD_ORDER.filter((f) => fieldErrors[f]).map(
    (f) => [f, fieldErrors[f]] as const,
  );

  if (status === "success") {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
        <div ref={statusRef} tabIndex={-1} role="status" className={styles.success}>
          <span className={styles.successVisual} aria-hidden="true">
            <svg className={styles.successConnector} viewBox="0 0 120 40" fill="none">
              <path
                className={styles.successLine}
                d="M6 20 H54"
                stroke="url(#contactSuccessGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1}
              />
              <path
                className={styles.successLine}
                d="M66 20 H114"
                stroke="url(#contactSuccessGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1}
              />
              <defs>
                <linearGradient id="contactSuccessGrad" x1="0" y1="0" x2="120" y2="0">
                  <stop offset="0" stopColor="#8b3bff" />
                  <stop offset="0.55" stopColor="#f5197e" />
                  <stop offset="1" stopColor="#ff7a18" />
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.successMark}>
              <InfinityMark size={72} luminous />
            </span>
          </span>
          <h3 className={styles.successTitle}>Thanks, your message is on its way.</h3>
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
              Build a digital growth plan
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
        <TextField
          id="contact-name"
          label="Your name"
          required
          icon={User}
          value={form.name}
          onChange={(v) => update("name", v)}
          placeholder="Your name"
          autoComplete="name"
          error={fieldErrors.name}
        />
        <TextField
          id="contact-email"
          label="Email"
          type="email"
          inputMode="email"
          required
          icon={Mail}
          value={form.email}
          onChange={(v) => update("email", v)}
          placeholder="you@yourbusiness.com"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <TextField
          id="contact-company"
          label="Business name"
          hint="Optional"
          icon={Briefcase}
          value={form.company}
          onChange={(v) => update("company", v)}
          placeholder="Your business name"
          autoComplete="organization"
          error={fieldErrors.company}
        />
        <TextField
          id="contact-website"
          label="Website"
          type="url"
          inputMode="url"
          hint="Optional"
          icon={Globe}
          value={form.website}
          onChange={(v) => update("website", v)}
          placeholder="yourbusiness.com"
          autoComplete="url"
          error={fieldErrors.website}
        />
        <SelectField
          id="contact-business-type"
          label="Business type"
          hint="Optional, helps us reply in context"
          icon={Briefcase}
          value={form.businessType}
          onChange={(v) => update("businessType", v)}
          options={businessTypeOptions}
          placeholder="Select an option"
        />
        <SelectField
          id="contact-current-stage"
          label="Where you are now"
          hint="Optional"
          icon={TrendingUp}
          value={form.currentStage}
          onChange={(v) => update("currentStage", v)}
          options={stageOptions}
          placeholder="Select an option"
        />
        <SelectField
          id="contact-main-goal"
          label="Your main goal"
          hint="Optional, the outcome that matters most right now"
          icon={Target}
          value={form.mainGoal}
          onChange={(v) => update("mainGoal", v)}
          options={goalOptions}
          placeholder="Select an option"
          className={styles.fullWidth}
        />
        <TextAreaField
          id="contact-message"
          label="Your message"
          required
          hint="Where your business is now, and what you'd like to achieve. Up to 1000 characters."
          value={form.message}
          onChange={(v) => update("message", v)}
          maxLength={MESSAGE_MAX}
          placeholder="For example: we run a small online shop. Traffic is steady but sales have stalled, and our email tool and store aren't joined up. Not sure what to fix first."
          error={fieldErrors.message}
          className={styles.fullWidth}
        />
      </div>

      <TurnstileField onToken={setTurnstileToken} onSkipped={() => setTurnstileSkipped(true)} />
      {turnstileSkipped ? (
        <p className={styles.hintNote}>
          Human verification isn&apos;t active in this preview. Your submission is still checked
          server-side.
        </p>
      ) : null}

      <div className={styles.actions}>
        <GlowButton
          type="submit"
          size="lg"
          block
          iconLeft={<Send size={18} aria-hidden="true" />}
          aria-busy={status === "submitting"}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send my goals"}
        </GlowButton>
        <p className={styles.reassure}>
          <ShieldCheck size={15} aria-hidden="true" className={styles.reassureIcon} />
          We&apos;ll reply by email. No obligation.
        </p>
        <p className={styles.consent}>
          By sending this, you agree we can reply to your enquiry. We&apos;ll never sell your
          details. See our <Link href="/privacy">Privacy Policy</Link>.
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
