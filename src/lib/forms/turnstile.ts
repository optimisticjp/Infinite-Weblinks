/**
 * Server-side Cloudflare Turnstile verification — the ONLY authority on whether a widget token is
 * valid. The browser widget (`src/components/forms/Turnstile.tsx`) only produces a token; nothing the
 * client says about it is trusted (contracts/forms-and-email.md).
 *
 * It fails CLOSED. In production/preview a missing key pair or an unreachable/slow siteverify endpoint
 * yields an `unavailable` disposition (the submission is blocked, never silently allowed). A bypass
 * exists ONLY behind `insecureBypassAllowed()` — an explicit dev/test opt-in that can never apply on a
 * deployed environment. Beyond Cloudflare's own success flag it also pins the token to the expected
 * action and (when configured) the allowed hostnames, so a token minted for another form or origin
 * cannot be replayed here. Every attempt is bounded by `TURNSTILE_TIMEOUT_MS`.
 */
import {
  type FormName,
  TURNSTILE_TIMEOUT_MS,
  allowedTurnstileHostnames,
  insecureBypassAllowed,
  turnstileActionFor,
  turnstileConfigured,
  turnstileSecretKey,
} from "./config.server";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Every distinguishable result of a verification attempt. Logged for operators (with the request id);
 * NEVER surfaced verbatim to the visitor — the route maps it to one of a few neutral messages.
 */
export type TurnstileOutcome =
  | "verified" // Cloudflare confirmed the token; action + hostname (when enforced) matched
  | "dev-bypass" // dev/test only, explicit opt-in — unreachable in production/preview
  | "missing-config" // keys expected but absent — a server misconfiguration, treated as unavailable
  | "missing-token" // keys present, the client sent no token
  | "invalid-token" // Cloudflare rejected the token (bad / expired / already-redeemed)
  | "action-mismatch" // token valid but issued for a different action than this form
  | "hostname-mismatch" // token valid but solved on a hostname we don't allow
  | "malformed" // siteverify returned an unparseable / unexpected body
  | "http-failure" // siteverify returned a non-2xx status
  | "timeout" // siteverify exceeded TURNSTILE_TIMEOUT_MS
  | "network"; // fetch threw before any response

/**
 * How a route should treat the outcome:
 *  - `pass`         — proceed with delivery
 *  - `human-failed` — the human check didn't pass; ask the visitor to try again (400 turnstile-failed)
 *  - `unavailable`  — the check couldn't be run at all; fail closed (503 security-unavailable)
 */
export type TurnstileDisposition = "pass" | "human-failed" | "unavailable";

export interface TurnstileResult {
  /** True only for `verified` / `dev-bypass`. */
  ok: boolean;
  outcome: TurnstileOutcome;
  disposition: TurnstileDisposition;
  /** Cloudflare `error-codes` when present — for server logs only, never shown to the client. */
  errorCodes?: string[];
}

interface SiteverifyResponse {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

function dispositionFor(outcome: TurnstileOutcome): TurnstileDisposition {
  switch (outcome) {
    case "verified":
    case "dev-bypass":
      return "pass";
    case "missing-token":
    case "invalid-token":
    case "action-mismatch":
    case "hostname-mismatch":
      return "human-failed";
    case "missing-config":
    case "malformed":
    case "http-failure":
    case "timeout":
    case "network":
      return "unavailable";
  }
}

function result(outcome: TurnstileOutcome, errorCodes?: string[]): TurnstileResult {
  const disposition = dispositionFor(outcome);
  return {
    ok: disposition === "pass",
    outcome,
    disposition,
    ...(errorCodes && errorCodes.length > 0 ? { errorCodes } : {}),
  };
}

export interface VerifyTurnstileOptions {
  /** The form whose expected action the returned token must match. */
  expectedAction: FormName;
  /** The visitor IP, forwarded to Cloudflare as `remoteip` when known. */
  ip?: string;
}

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint and return a typed result.
 *
 * Not-configured handling: in production/preview `turnstileConfigured()` is false ⇒ `missing-config`
 * (unavailable, fail closed). In development/tests, when `FORMS_ALLOW_INSECURE_BYPASS=true`, the same
 * state returns `dev-bypass` so the rest of the pipeline stays exercisable without a key pair.
 */
export async function verifyTurnstile(
  token: string | undefined,
  options: VerifyTurnstileOptions,
): Promise<TurnstileResult> {
  const { expectedAction, ip } = options;
  const secret = turnstileSecretKey();

  if (!turnstileConfigured() || !secret) {
    // Only a deliberate dev/test opt-in may bypass; production/preview always fail closed here.
    return insecureBypassAllowed() ? result("dev-bypass") : result("missing-config");
  }

  if (!token) return result("missing-token");

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
  } catch {
    // Aborted by our own timeout vs. a genuine transport failure — fail closed either way.
    return result(controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return result("http-failure", [`http-${res.status}`]);

  let data: SiteverifyResponse;
  try {
    data = (await res.json()) as SiteverifyResponse;
  } catch {
    return result("malformed");
  }
  if (typeof data.success !== "boolean") return result("malformed");

  const errorCodes = data["error-codes"];
  if (!data.success) return result("invalid-token", errorCodes);

  // Verified by Cloudflare. Now pin the token to THIS form's action and (when configured) an allowed
  // hostname, so a token solved for another action/origin can't be replayed against this endpoint.
  const expected = turnstileActionFor(expectedAction);
  if (typeof data.action === "string" && data.action.length > 0 && data.action !== expected) {
    return result("action-mismatch", errorCodes);
  }

  const allowedHosts = allowedTurnstileHostnames();
  if (
    allowedHosts.length > 0 &&
    typeof data.hostname === "string" &&
    data.hostname.length > 0 &&
    !allowedHosts.includes(data.hostname)
  ) {
    return result("hostname-mismatch", errorCodes);
  }

  return result("verified", errorCodes);
}
