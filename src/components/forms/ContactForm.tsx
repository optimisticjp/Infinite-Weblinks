"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
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
  { value: "growth-goals", label: "Send us your growth goals" },
  { value: "general", label: "General enquiry" },
  { value: "services", label: "Ask about a service" },
];

interface FormState {
  name: string;
  email: string;
  subject: ContactSubject;
  company: string;
  message: string;
}

type Status = "idle" | "submitting" | "success" | "delivery-unavailable" | "error";

/**
 * Contact form — "Ask Our Team" / "Send Us Your Goals" (contracts/forms-and-email.md).
 * Honours `subject` for the `?subject=growth-goals` deep link from other CTAs across the
 * site. Delivers, via the internal Route Handler, to support@infiniteweblinks.com only;
 * the support-email fallback is always visible, never hidden behind a failure state.
 */
export function ContactForm({ subject, className }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: subject ?? "general",
    company: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSkipped, setTurnstileSkipped] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Captured in an effect (not during render) — Date.now() is impure and the
  // react-hooks purity rule disallows calling it directly in the render body.
  const mountedAt = useRef(0);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
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
      errorSummaryRef.current?.focus();
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
        setStatusMessage(data.message ?? "Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setStatus("delivery-unavailable");
      setStatusMessage(`We couldn't reach the server just now — please email ${supportEmail} and we'll pick it up.`);
    } finally {
      statusRef.current?.focus();
    }
  }

  const errorList = Object.entries(fieldErrors);

  if (status === "success") {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
        <div ref={statusRef} tabIndex={-1} role="status" className={styles.successBanner}>
          Thanks — your message is on its way. We reply by email, usually within a couple of working
          days.
        </div>
        <p className={styles.fallback}>
          Prefer email directly?{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </p>
      </div>
    );
  }

  return (
    <form className={[styles.wrap, className].filter(Boolean).join(" ")} onSubmit={handleSubmit} noValidate>
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

      {(status === "error" && errorList.length > 0) || status === "delivery-unavailable" ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className={status === "delivery-unavailable" ? styles.notice : styles.errorSummary}
        >
          {status === "delivery-unavailable" ? (
            statusMessage
          ) : (
            <>
              <p className={styles.errorSummaryHeading}>Please fix the following:</p>
              <ul>
                {errorList.map(([field, msg]) => (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
      {status === "error" && errorList.length === 0 && statusMessage ? (
        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className={styles.errorSummary}>
          {statusMessage}
        </div>
      ) : null}

      <div className={styles.grid}>
        <FormField label="Your name" required error={fieldErrors.name}>
          {(controlProps) => (
            <input
              {...controlProps}
              type="text"
              className={formFieldStyles.control}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoComplete="name"
            />
          )}
        </FormField>

        <FormField label="Email address" required error={fieldErrors.email}>
          {(controlProps) => (
            <input
              {...controlProps}
              type="email"
              className={formFieldStyles.control}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
            />
          )}
        </FormField>

        <FormField label="Company (optional)" error={fieldErrors.company}>
          {(controlProps) => (
            <input
              {...controlProps}
              type="text"
              className={formFieldStyles.control}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              autoComplete="organization"
            />
          )}
        </FormField>

        <FormField label="What's this about?" required error={fieldErrors.subject}>
          {(controlProps) => (
            <select
              {...controlProps}
              className={formFieldStyles.control}
              value={form.subject}
              onChange={(e) => update("subject", e.target.value as ContactSubject)}
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          label="Your message"
          required
          hint="10–2000 characters. Tell us as much or as little as you'd like."
          error={fieldErrors.message}
          className={styles.fullWidth}
        >
          {(controlProps) => (
            <textarea
              {...controlProps}
              className={formFieldStyles.control}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={6}
            />
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
        <Button type="submit" variant="primary" aria-busy={status === "submitting"} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
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
