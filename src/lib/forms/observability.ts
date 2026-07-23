import "server-only";

import type { FormName } from "./config.server";

/**
 * PII-SAFE form observability. The two form routes handle visitor names, emails, messages and a
 * Turnstile token; NONE of that may ever reach a log line. This module is the single, typed choke
 * point for form logging: its input type admits only a small set of non-identifying operational fields
 * and, via a `never` brand, makes any known PII/secret field a COMPILE error rather than a runtime
 * hope. Server-only (`import "server-only"`) so it can't be pulled into a client bundle.
 *
 * The sink is `console` — on Cloudflare Workers that is the native, captured log stream (`wrangler
 * tail` / dashboard). Every line is a single structured JSON object tagged `form`, correlated by the
 * per-request X-Request-ID, so an operator can trace a submission's lifecycle without any PII.
 */

/** The lifecycle stage of a submission (correlated by requestId; never carries PII). */
export type FormLifecycleEvent =
  | "received" // request accepted, about to run the gates
  | "rejected" // failed a gate (validation / honeypot / timing / rate-limit / turnstile)
  | "unavailable" // a required dependency was unavailable — failed closed (5xx)
  | "delivery-start" // about to POST to the email transport
  | "delivered" // transport accepted the submission
  | "delivery-failed"; // transport or network failed

/**
 * Fields that must NEVER be logged — visitor PII, message content, derived recommendation data, and
 * secrets/tokens. Typing them as `never` means a record literal carrying any of them fails to compile.
 */
type ForbiddenLogField =
  | "name"
  | "email"
  | "replyTo"
  | "company"
  | "website"
  | "message"
  | "subject"
  | "businessType"
  | "currentStage"
  | "mainGoal"
  | "existingSetup"
  | "engagement"
  | "timeline"
  | "recommendationSummary"
  | "matchedRuleId"
  | "ip"
  | "token"
  | "turnstileToken"
  | "secret"
  | "payload"
  | "body";

/** The only fields a form log line may carry. */
export interface FormLogRecord {
  form: FormName;
  /** The per-request correlation id (X-Request-ID) — a random UUID, no visitor data. */
  requestId: string;
  event: FormLifecycleEvent;
  /** A short machine code: a response `code`, a turnstile outcome, or a limiter backend. */
  outcome?: string;
  /** Upstream/HTTP status when relevant. */
  status?: number;
  /** Duration of an attempt in ms (delivery attempts). */
  durationMs?: number;
}

/** Brands `T` so any forbidden (PII/secret) property is `never` — passing one is a type error. */
type NoPii<T> = T & { [K in ForbiddenLogField]?: never };

/**
 * Emit one structured, PII-free lifecycle line. Only the whitelisted fields are ever serialised, so
 * even if a caller found a way past the type guard, no unexpected property is copied into the output.
 */
export function logFormEvent(record: NoPii<FormLogRecord>): void {
  const { form, requestId, event, outcome, status, durationMs } = record;
  const line: Record<string, unknown> = { tag: "form", form, requestId, event };
  if (outcome !== undefined) line.outcome = outcome;
  if (status !== undefined) line.status = status;
  if (typeof durationMs === "number") line.durationMs = durationMs;
  console.log(JSON.stringify(line));
}
