"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Send,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Stepper } from "@/components/primitives/Stepper";
import { ProgressChecklist, type ChecklistItem } from "@/components/primitives/ProgressChecklist";
import { OptionCards, type CardOption } from "@/components/primitives/OptionCards";
import { GlowButton } from "@/components/primitives/GlowButton";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { TextField } from "@/components/forms/fields/TextField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { TurnstileField } from "@/components/forms/Turnstile";
import { PlanReveal } from "./PlanReveal";
import { resolve } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";
import { growthPlanSchema } from "@/lib/validation/forms";
import {
  ENGAGEMENT_OPTIONS,
  EXISTING_SETUP_OPTIONS,
  TIMELINE_OPTIONS,
  type Engagement,
  type ExistingSetup,
  type Timeline,
  type GrowthPlanResult,
} from "@/lib/growth-plan/types";
import { supportEmail } from "@/lib/forms/config";
import type { BusinessType, Goal } from "@/lib/content/types";
import styles from "./PlanBuilder.module.css";

interface PlanBuilderProps {
  businessTypes: BusinessType[];
  goals: Goal[];
}

interface FormState {
  businessType?: string;
  mainGoal?: string;
  existingSetup?: ExistingSetup;
  engagement?: Engagement;
  timeline?: Timeline;
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
}

const STEP_META = [
  {
    short: "Business",
    title: "What best describes your business?",
    subtitle: "Pick the closest fit. It shapes the plan, it isn't a label.",
    next: "Continue to my goal",
  },
  {
    short: "Goal",
    title: "What's your main goal right now?",
    subtitle: "The one outcome that matters most today. You can change direction later.",
    next: "Continue to my setup",
  },
  {
    short: "Setup",
    title: "What do you already have in place?",
    subtitle: "So the plan starts from where you actually are.",
    next: "Continue to the last step",
  },
  {
    short: "How we'd work",
    title: "How would you like to work together?",
    subtitle: "There's no wrong answer. It just helps us shape the plan to what you can take on.",
    next: "See my plan",
  },
];

type Status = "idle" | "submitting" | "success" | "delivery-unavailable" | "error";
type FieldErrors = Partial<Record<keyof FormState, string>>;

/**
 * PlanBuilder — the Growth Plan Builder. Four short steps of selectable cards, then a plan
 * generated client-side by the same deterministic rules engine the server re-runs. The plan
 * shows on screen with no account and no email required; an optional email form on the plan
 * screen sends it through the existing Formspree + Turnstile route. All answers live in React
 * state only (no storage, no backend at build time).
 */
export function PlanBuilder({ businessTypes, goals }: PlanBuilderProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    website: "",
    message: "",
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"form" | "plan">("form");
  const [stepErrors, setStepErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<GrowthPlanResult | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSkipped, setTurnstileSkipped] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const mountedAt = useRef(0);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const planHeadingRef = useRef<HTMLDivElement | null>(null);
  const emailStatusRef = useRef<HTMLDivElement | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Focus the new step's heading on Back/Continue (keyboard/SR users land on it).
  useEffect(() => {
    if (phase === "form") stepHeadingRef.current?.focus();
  }, [stepIndex, phase]);

  // Focus the email-form outcome after it renders.
  useEffect(() => {
    if (focusSignal === 0) return;
    emailStatusRef.current?.focus();
  }, [focusSignal]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setStepErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  const businessTypeOptions: CardOption[] = businessTypes.map((b) => ({
    value: b.slug,
    label: b.name,
    description: b.summary,
  }));
  const goalOptions: CardOption[] = goals.map((g) => ({
    value: g.slug,
    label: g.title,
    color: g.color,
    icon: g.icon,
  }));
  const setupOptions: CardOption[] = EXISTING_SETUP_OPTIONS.map((v) => ({ value: v, label: v }));
  const engagementOptions: CardOption[] = ENGAGEMENT_OPTIONS.map((v) => ({ value: v, label: v }));
  const timelineOptions: CardOption[] = TIMELINE_OPTIONS.map((v) => ({ value: v, label: v }));

  function validateStep(i: number): FieldErrors {
    const e: FieldErrors = {};
    if (i === 0 && !form.businessType) e.businessType = "Please choose the option that fits best.";
    if (i === 1 && !form.mainGoal) e.mainGoal = "Please choose your main goal.";
    if (i === 2 && !form.existingSetup) e.existingSetup = "Please choose what you have in place.";
    if (i === 3) {
      if (!form.engagement) e.engagement = "Please choose an option.";
      if (!form.timeline) e.timeline = "Please choose your timeline.";
    }
    return e;
  }

  function focusFirstError(e: FieldErrors) {
    const first = (["businessType", "mainGoal", "existingSetup", "engagement", "timeline"] as const).find(
      (k) => e[k],
    );
    if (first) {
      const el = document.querySelector<HTMLInputElement>(`input[name="${first}"]`);
      el?.focus();
    }
  }

  function goNext() {
    const e = validateStep(stepIndex);
    if (Object.keys(e).length > 0) {
      setStepErrors(e);
      focusFirstError(e);
      return;
    }
    setStepErrors({});
    if (stepIndex < STEP_META.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    // Last step → generate the plan (client-side, no email needed).
    const res = resolve(
      {
        businessType: form.businessType,
        mainGoal: form.mainGoal,
        existingSetup: form.existingSetup,
      },
      growthPlanRuleSet,
    );
    setResult(res);
    setPhase("plan");
    requestAnimationFrame(() => planHeadingRef.current?.focus());
  }

  function goBack() {
    setStepErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function buildAgain() {
    setForm({ name: "", email: "", company: "", website: "", message: "" });
    setStepIndex(0);
    setPhase("form");
    setResult(null);
    setStepErrors({});
    setFieldErrors({});
    setStatus("idle");
    setStatusMessage(null);
    setHoneypot("");
    mountedAt.current = Date.now();
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const elapsedMs = Date.now() - mountedAt.current;
    const parsed = growthPlanSchema.safeParse({
      businessType: form.businessType,
      mainGoal: form.mainGoal,
      existingSetup: form.existingSetup,
      engagement: form.engagement,
      timeline: form.timeline,
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      website: form.website || undefined,
      message: form.message || undefined,
      _gotcha: honeypot,
      turnstileToken: turnstileToken ?? undefined,
      elapsedMs,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      for (const [field, msgs] of Object.entries(flat)) {
        if (msgs && msgs[0]) next[field as keyof FormState] = msgs[0];
      }
      setFieldErrors(next);
      setStatus("error");
      setStatusMessage("Please check your details and try again.");
      setFocusSignal((s) => s + 1);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/forms/growth-plan", {
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
        setStatusMessage(data.message ?? "Something went wrong. Please try again, or email us directly.");
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

  const checklist: ChecklistItem[] = STEP_META.map((s, i) => ({
    label: s.short,
    state: phase === "plan" || i < stepIndex ? "done" : i === stepIndex ? "current" : "pending",
  }));

  // ---- Plan phase ----
  if (phase === "plan" && result) {
    return (
      <div className={styles.builder}>
        <div ref={planHeadingRef} tabIndex={-1} className={styles.planRegion} role="region" aria-label="Your growth plan">
          <PlanReveal result={result} />
        </div>

        <div className={styles.emailCard}>
          {status === "success" ? (
            <div ref={emailStatusRef} tabIndex={-1} role="status" className={styles.success}>
              <span className={styles.successMark} aria-hidden="true">
                <InfinityMark size={64} luminous />
              </span>
              <h3 className={styles.successTitle}>Thanks, your plan is on its way.</h3>
              <p className={styles.successBody}>
                We&apos;ve sent this plan to your email and a real person will follow up with a
                practical next step. No obligation.
              </p>
            </div>
          ) : (
            <form className={styles.emailForm} onSubmit={handleEmailSubmit} noValidate>
              <div className={styles.honeypotWrap} aria-hidden="true">
                <label htmlFor="gp-company-check">Leave this field blank</label>
                <input
                  id="gp-company-check"
                  name="_gotcha"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(ev) => setHoneypot(ev.target.value)}
                />
              </div>

              <div className={styles.emailHead}>
                <h3 className={styles.emailTitle}>Get this plan by email</h3>
                <p className={styles.emailSub}>
                  Want a copy to keep, and a practical next step from a real person? Add your details.
                  The plan above is yours either way.
                </p>
              </div>

              {(status === "delivery-unavailable" || status === "error") && statusMessage ? (
                <div ref={emailStatusRef} tabIndex={-1} role="alert" className={styles.notice}>
                  {statusMessage}
                </div>
              ) : null}

              <p className={styles.requiredNote}>
                Fields marked <span className={styles.req} aria-hidden="true">*</span> are required.
              </p>

              <div className={styles.emailGrid}>
                <TextField
                  id="gp-name"
                  label="Your name"
                  required
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  autoComplete="name"
                  placeholder="Your name"
                  error={fieldErrors.name}
                />
                <TextField
                  id="gp-email"
                  label="Email"
                  type="email"
                  inputMode="email"
                  required
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  autoComplete="email"
                  placeholder="you@yourbusiness.com"
                  error={fieldErrors.email}
                />
                <TextField
                  id="gp-business"
                  label="Business name"
                  hint="Optional"
                  value={form.company}
                  onChange={(v) => update("company", v)}
                  autoComplete="organization"
                  placeholder="Your business name"
                  error={fieldErrors.company}
                />
                <TextField
                  id="gp-website"
                  label="Website"
                  type="url"
                  inputMode="url"
                  hint="Optional"
                  value={form.website}
                  onChange={(v) => update("website", v)}
                  autoComplete="url"
                  placeholder="yourbusiness.com"
                  error={fieldErrors.website}
                />
                <TextAreaField
                  id="gp-message"
                  label="Anything else?"
                  hint="Optional. Anything that would help us tailor the plan."
                  value={form.message}
                  onChange={(v) => update("message", v)}
                  maxLength={2000}
                  rows={4}
                  className={styles.fullWidth}
                  error={fieldErrors.message}
                />
              </div>

              <TurnstileField onToken={setTurnstileToken} onSkipped={() => setTurnstileSkipped(true)} />
              {turnstileSkipped ? (
                <p className={styles.skipNote}>
                  Human verification isn&apos;t active in this preview. Your submission is still
                  checked server-side.
                </p>
              ) : null}

              <div className={styles.emailActions}>
                <GlowButton
                  type="submit"
                  size="lg"
                  block
                  iconLeft={<Send size={18} aria-hidden="true" />}
                  aria-busy={status === "submitting"}
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : "Send my plan by email"}
                </GlowButton>
                <p className={styles.reassure}>
                  <ShieldCheck size={15} aria-hidden="true" className={styles.reassureIcon} />
                  Your information is safe. We&apos;ll never share your details.
                </p>
              </div>
            </form>
          )}

          <div className={styles.planCtas}>
            <Link href="/services" className={styles.planLink}>
              Explore the services in your plan
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.planLink}>
              Talk it through with us
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <button type="button" className={styles.buildAgain} onClick={buildAgain}>
              <RotateCcw size={15} aria-hidden="true" />
              Start again
            </button>
          </div>
          <p className={styles.fallback}>
            Prefer email directly?{" "}
            <a href={`mailto:${supportEmail}`}>
              <Mail size={14} aria-hidden="true" className={styles.mailIcon} />
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ---- Form phase ----
  const meta = STEP_META[stepIndex];
  return (
    <div className={styles.builder}>
      <Stepper steps={STEP_META.map((s) => s.short)} current={stepIndex} ariaLabel="Growth plan steps" className={styles.stepper} />

      <div className={styles.columns}>
        <div className={styles.main}>
          <div className={styles.stepHead}>
            {/* The visible counter is aria-hidden because its text is folded into the heading
                below, so focus landing on the heading announces "Step N of M: <title>" once. */}
            <p className={styles.stepMeta} aria-hidden="true">
              Step {stepIndex + 1} of {STEP_META.length}
            </p>
            <h2 className={styles.stepHeading} tabIndex={-1} ref={stepHeadingRef}>
              <span className="iw-visually-hidden">
                Step {stepIndex + 1} of {STEP_META.length}:{" "}
              </span>
              {meta.title}
            </h2>
            <p className={styles.stepSubtitle}>{meta.subtitle}</p>
          </div>

          <div className={styles.stepBody}>
            {stepIndex === 0 && (
              <OptionCards
                legend="Business type"
                name="businessType"
                columns={2}
                options={businessTypeOptions}
                value={form.businessType}
                onChange={(v) => update("businessType", v)}
                error={stepErrors.businessType}
              />
            )}
            {stepIndex === 1 && (
              <OptionCards
                legend="Main goal"
                name="mainGoal"
                columns={3}
                options={goalOptions}
                value={form.mainGoal}
                onChange={(v) => update("mainGoal", v)}
                error={stepErrors.mainGoal}
              />
            )}
            {stepIndex === 2 && (
              <OptionCards
                legend="What you have now"
                name="existingSetup"
                columns={2}
                options={setupOptions}
                value={form.existingSetup}
                onChange={(v) => update("existingSetup", v as ExistingSetup)}
                error={stepErrors.existingSetup}
              />
            )}
            {stepIndex === 3 && (
              <div className={styles.twoGroups}>
                <OptionCards
                  legend="How much would you like to take on?"
                  name="engagement"
                  columns={2}
                  options={engagementOptions}
                  value={form.engagement}
                  onChange={(v) => update("engagement", v as Engagement)}
                  error={stepErrors.engagement}
                />
                <OptionCards
                  legend="What's your timeline?"
                  name="timeline"
                  columns={2}
                  options={timelineOptions}
                  value={form.timeline}
                  onChange={(v) => update("timeline", v as Timeline)}
                  error={stepErrors.timeline}
                />
              </div>
            )}
          </div>

          <div className={styles.nav}>
            {stepIndex > 0 ? (
              <GlowButton
                type="button"
                variant="ghost"
                onClick={goBack}
                iconLeft={<ArrowLeft size={18} aria-hidden="true" />}
              >
                Back
              </GlowButton>
            ) : (
              <span />
            )}
            <GlowButton
              type="button"
              onClick={goNext}
              iconRight={<ArrowRight size={18} aria-hidden="true" />}
            >
              {meta.next}
            </GlowButton>
          </div>
        </div>

        <ProgressChecklist
          className={styles.sidebar}
          title="Your plan is taking shape"
          items={checklist}
          note="Your information is safe. We'll never share your details."
        />
      </div>
    </div>
  );
}
