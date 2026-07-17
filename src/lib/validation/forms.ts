/**
 * Shared Zod schemas for the site's two conversion forms — Growth Plan Builder and
 * Contact. Client and server import the SAME schema (contracts/forms-and-email.md):
 * client-side validation is UX only, server-side re-validation is the authority.
 */
import { z } from "zod";
import {
  ENGAGEMENT_OPTIONS,
  EXISTING_SETUP_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/growth-plan/types";

/**
 * Reject characters that let an attacker smuggle extra SMTP/mail headers (Bcc, Cc,
 * additional To lines) through a form field that gets forwarded into an email — the
 * classic "header injection" vector. Newlines, carriage returns, commas and semicolons
 * are all blocked in name/email fields per the forms-and-email contract.
 */
const HEADER_INJECTION_RE = /[\r\n,;]/;

const noHeaderInjection = <T extends z.ZodString>(schema: T, label: string) =>
  schema.refine(
    (v) => !HEADER_INJECTION_RE.test(v),
    `${label} cannot contain line breaks, commas or semicolons.`,
  );

/** Known contact subjects (includes the `?subject=growth-goals` deep-link target). */
export const CONTACT_SUBJECTS = ["growth-goals", "general", "services"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

const nameSchema = noHeaderInjection(
  z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters).")
    .max(80, "Name must be 80 characters or fewer."),
  "Name",
);

const emailSchema = noHeaderInjection(
  z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "Email address is too long.")
    .email("Please enter a valid email address."),
  "Email address",
);

/** Slug-shaped reference to a CMS-driven option (business type / stage / goal). The
 * builder's dropdowns are always populated from the actual content getters, so this only
 * needs to guard the *shape* — the route handler never invents an unknown slug's copy. */
const slugSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Please choose ${label}.`)
    .max(80, `That ${label} value is too long.`)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, `That ${label} value looks invalid.`);

/** Hidden anti-bot field (`_gotcha`). Must stay empty — any content trips a silent reject. */
const honeypotSchema = z.string().max(0, "Leave this field empty.").optional();

/** Optional website URL for the enquiry — pure context forwarded to the inbox, never
 * used as an email header, so only newline-smuggling needs guarding (not the full
 * comma/semicolon header set). Kept forgiving on format: people paste "acme.com" as
 * often as a full URL, and rejecting that would cost a genuine enquiry for no security
 * gain. Empty string is allowed (the client sends `undefined` when blank anyway). */
const websiteSchema = z
  .string()
  .trim()
  .max(200, "Website address must be 200 characters or fewer.")
  .refine((v) => !/[\r\n]/.test(v), "Website address cannot contain line breaks.")
  .optional();

/** Verified server-side against Cloudflare siteverify; optional here because an
 * unconfigured environment (no site key) never renders the widget. */
const turnstileTokenSchema = z.string().optional();

/** Milliseconds between the form mounting and submission — used for the human-timing
 * check (reject submissions faster than a human minimum). Optional so a client that
 * fails to compute it doesn't get a confusing validation error; the route treats a
 * missing value as suspicious rather than fatal. */
const elapsedMsSchema = z.number().int().nonnegative().optional();

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.enum(CONTACT_SUBJECTS, "Please choose a subject."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message must be 2000 characters or fewer."),
  company: z.string().trim().max(120, "Company must be 120 characters or fewer.").optional(),
  website: websiteSchema,
  _gotcha: honeypotSchema,
  turnstileToken: turnstileTokenSchema,
  elapsedMs: elapsedMsSchema,
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const growthPlanSchema = z.object({
  businessType: slugSchema("a business type"),
  currentStage: slugSchema("your current stage"),
  mainGoal: slugSchema("a main goal"),
  existingSetup: z.enum(EXISTING_SETUP_OPTIONS, "Please choose the option that fits best."),
  engagement: z.enum(ENGAGEMENT_OPTIONS, "Please choose an option."),
  timeline: z.enum(TIMELINE_OPTIONS, "Please choose your timeline."),
  name: nameSchema,
  email: emailSchema,
  message: z.string().trim().max(2000, "Message must be 2000 characters or fewer.").optional(),
  _gotcha: honeypotSchema,
  turnstileToken: turnstileTokenSchema,
  elapsedMs: elapsedMsSchema,
});
export type GrowthPlanFormValues = z.infer<typeof growthPlanSchema>;
