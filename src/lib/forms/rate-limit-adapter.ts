import { checkRateLimit, type RateLimitOptions, type RateLimitResult } from "./rate-limit";

/**
 * Cloudflare-native rate limiting, with the in-memory fixed-window limiter as a safe
 * fallback. This is the interface the form routes call — `rateLimit(key)` — so switching
 * to the production limiter is a config change (bind the rule) rather than a code change.
 *
 * PRODUCTION: add a Cloudflare Rate Limiting rule to `wrangler.jsonc` and this adapter
 * uses it automatically — a counter that is consistent across isolates/regions, which the
 * per-isolate in-memory Map cannot be:
 *
 *   // wrangler.jsonc
 *   "ratelimits": [
 *     {
 *       "name": "FORM_RATE_LIMITER",
 *       "namespace_id": "1001",
 *       "simple": { "limit": 5, "period": 60 }
 *     }
 *   ]
 *
 * When the binding is absent (local dev, a preview without the rule, unit tests) the
 * adapter transparently falls back to the in-memory limiter. No Durable Object is
 * introduced, and the D1 tag-cache database is never repurposed for rate limiting.
 */

/** The subset of the Cloudflare Rate Limiting binding surface we depend on. */
interface CloudflareRateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const DEFAULT_BINDING = "FORM_RATE_LIMITER";

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
    // Not inside a Worker, or the adapter package isn't resolvable here — fall back.
  }
  return null;
}

export interface RateLimitAdapterOptions extends RateLimitOptions {
  /** Env binding name for the Cloudflare Rate Limiting rule (default FORM_RATE_LIMITER). */
  binding?: string;
}

/**
 * Rate-limit `key`. Prefers the Cloudflare Rate Limiting binding when bound, otherwise the
 * in-memory fixed-window limiter. Always resolves (never throws) so a limiter fault can't
 * take down form submission — a limiter error degrades to the in-memory guard.
 */
export async function rateLimit(
  key: string,
  options: RateLimitAdapterOptions = {},
): Promise<RateLimitResult> {
  const binding = await resolveBinding(options.binding ?? DEFAULT_BINDING);
  if (binding) {
    try {
      const { success } = await binding.limit({ key });
      const windowMs = options.windowMs ?? 60_000;
      // The CF binding reports pass/fail only; synthesise the remaining/resetAt shape so
      // callers get one consistent RateLimitResult regardless of backend.
      return { allowed: success, remaining: success ? 1 : 0, resetAt: Date.now() + windowMs };
    } catch {
      // Binding threw — degrade to the in-memory limiter rather than failing open.
    }
  }
  return checkRateLimit(key, options);
}
