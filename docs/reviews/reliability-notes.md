# Reliability Notes

> Production rate-limit backing, error paths, and graceful degradation (brief §P4-03/§P4-04,
> review §15).

## Rate limiting — production backing (P4-03)

**Reviewed. The production backing already exists and is correct — no paid resource or deploy
was created.**

- The routes call `rateLimit(key)` from `src/lib/forms/rate-limit-adapter.ts`.
- `wrangler.jsonc` binds a **Cloudflare-native Rate Limiting rule** `FORM_RATE_LIMITER`
  (`simple: { limit: 5, period: 60 }`). When bound (production Worker), the adapter uses
  `binding.limit({ key })` — a real, cross-request limiter at the edge.
- When the binding is absent (local dev / tests / preview), the adapter **transparently falls
  back** to an in-memory fixed-window limiter (`src/lib/forms/rate-limit.ts`, 5/60s).
- **Documented limitation:** the in-memory fallback is per-isolate and resets on eviction — it
  is best-effort only and is *not* the production path. Production relies on the Cloudflare
  Rate Limiting rule (not KV, not a Durable Object — the code comments explicitly say "Do NOT
  use Workers KV" for this).
- **Defence in depth is preserved:** honeypot (`_gotcha`), minimum-human-time
  (`MIN_HUMAN_MS = 1500`), rate limit, and Cloudflare Turnstile all remain in place, plus Zod
  validation and header-injection guards. Turnstile fails closed and is skipped only when
  unconfigured (no widget rendered).

No change was required beyond confirming the binding and documenting it. Switching or scaling
the backend later is a `wrangler.jsonc` config change, not a code change.

## Application error paths (P4-04)

- **500 / render error boundary added:** `src/app/error.tsx` (route-level) and
  `src/app/global-error.tsx` (root-layout-level). Both are production-safe recovery screens
  with a "Try again" (`reset`) action and a route home. Previously there was only a 404 page.
- **No-PII logging preserved:** the boundaries log only the framework `digest` (a hash) — never
  `error.message` (which can carry request/user detail). The form API routes likewise log no
  PII.
- **No fake form success:** both form routes return `delivery-unavailable` (HTTP 503) or
  `delivery-failed` (HTTP 502) rather than pretending a send succeeded when Formspree isn't
  configured; the client still shows the locally-computed plan but is honest that the email
  wasn't sent. This contract is unchanged.
- **Hero / static fallback verified:** `HeroUniverse` resolves to its complete static state if
  GSAP fails to load or reduced-motion is set (covered by `reduced-motion.spec.ts`). All new
  motion (`Reveal`, sticky CTA, marquee, scenes) is reduced-motion gated with complete static
  states.

## What still needs the deployed edge (out of scope here)

- Real Worker cold-start, edge caching, and ISR revalidation behaviour (config inspected, not
  deployed — no `cf:deploy`).
- Real Formspree/Turnstile delivery end-to-end (keys not set; code path + graceful degradation
  verified).
