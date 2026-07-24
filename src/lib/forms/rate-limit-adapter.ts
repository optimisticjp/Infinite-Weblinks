import { checkRateLimit, type RateLimitOptions } from "./rate-limit";
import { rateLimiterRequired } from "./config.server";

/**
 * Cloudflare-native rate limiting with a typed, fail-closed decision model. This is the interface the
 * form routes call — `rateLimit(key)` — so switching to the production limiter is a config change
 * (bind the rule) rather than a code change.
 *
 * PRODUCTION / PREVIEW (`rateLimiterRequired()`): the Cloudflare Rate Limiting binding is REQUIRED. A
 * consistent, cross-isolate counter is a security control here, so if the binding is absent OR faults
 * the adapter returns `unavailable` (the route fails CLOSED with a 503) — it does NOT silently degrade
 * to the per-isolate in-memory Map, which resets on eviction and can't limit across regions.
 *
 * DEVELOPMENT / TEST: the binding normally isn't present, so the in-memory fixed-window limiter is an
 * acceptable, explicit fallback (and a dev/test binding fault also degrades to it). No Durable Object
 * is introduced, and the D1 tag-cache database is never repurposed for rate limiting.
 *
 *   // wrangler.jsonc — the production rule the adapter uses automatically once bound
 *   "ratelimits": [
 *     { "name": "FORM_RATE_LIMITER", "namespace_id": "<real-id>", "simple": { "limit": 5, "period": 60 } }
 *   ]
 */

/** The subset of the Cloudflare Rate Limiting binding surface we depend on. */
interface CloudflareRateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const DEFAULT_BINDING = "FORM_RATE_LIMITER";
const DEFAULT_WINDOW_MS = 60_000;

/** Which counter produced the decision; `null` when the required limiter was unavailable. */
export type RateLimitBackend = "cloudflare" | "in-memory";

/**
 * How a route should treat the decision:
 *  - `allowed`     — under the limit; proceed
 *  - `limited`     — over the limit; 429 with Retry-After
 *  - `unavailable` — the required limiter couldn't run; fail closed with a 503
 */
export type RateLimitDisposition = "allowed" | "limited" | "unavailable";

export interface RateLimitDecision {
  disposition: RateLimitDisposition;
  backend: RateLimitBackend | null;
  /** Whole seconds to advise via `Retry-After` (always ≥ 1). */
  retryAfterSeconds: number;
}

function secondsUntil(resetAt: number): number {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

/**
 * Resolve the Rate Limiting binding from the OpenNext Worker context, or `null` when not
 * running inside a Cloudflare Worker (dev/test/build) or when the rule isn't bound.
 */
async function resolveBinding(name: string): Promise<CloudflareRateLimitBinding | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = mod.getCloudflareContext?.();
    const binding = (ctx?.env as Record<string, unknown> | undefined)?.[name];
    if (binding && typeof (binding as CloudflareRateLimitBinding).limit === "function") {
      return binding as CloudflareRateLimitBinding;
    }
  } catch {
    // Not inside a Worker, or the adapter package isn't resolvable here.
  }
  return null;
}

export interface RateLimitAdapterOptions extends RateLimitOptions {
  /** Env binding name for the Cloudflare Rate Limiting rule (default FORM_RATE_LIMITER). */
  binding?: string;
}

/**
 * Rate-limit `key`. Always resolves (never throws). In production/preview it REQUIRES the Cloudflare
 * binding and fails closed (`unavailable`) when it is missing or faults; in dev/test it uses the
 * in-memory fixed-window guard. Returns a typed decision plus a Retry-After hint.
 */
export async function rateLimit(
  key: string,
  options: RateLimitAdapterOptions = {},
): Promise<RateLimitDecision> {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const windowRetryAfter = Math.max(1, Math.ceil(windowMs / 1000));
  const required = rateLimiterRequired();

  const binding = await resolveBinding(options.binding ?? DEFAULT_BINDING);
  if (binding) {
    try {
      const { success } = await binding.limit({ key });
      return {
        disposition: success ? "allowed" : "limited",
        backend: "cloudflare",
        retryAfterSeconds: windowRetryAfter,
      };
    } catch {
      // The bound limiter faulted. Production/preview fails closed; dev/test degrades to in-memory.
      if (required) {
        return { disposition: "unavailable", backend: null, retryAfterSeconds: windowRetryAfter };
      }
    }
  } else if (required) {
    // Production/preview REQUIRES a consistent limiter; its absence is a fail-closed misconfiguration.
    return { disposition: "unavailable", backend: null, retryAfterSeconds: windowRetryAfter };
  }

  // Development / test (or a dev/test binding fault): the in-memory fixed-window guard is acceptable.
  const result = checkRateLimit(key, options);
  return {
    disposition: result.allowed ? "allowed" : "limited",
    backend: "in-memory",
    retryAfterSeconds: secondsUntil(result.resetAt),
  };
}
