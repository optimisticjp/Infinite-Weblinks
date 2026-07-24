import "server-only";

/**
 * Server-side forwarding to Formspree — the only email transport in v1
 * (contracts/forms-and-email.md). Formspree is configured (in the Formspree dashboard,
 * not here) to deliver every submission to support@infiniteweblinks.com only; this
 * module never talks to any other recipient and never runs client-side.
 *
 * ONE attempt, bounded by `FORMSPREE_TIMEOUT_MS` (AbortController). It NEVER retries a POST — a
 * blind retry could send the visitor's enquiry twice — and it NEVER claims a delivery that didn't
 * happen. Returns a typed outcome plus the attempt duration, and (when a requestId is supplied)
 * emits PII-free delivery lifecycle logs.
 */
import {
  FORMSPREE_TIMEOUT_MS,
  deliveryEnabled,
  formspreeIdFor,
  type FormName,
} from "./config.server";
import { logFormEvent } from "./observability";

/** Same anti header-injection guard as the shared Zod schemas — belt and braces, since
 * this is the last stop before an email actually gets sent. Only applied to fields that
 * become email HEADERS (reply-to / from-name); body fields like `message` legitimately
 * contain newlines and are left alone. */
const HEADER_INJECTION_RE = /[\r\n]/;
const EMAIL_LIKE_FIELDS = ["email", "replyTo", "name"];

export type FormspreeOutcome =
  "delivered" | "not-configured" | "invalid-field" | "timeout" | "http-error" | "network-error";

export interface FormspreeResult {
  delivered: boolean;
  outcome: FormspreeOutcome;
  /** HTTP status for the "http-error" outcome. */
  status?: number;
  /** Wall-clock spent on the delivery attempt (ms) — populated once a POST is actually made. */
  durationMs?: number;
  /** Short reason string, kept for log correlation and back-compat (e.g. "formspree-http-500"). */
  reason?: string;
}

export interface ForwardOptions {
  /** Per-request correlation id (X-Request-ID). When present, delivery lifecycle events are logged. */
  requestId?: string;
}

function sanitiseValue(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

/**
 * Forward a validated payload to the given form's Formspree endpoint. Returns
 * `{delivered:false, outcome:"not-configured"}` — never a false positive — when the form's Formspree
 * id isn't set for this environment (contract: never claim delivery that didn't happen).
 */
export async function forwardToFormspree(
  form: FormName,
  payload: Record<string, unknown>,
  options: ForwardOptions = {},
): Promise<FormspreeResult> {
  const { requestId } = options;
  const log = (
    event: "delivery-start" | "delivered" | "delivery-failed",
    extra?: { outcome?: string; status?: number; durationMs?: number },
  ) => {
    if (requestId) logFormEvent({ form, requestId, event, ...extra });
  };

  const formId = formspreeIdFor(form);
  if (!deliveryEnabled(form) || !formId) {
    return { delivered: false, outcome: "not-configured", reason: "not-configured" };
  }

  for (const key of EMAIL_LIKE_FIELDS) {
    const value = payload[key];
    if (typeof value === "string" && HEADER_INJECTION_RE.test(value)) {
      // A header-injection attempt never becomes an email and is not a transport failure.
      return { delivered: false, outcome: "invalid-field", reason: "invalid-field" };
    }
  }

  const sanitised: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    sanitised[key] = sanitiseValue(value);
  }

  log("delivery-start");
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORMSPREE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(sanitised),
      signal: controller.signal,
    });
  } catch {
    const durationMs = Date.now() - startedAt;
    // Our own timeout vs. a transport error. Either way ONE attempt only — no blind retry.
    const outcome: FormspreeOutcome = controller.signal.aborted ? "timeout" : "network-error";
    log("delivery-failed", { outcome, durationMs });
    return { delivered: false, outcome, durationMs, reason: outcome };
  } finally {
    clearTimeout(timer);
  }

  const durationMs = Date.now() - startedAt;
  if (!res.ok) {
    log("delivery-failed", { outcome: "http-error", status: res.status, durationMs });
    return {
      delivered: false,
      outcome: "http-error",
      status: res.status,
      durationMs,
      reason: `formspree-http-${res.status}`,
    };
  }

  log("delivered", { durationMs });
  return { delivered: true, outcome: "delivered", durationMs, reason: "delivered" };
}
