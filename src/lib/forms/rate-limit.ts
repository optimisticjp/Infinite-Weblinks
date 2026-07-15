/**
 * Fixed-window IP+form rate limiter — a small in-memory guard against burst submission
 * abuse, backstopping the honeypot/timing checks and Turnstile (contracts/forms-and-email.md).
 *
 * PRODUCTION NOTE: this `Map` lives in a single Worker isolate's memory. On Cloudflare
 * that memory is NOT shared across isolates/regions and resets on eviction or redeploy,
 * so this implementation is only a best-effort guard for local dev and single-isolate
 * preview traffic. Production should replace it with a Cloudflare-native limiter — the
 * Rate Limiting binding, or a Durable Object (or the project's D1 tag DB) for a shared,
 * consistent counter across isolates. Do NOT use Workers KV for this: KV is eventually
 * consistent and its per-key write-rate limits make it unsuitable for a tight
 * request-counting window like this one.
 */

interface Window {
  count: number;
  resetAt: number;
}

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX = 5; // submissions per window per key

const hits = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

/**
 * Check and record a hit for `key` (typically `${form}:${ip}`). Fixed window: once the
 * window expires the counter resets rather than sliding.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options.max ?? DEFAULT_MAX;
  const now = Date.now();
  const existing = hits.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    hits.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

/** Best-effort client IP extraction for the rate-limit key (Cloudflare sets
 * `cf-connecting-ip`; `x-forwarded-for` is a fallback for other environments). */
export function clientIpFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

/** Test-only: clear all counters between test cases so windows don't leak across tests. */
export function _resetRateLimitForTests(): void {
  hits.clear();
}
