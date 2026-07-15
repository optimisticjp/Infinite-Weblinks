/**
 * Server-side forwarding to Formspree — the only email transport in v1
 * (contracts/forms-and-email.md). Formspree is configured (in the Formspree dashboard,
 * not here) to deliver every submission to support@infiniteweblinks.com only; this
 * module never talks to any other recipient and never runs client-side.
 */
import { deliveryEnabled, formspreeIdFor, type FormName } from "./config";

/** Same anti header-injection guard as the shared Zod schemas — belt and braces, since
 * this is the last stop before an email actually gets sent. Only applied to fields that
 * become email HEADERS (reply-to / from-name); body fields like `message` legitimately
 * contain newlines and are left alone. */
const HEADER_INJECTION_RE = /[\r\n]/;
const EMAIL_LIKE_FIELDS = ["email", "replyTo", "name"];

export interface FormspreeResult {
  delivered: boolean;
  reason?: string;
}

function sanitiseValue(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

/**
 * Forward a validated payload to the given form's Formspree endpoint. Returns
 * `{delivered:false, reason:"not-configured"}` — never a false positive — when the
 * form's Formspree id isn't set for this environment (contract: never claim delivery
 * that didn't happen).
 */
export async function forwardToFormspree(
  form: FormName,
  payload: Record<string, unknown>,
): Promise<FormspreeResult> {
  if (!deliveryEnabled(form)) {
    return { delivered: false, reason: "not-configured" };
  }

  const formId = formspreeIdFor(form);
  if (!formId) {
    return { delivered: false, reason: "not-configured" };
  }

  for (const key of EMAIL_LIKE_FIELDS) {
    const value = payload[key];
    if (typeof value === "string" && HEADER_INJECTION_RE.test(value)) {
      return { delivered: false, reason: "invalid-field" };
    }
  }

  const sanitised: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    sanitised[key] = sanitiseValue(value);
  }

  try {
    const res = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(sanitised),
    });

    if (!res.ok) {
      return { delivered: false, reason: `formspree-http-${res.status}` };
    }
    return { delivered: true };
  } catch {
    return { delivered: false, reason: "network-error" };
  }
}
