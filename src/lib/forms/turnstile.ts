/**
 * Server-side Cloudflare Turnstile verification. The client widget (see
 * `src/components/forms/Turnstile.tsx`) only produces a token — this is the ONLY place
 * that decides whether it's valid. Never trust the client result alone
 * (contracts/forms-and-email.md).
 */
import { turnstileConfigured, turnstileSecretKey } from "./config.server";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileResult {
  success: boolean;
  /** True when verification was bypassed because Turnstile isn't configured yet. */
  skipped?: boolean;
  errorCodes?: string[];
}

interface SiteverifyResponse {
  success?: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint.
 *
 * Dev/preview fallback (documented, NOT a production behaviour): when
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` are not both set — e.g. a
 * preview deploy before secrets are provisioned — this returns `{success:true,
 * skipped:true}` so the rest of the form flow (validation, rate-limit, Formspree) can
 * still be exercised end-to-end without a working Turnstile pair. The moment both env
 * vars are set, this fallback stops applying and every submission is verified for real;
 * a request with no token then fails closed.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<TurnstileResult> {
  const secret = turnstileSecretKey();
  if (!turnstileConfigured() || !secret) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      return { success: false, errorCodes: [`http-${res.status}`] };
    }

    const data = (await res.json()) as SiteverifyResponse;
    return { success: Boolean(data.success), errorCodes: data["error-codes"] };
  } catch {
    // Network failure / timeout — fail closed once Turnstile is actually configured.
    return { success: false, errorCodes: ["network-error"] };
  }
}
