"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Briefcase,
  TrendingUp,
  Target,
  Monitor,
  Layers,
  Mail,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { FormField } from "@/components/forms/FormField";
import { IconTile } from "@/components/primitives/IconTile";
import { TurnstileField } from "@/components/forms/Turnstile";
import { GrowthPlanResult } from "./GrowthPlanResult";
import { resolve } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";
import {
  BUDGET_OPTIONS,
  ENGAGEMENT_OPTIONS,
  EXISTING_SETUP_OPTIONS,
  TIMELINE_OPTIONS,
  type Budget,
  type Engagement,
  type ExistingSetup,
  type Timeline,
  type GrowthPlanResult as GrowthPlanResultData,
} from "@/lib/growth-plan/types";
import { growthPlanSchema } from "@/lib/validation/forms";
import { supportEmail } from "@/lib/forms/config";
import formFieldStyles from "@/components/forms/FormField.module.css";
import type { BusinessType, Goal, GrowthStage } from "@/lib/content/types";
import styles from "./GrowthPlanBuilder.module.css";

interface GrowthPlanBuilderProps {
  businessTypes: BusinessType[];
  goals: Goal[];
  stages: GrowthStage[];
}

// Six steps (was eight): the four engine inputs, then one combined "scope" step
// (engagement + timeline + an optional budget band), then contact. The old standalone
// `timeline` and `review` steps are folded in — `review` becomes a compact summary shown on
// the contact step, and an earlier live plan preview appears once the engine inputs are set,
// so the visitor sees value before the email ask (review §6, brief §P2-03/§D-04).
type StepId =
  | "businessType"
  | "currentStage"
  | "mainGoal"
  | "existingSetup"
  | "scope"
  | "contact";

const STEP_ORDER: StepId[] = [
  "businessType",
  "currentStage",
  "mainGoal",
  "existingSetup",
  "scope",
  "contact",
];

const STEP_TITLES: Record<StepId, string> = {
  businessType: "What best describes your business?",
  currentStage: "Where are you right now?",
  mainGoal: "What's your main goal?",
  existingSetup: "What do you already have in place?",
  scope: "How much are you looking to take on?",
  contact: "See your plan and get a copy by email",
};

/** Short labels for the stepper + live tracker (the question above stays the long form). */
const STEP_SHORT: Record<StepId, string> = {
  businessType: "Business",
  currentStage: "Stage",
  mainGoal: "Goal",
  existingSetup: "Current setup",
  scope: "Scope",
  contact: "Your plan",
};

const STEP_SUBTITLE: Record<StepId, string> = {
  businessType: "Choose the option that fits you most.",
  currentStage: "This helps us pitch advice at the right level.",
  mainGoal: "Pick the outcome that matters most right now.",
  existingSetup: "Tell us what you already have running.",
  scope: "Scope, timing and — if you like — a rough budget band. Budget is optional.",
  contact: "Your plan is shown here now. Add your details to get a copy and a follow-up.",
};

const STEP_ICON: Record<StepId, LucideIcon> = {
  businessType: Briefcase,
  currentStage: TrendingUp,
  mainGoal: Target,
  existingSetup: Monitor,
  scope: Layers,
  contact: Mail,
};

const STEP_COLOR: Record<StepId, string> = {
  businessType: "var(--violet)",
  currentStage: "var(--pink)",
  mainGoal: "var(--orange)",
  existingSetup: "var(--cyan)",
  scope: "var(--lime)",
  contact: "var(--violet-bright)",
};

type StepState = "done" | "current" | "pending";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface FormState {
  businessType?: string;
  currentStage?: string;
  mainGoal?: string;
  existingSetup?: ExistingSetup;
  engagement?: Engagement;
  timeline?: Timeline;
  budget?: Budget;
  name: string;
  email: string;
  message: string;
}

const initialState: FormState = {
  businessType: undefined,
  currentStage: undefined,
  mainGoal: undefined,
  existingSetup: undefined,
  engagement: undefined,
  timeline: undefined,
  budget: undefined,
  name: "",
  email: "",
  message: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "delivery-unavailable" | "error";

interface StepMeta {
  businessTypeOptions: Option[];
  stageOptions: Option[];
  goalOptions: Option[];
}

function validateStep(step: StepId, form: FormState, meta: StepMeta): string | null {
  switch (step) {
    case "businessType":
      if (meta.businessTypeOptions.length > 0 && !form.businessType) {
        return "Please choose a business type to continue.";
      }
      return null;
    case "currentStage":
      if (meta.stageOptions.length > 0 && !form.currentStage) {
        return "Please choose your current stage to continue.";
      }
      return null;
    case "mainGoal":
      if (meta.goalOptions.length > 0 && !form.mainGoal) {
        return "Please choose a main goal to continue.";
      }
      return null;
    case "existingSetup":
      if (!form.existingSetup) return "Please choose the option that fits best.";
      return null;
    case "scope":
      // Engagement + timeline are required; budget is intentionally optional (skippable).
      if (!form.engagement) return "Please choose how much you're looking to take on.";
      if (!form.timeline) return "Please choose your timeline.";
      return null;
    case "contact":
      if (form.name.trim().length < 2) return "Please enter your name (at least 2 characters).";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return "Please enter a valid email address.";
      }
      return null;
    default:
      return null;
  }
}

function OptionGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  emptyNote,
}: {
  legend: string;
  name: string;
  options: Option[];
  value?: string;
  onChange: (v: string) => void;
  error?: string | null;
  emptyNote?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {options.length === 0 ? (
        <p className={styles.emptyNote}>{emptyNote ?? "Options are being finalised — you can continue."}</p>
      ) : (
        <div className={styles.optionGrid} role="group" aria-describedby={errorId}>
          {options.map((opt) => {
            const id = `${name}-${opt.value}`;
            const checked = value === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                className={[styles.optionCard, checked ? styles.optionCardChecked : ""].join(" ")}
              >
                <input
                  type="radio"
                  id={id}
                  name={name}
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChange(opt.value)}
                  className={styles.optionInput}
                />
                <span className={styles.optionCheck} aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className={styles.optionLabel}>{opt.label}</span>
                {opt.description ? <span className={styles.optionDescription}>{opt.description}</span> : null}
              </label>
            );
          })}
        </div>
      )}
      {error ? (
        <p id={errorId} className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

const PREVIEW_TIERS: { key: "startHere" | "connectNext" | "addLater"; label: string; accent: string }[] = [
  { key: "startHere", label: "Now", accent: "var(--lime)" },
  { key: "connectNext", label: "Next", accent: "var(--cyan)" },
  { key: "addLater", label: "Later", accent: "var(--violet)" },
];

/**
 * LivePlanPreview — the earlier, real "plan taking shape" (brief §P2-03/§REF-09/§REF-14).
 * Renders the SAME deterministic recommendation the server will recompute, as a prioritised
 * Now / Next / Later summary, so the visitor sees genuine value before the contact/email ask.
 * This is real recommendation data (never fabricated) — the full result view adds the rest.
 */
function LivePlanPreview({
  result,
  heading = "Your plan so far",
}: {
  result: GrowthPlanResultData;
  heading?: string;
}) {
  return (
    <div className={styles.livePreview} role="group" aria-label={heading}>
      <p className={styles.livePreviewTitle}>{heading}</p>
      <ol className={styles.livePreviewTiers}>
        {PREVIEW_TIERS.map((tier) => {
          const items = result[tier.key];
          if (!items || items.length === 0) return null;
          return (
            <li
              key={tier.key}
              className={styles.livePreviewTier}
              style={{ ["--tier" as string]: tier.accent }}
            >
              <span className={styles.livePreviewTierLabel}>{tier.label}</span>
              <ul className={styles.livePreviewItems}>
                {items.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Growth Plan Builder — guided multi-step form (contracts/growth-plan-rules.md /
 * forms-and-email.md). It is a form backed by the reviewed rules engine, NOT a free AI
 * recommendation tool: `resolve()` runs locally against the same rule set the server
 * uses, so the visitor sees their result immediately, then the submission is posted for
 * the team to follow up on. `matchedRuleId` / scoring internals are never shown.
 */
export function GrowthPlanBuilder({ businessTypes, goals, stages }: GrowthPlanBuilderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GrowthPlanResultData | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSkipped, setTurnstileSkipped] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Captured in an effect (not during render) — Date.now() is impure and the
  // react-hooks purity rule disallows calling it directly in the render body.
  const mountedAt = useRef(0);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const businessTypeOptions = useMemo<Option[]>(
    () => businessTypes.map((b) => ({ value: b.slug, label: b.name, description: b.summary })),
    [businessTypes],
  );
  const stageOptions = useMemo<Option[]>(
    () => stages.map((s) => ({ value: s.slug, label: s.name, description: s.summary })),
    [stages],
  );
  const goalOptions = useMemo<Option[]>(
    () => goals.map((g) => ({ value: g.slug, label: g.title, description: g.whatYouNeed })),
    [goals],
  );
  const existingSetupOptions = useMemo<Option[]>(
    () => EXISTING_SETUP_OPTIONS.map((v) => ({ value: v, label: v })),
    [],
  );
  const engagementOptions = useMemo<Option[]>(() => ENGAGEMENT_OPTIONS.map((v) => ({ value: v, label: v })), []);
  const timelineOptions = useMemo<Option[]>(() => TIMELINE_OPTIONS.map((v) => ({ value: v, label: v })), []);
  const budgetOptions = useMemo<Option[]>(() => BUDGET_OPTIONS.map((v) => ({ value: v, label: v })), []);

  const stepMeta: StepMeta = { businessTypeOptions, stageOptions, goalOptions };
  const step = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;
  const isLastInputStep = step === "contact";

  // Earlier value: once the four engine inputs are set, compute the SAME deterministic plan
  // the server will recompute, so a live preview can appear before the contact/email ask
  // (review §6, brief §P2-03/§REF-09/§REF-14). engagement/timeline/budget don't affect it.
  const previewResult = useMemo<GrowthPlanResultData | null>(() => {
    if (!form.businessType || !form.currentStage || !form.mainGoal || !form.existingSetup) {
      return null;
    }
    return resolve(
      {
        businessType: form.businessType,
        currentStage: form.currentStage,
        mainGoal: form.mainGoal,
        existingSetup: form.existingSetup,
      },
      growthPlanRuleSet,
    );
  }, [form.businessType, form.currentStage, form.mainGoal, form.existingSetup]);

  // Record the mount time (for the human-timing anti-bot check) once, after first
  // render rather than during it.
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // No auto-advance: this only runs when stepIndex changes via an explicit Back/Next
  // click, moving focus to the new step's heading so keyboard/SR users land on it.
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goNext() {
    const error = validateStep(step, form, stepMeta);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }

  function goBack() {
    setStepError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function buildAgain() {
    setForm(initialState);
    setStepIndex(0);
    setStepError(null);
    setSubmitErrors([]);
    setStatus("idle");
    setStatusMessage(null);
    setResult(null);
    setHoneypot("");
    mountedAt.current = Date.now();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step !== "contact") return;

    const elapsedMs = Date.now() - mountedAt.current;
    const candidate = {
      businessType: form.businessType,
      currentStage: form.currentStage,
      mainGoal: form.mainGoal,
      existingSetup: form.existingSetup,
      engagement: form.engagement,
      timeline: form.timeline,
      budget: form.budget,
      name: form.name,
      email: form.email,
      message: form.message.trim() ? form.message : undefined,
      _gotcha: honeypot,
      turnstileToken: turnstileToken ?? undefined,
      elapsedMs,
    };

    const parsed = growthPlanSchema.safeParse(candidate);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const messages = Object.entries(flat).flatMap(([field, msgs]) =>
        (msgs ?? []).map((m) => `${field}: ${m}`),
      );
      setSubmitErrors(messages);
      setStatus("error");
      errorSummaryRef.current?.focus();
      return;
    }

    setSubmitErrors([]);
    setStatus("submitting");

    // Pure, deterministic — the visitor sees exactly what the server will recompute and
    // forward to the team (contracts/growth-plan-rules.md).
    const localResult = resolve(
      {
        businessType: parsed.data.businessType,
        currentStage: parsed.data.currentStage,
        mainGoal: parsed.data.mainGoal,
        existingSetup: parsed.data.existingSetup,
      },
      growthPlanRuleSet,
    );
    setResult(localResult);

    try {
      const res = await fetch("/api/forms/growth-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: {
        ok: boolean;
        code?: string;
        message?: string;
      } = await res.json();

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
    }
  }

  const showResult = result && (status === "success" || status === "delivery-unavailable");

  if (showResult) {
    return (
      <div className={styles.wrap}>
        <div
          role="status"
          className={status === "success" ? styles.successBanner : styles.notice}
        >
          {status === "success"
            ? "Thanks — your enquiry is on its way. We'll reply by email."
            : statusMessage}
        </div>
        <GrowthPlanResult result={result} onBuildAgain={buildAgain} />
      </div>
    );
  }

  function stateFor(i: number): StepState {
    return i < stepIndex ? "done" : i === stepIndex ? "current" : "pending";
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit} noValidate>
      {/* Honeypot: hidden from sighted and keyboard users, must stay empty. */}
      <div className={styles.honeypotWrap} aria-hidden="true">
        <label htmlFor="growth-plan-company">Leave this field blank</label>
        <input
          id="growth-plan-company"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className={styles.visuallyHidden} aria-live="polite">
        {`Step ${stepIndex + 1} of ${totalSteps}: ${STEP_TITLES[step]}`}
      </div>

      {/* Numbered step indicator (wide screens) — decorative; progress is announced above. */}
      <ol className={styles.stepper} aria-hidden="true">
        {STEP_ORDER.map((s, i) => {
          const state = stateFor(i);
          return (
            <li key={s} className={`${styles.stepperItem} ${styles[state]}`}>
              <span className={styles.stepperNode}>
                {state === "done" ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={styles.stepperLabel}>{STEP_SHORT[s]}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.columns}>
        <div className={styles.main}>
          {/* Compact progress (narrow screens) */}
          <div className={styles.progressRow} aria-hidden="true">
            <p className={styles.progressLabel}>
              Step {stepIndex + 1} of {totalSteps}
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ transform: `scaleX(${(stepIndex + 1) / totalSteps})` }}
              />
            </div>
          </div>

          <div className={styles.stepHead}>
            <p className={styles.questionMeta}>
              Step {stepIndex + 1} of {totalSteps}
            </p>
            <h2 className={styles.stepHeading} tabIndex={-1} ref={stepHeadingRef}>
              {STEP_TITLES[step]}
            </h2>
            <p className={styles.stepSubtitle}>{STEP_SUBTITLE[step]}</p>
          </div>

          {status === "error" && submitErrors.length > 0 ? (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className={styles.errorSummary}
              aria-labelledby="growth-plan-error-summary-heading"
            >
              <p id="growth-plan-error-summary-heading" className={styles.errorSummaryHeading}>
                Please fix the following before we can send your enquiry:
              </p>
              <ul>
                {submitErrors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.stepBody}>
            {step === "businessType" && (
              <OptionGroup
                legend="Business type"
                name="businessType"
                options={businessTypeOptions}
                value={form.businessType}
                onChange={(v) => update("businessType", v)}
                error={stepError}
              />
            )}
            {step === "currentStage" && (
              <OptionGroup
                legend="Current stage"
                name="currentStage"
                options={stageOptions}
                value={form.currentStage}
                onChange={(v) => update("currentStage", v)}
                error={stepError}
              />
            )}
            {step === "mainGoal" && (
              <OptionGroup
                legend="Main goal"
                name="mainGoal"
                options={goalOptions}
                value={form.mainGoal}
                onChange={(v) => update("mainGoal", v)}
                error={stepError}
              />
            )}
            {step === "existingSetup" && (
              <OptionGroup
                legend="Existing setup"
                name="existingSetup"
                options={existingSetupOptions}
                value={form.existingSetup}
                onChange={(v) => update("existingSetup", v as ExistingSetup)}
                error={stepError}
              />
            )}
            {step === "scope" && (
              <div className={styles.scopeStack}>
                <OptionGroup
                  legend="How much are you looking to take on?"
                  name="engagement"
                  options={engagementOptions}
                  value={form.engagement}
                  onChange={(v) => update("engagement", v as Engagement)}
                  error={stepError && !form.engagement ? stepError : null}
                />
                <OptionGroup
                  legend="What's your timeline?"
                  name="timeline"
                  options={timelineOptions}
                  value={form.timeline}
                  onChange={(v) => update("timeline", v as Timeline)}
                  error={stepError && form.engagement && !form.timeline ? stepError : null}
                />
                <OptionGroup
                  legend="Rough budget band (optional — you can skip this)"
                  name="budget"
                  options={budgetOptions}
                  value={form.budget}
                  onChange={(v) => update("budget", v as Budget)}
                />
                {previewResult ? <LivePlanPreview result={previewResult} /> : null}
              </div>
            )}
            {step === "contact" && (
              <div className={styles.contactStack}>
                {previewResult ? (
                  <LivePlanPreview result={previewResult} heading="Your plan is ready" />
                ) : null}
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Get your plan by email</legend>
                  <p className={styles.contactHint}>
                    Your plan is shown above. Add your details and we&apos;ll email you a copy and a
                    practical next step. Your email is never shared or sold.
                  </p>
                  <div className={styles.contactGrid}>
                    <FormField label="Your name" required>
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
                    <FormField label="Email address" required hint="We'll reply here, never shared or sold.">
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
                    <FormField label="Anything else? (optional)" hint="Up to 2000 characters.">
                      {(controlProps) => (
                        <textarea
                          {...controlProps}
                          className={formFieldStyles.control}
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                          rows={4}
                        />
                      )}
                    </FormField>
                  </div>
                  {stepError ? (
                    <p className={styles.fieldError} role="alert">
                      {stepError}
                    </p>
                  ) : null}

                  <details className={styles.reviewSummary}>
                    <summary className={styles.reviewSummaryToggle}>Review your answers</summary>
                    <dl className={styles.reviewList}>
                      <div>
                        <dt>Business type</dt>
                        <dd>{businessTypeOptions.find((o) => o.value === form.businessType)?.label ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Current stage</dt>
                        <dd>{stageOptions.find((o) => o.value === form.currentStage)?.label ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Main goal</dt>
                        <dd>{goalOptions.find((o) => o.value === form.mainGoal)?.label ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Existing setup</dt>
                        <dd>{form.existingSetup ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Scope</dt>
                        <dd>{form.engagement ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Timeline</dt>
                        <dd>{form.timeline ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Budget band</dt>
                        <dd>{form.budget ?? "Not specified"}</dd>
                      </div>
                    </dl>
                  </details>

                  <TurnstileField
                    onToken={setTurnstileToken}
                    onSkipped={() => setTurnstileSkipped(true)}
                  />
                  {turnstileSkipped ? (
                    <p className={styles.emptyNote}>
                      Human verification isn&apos;t active in this preview — your submission is still
                      checked server-side.
                    </p>
                  ) : null}
                </fieldset>
              </div>
            )}
          </div>

          <div className={styles.navRow}>
            {stepIndex > 0 ? (
              <Button type="button" variant="secondary" onClick={goBack} iconLeft={<ArrowLeft size={18} aria-hidden="true" />}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {!isLastInputStep ? (
              <Button type="button" variant="primary" onClick={goNext} iconRight={<ArrowRight size={18} aria-hidden="true" />}>
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary" aria-busy={status === "submitting"} disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Email me my plan"}
              </Button>
            )}
          </div>
        </div>

        {/* Live tracker — decorative mirror of the announced progress. */}
        <aside className={styles.tracker} aria-hidden="true">
          <p className={styles.trackerTitle}>Your plan is taking shape</p>
          <p className={styles.trackerLead}>
            Your answers help us understand your business so we can map the right path.
          </p>
          <ol className={styles.trackerList}>
            {STEP_ORDER.map((s, i) => {
              const state = stateFor(i);
              const StepGlyph = STEP_ICON[s];
              return (
                <li key={s} className={styles.trackerRow}>
                  <IconTile size={34} color={STEP_COLOR[s]}>
                    <StepGlyph aria-hidden="true" />
                  </IconTile>
                  <span className={styles.trackerLabel}>{STEP_SHORT[s]}</span>
                  <span className={`${styles.trackerStatus} ${styles[`status_${state}`]}`}>
                    {state === "done" ? "Done" : state === "current" ? "In progress" : "Pending"}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className={styles.safeNote}>
            <ShieldCheck size={18} aria-hidden="true" className={styles.safeIcon} />
            <span>
              <strong className={styles.safeTitle}>Your information is safe.</strong> We&apos;ll never
              share your details.
            </span>
          </div>
        </aside>
      </div>
    </form>
  );
}
