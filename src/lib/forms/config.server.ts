import "server-only";

/**
 * SERVER-ONLY form configuration. `import "server-only"` makes this a build error if it is ever
 * pulled into a Client Component's module graph, so the Turnstile secret and the Formspree form ids
 * can never reach the browser. Client-safe values (the public site key, support email) live in
 * `config.public.ts`.
 *
 * Values are read through FUNCTIONS, not module-initialised constants: on Cloudflare Workers the
 * runtime env/secrets are only reliably available inside a request, so each accessor reads
 * `process.env` when it is CALLED (request/runtime evaluation) rather than at import time.
 */

export type FormName = "growth-plan" | "contact";

/* ------------------------------------------------------------------ deployment environment */

export type DeploymentEnv = "development" | "test" | "preview" | "production";

/**
 * Classify the current deployment environment. `APP_ENV` (a deploy-time var) distinguishes preview
 * from production — both build as `NODE_ENV=production` — so it is the authority when set. An
 * unrecognised environment is treated as **production** (fail-closed by default).
 */
export function deploymentEnv(): DeploymentEnv {
  const appEnv = process.env.APP_ENV?.toLowerCase();
  if (appEnv === "production") return "production";
  if (appEnv === "preview") return "preview";
  if (appEnv === "development") return "development";
  if (appEnv === "test") return "test";
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return "test";
  if (process.env.NODE_ENV === "development") return "development";
  return "production";
}

/** Production and production-like (preview) environments fail closed and never honour a bypass flag. */
export function isProductionLike(): boolean {
  const env = deploymentEnv();
  return env === "production" || env === "preview";
}

/**
 * Explicit dev/test-only opt-in to bypass Turnstile / the Cloudflare rate limiter when they are not
 * configured locally. IGNORED (always false) in production and preview — the flag can never enable a
 * bypass on a deployed environment. In development/tests it is honoured ONLY when set to exactly
 * "true". Never set `FORMS_ALLOW_INSECURE_BYPASS` in a deployed environment.
 */
export function insecureBypassAllowed(): boolean {
  if (isProductionLike()) return false;
  return process.env.FORMS_ALLOW_INSECURE_BYPASS === "true";
}

/* ------------------------------------------------------------------ Turnstile (server) */

export function turnstileSecretKey(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY;
}

/** True only when BOTH the public site key and the server secret are present. */
export function turnstileConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}

/** Bounded timeout for the Cloudflare siteverify call (ms). */
export const TURNSTILE_TIMEOUT_MS = 8_000;

/** The action a form's Turnstile widget declares, verified server-side against the returned action. */
export function turnstileActionFor(form: FormName): FormName {
  return form;
}

/**
 * Hostnames the Turnstile response's `hostname` is allowed to match, when hostname enforcement is on.
 * Derived from the canonical site URL plus explicitly-configured preview hostnames
 * (`TURNSTILE_ALLOWED_HOSTNAMES`, comma-separated). Empty ⇒ hostname enforcement is skipped.
 */
export function allowedTurnstileHostnames(): string[] {
  const hosts = new Set<string>();
  try {
    const canon = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
    if (canon) hosts.add(canon);
  } catch {
    /* no/invalid site URL — no canonical host to enforce */
  }
  for (const h of (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    hosts.add(h);
  }
  return [...hosts];
}

/* ------------------------------------------------------------------ Formspree (server) */

/** The Formspree form id for a given form, or undefined when not configured for this environment.
 *  SERVER-ONLY names (no NEXT_PUBLIC_ prefix) so the ids never ship in the client bundle. */
export function formspreeIdFor(form: FormName): string | undefined {
  return form === "growth-plan"
    ? process.env.FORMSPREE_GROWTH_PLAN_ID
    : process.env.FORMSPREE_CONTACT_ID;
}

/** Whether a submission for this form can actually be delivered right now (its Formspree id is set). */
export function deliveryEnabled(form: FormName): boolean {
  return Boolean(formspreeIdFor(form));
}

/** Bounded timeout for the Formspree delivery POST (ms). */
export const FORMSPREE_TIMEOUT_MS = 10_000;

/* ------------------------------------------------------------------ required-prod policy */

/** In production/preview the Cloudflare Rate Limiting binding is REQUIRED (fail closed). */
export function rateLimiterRequired(): boolean {
  return isProductionLike();
}
