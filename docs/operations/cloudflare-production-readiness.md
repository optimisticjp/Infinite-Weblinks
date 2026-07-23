# Cloudflare Production Readiness

Operational runbook for deploying **Infinite Weblinks** (Next.js 16 → OpenNext → Cloudflare
Workers). It pairs with the read-only verifier `scripts/verify-cloudflare-config.mjs`
(`npm run cf:verify`). Nothing here deploys or mutates anything — deployment (`npm run cf:deploy`)
requires **explicit owner authorization** and is out of scope for this document.

> **What this file is (and isn't).** It records what can be **verified locally from the repo** and
> what still needs an **operator with Cloudflare account access** to confirm. It does **not** contain
> secrets or real resource identifiers, and it does not assert that any external resource exists —
> those are the "external-verification-required" steps below.

---

## 1. The read-only verifier

```bash
npm run cf:verify            # human summary + machine-readable JSON, exit 1 only on a blocker
node scripts/verify-cloudflare-config.mjs --json     # JSON only (for CI / tooling)
node scripts/verify-cloudflare-config.mjs --bundle   # also runs `wrangler deploy --dry-run` (NON-mutating)
```

It reads `wrangler.jsonc`, `open-next.config.ts` and `src/lib/forms/rate-limit-adapter.ts`, then
classifies every finding as:

| Status                           | Meaning                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `verified-locally`               | Provable from the repo alone (binding names, flags, OpenNext↔wrangler consistency).                            |
| `external-verification-required` | Needs Cloudflare access (real resource ids, secrets, a live dry-run). **Expected** for a repo without secrets. |
| `blocker`                        | A config/code defect that must be fixed before any deploy.                                                     |

The verifier **never** deploys, mutates, or calls the Cloudflare API. `--bundle` runs only the
non-mutating `wrangler deploy --dry-run`.

---

## 2. Binding inventory (what the Worker expects)

| Binding                    | Kind               | Repo value                                     | OpenNext role                                                                |
| -------------------------- | ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `ASSETS`                   | Static assets      | `.open-next/assets`                            | Served static output.                                                        |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 bucket          | `iw-inc-cache`                                 | Incremental cache (`r2IncrementalCache`).                                    |
| `NEXT_TAG_CACHE_D1`        | D1 database        | `iw-tag-cache` (id is a **local placeholder**) | Tag cache for on-demand `revalidateTag`/`revalidatePath` (`d1NextTagCache`). |
| `FORM_RATE_LIMITER`        | Rate Limiting rule | `namespace_id 1001`, 5 req / 60 s              | Cross-isolate form rate limiter (see §4).                                    |

Owner-locked design: **R2 + D1, no Workers KV**, on-demand revalidation only. The verifier fails
(`blocker`) if a KV namespace or KV override ever appears.

---

## 3. Pre-deploy checklist (external-verification-required)

These need an operator signed in to the target Cloudflare account. Commands are read-only unless
noted.

1. **R2 bucket exists** — `npx wrangler r2 bucket list` includes `iw-inc-cache` (create it once if
   not: `wrangler r2 bucket create iw-inc-cache`).
2. **D1 database + real id** — `npx wrangler d1 list` includes `iw-tag-cache`. The `database_id` in
   `wrangler.jsonc` (`29042ec8-…`) is a **placeholder for local emulation**; set the real production
   id before deploy (from `wrangler d1 list`), and apply the OpenNext tag-cache schema/migrations to
   that database.
3. **Rate-limit rule id** — `namespace_id` is a locally-assigned unique integer, not an external
   resource. Confirm `1001` does not collide with another Rate Limiting rule in the account; change
   it if it does.
4. **Secrets & runtime vars** — set on the Worker (never in the repo, never in `.env.example`):
   - `TURNSTILE_SECRET_KEY` — Turnstile server secret (`wrangler secret put TURNSTILE_SECRET_KEY`).
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Turnstile public site key (build-time public var).
   - `FORMSPREE_CONTACT_ID`, `FORMSPREE_GROWTH_PLAN_ID` — server-only Formspree form ids.
   - `APP_ENV=production` — selects the fail-closed policy (see §4).
   - `NEXT_PUBLIC_SITE_URL` — canonical origin; also seeds Turnstile hostname enforcement.
   - `TURNSTILE_ALLOWED_HOSTNAMES` _(optional)_ — extra hostnames to accept (comma-separated).
   - **`FORMS_ALLOW_INSECURE_BYPASS` must NOT be set** in production/preview — it is ignored there by
     design, but leave it unset to avoid confusion.
5. **Bundle validates** — `npm run cf:build` then `npx wrangler deploy --dry-run` (both
   non-mutating), or `npm run cf:verify -- --bundle`.

---

## 4. Forms behave fail-closed in production

The form pipeline (`/api/forms/contact`, `/api/forms/growth-plan`) is defence-in-depth and **fails
closed** in production/preview (`APP_ENV` = `production` | `preview`, i.e. `isProductionLike()`):

- **Turnstile** — if the key pair is missing, or Cloudflare siteverify is unreachable / times out,
  the request is a `503 security-unavailable` (never silently allowed). A genuine human failure is a
  `400 turnstile-failed`. The token is pinned to the per-form action and (when `NEXT_PUBLIC_SITE_URL`
  / `TURNSTILE_ALLOWED_HOSTNAMES` are set) an allowed hostname.
- **Rate limiter** — the `FORM_RATE_LIMITER` binding is **required**; if it is missing or faults, the
  request is a `503 rate-limit-unavailable` (it does **not** degrade to the per-isolate in-memory
  Map). A genuine throttle is a `429 rate-limited`. Both carry `Retry-After`.
- **Delivery** — one Formspree attempt, bounded by a timeout, **no blind retry** (avoids duplicate
  emails). A missing form id is `503 delivery-unavailable`; an upstream failure is `502
delivery-failed`. The UI never claims success unless the server confirmed delivery.

Consequence for deploy: **if the Turnstile keys or the rate-limit binding are not configured, the
forms will correctly refuse to submit in production.** Complete §3 before relying on the forms.

Development/preview-without-keys (e.g. the e2e suite) sets `APP_ENV=development` +
`FORMS_ALLOW_INSECURE_BYPASS=true` so the pipeline stays exercisable (in-memory limiter, Turnstile
dev-bypass) and reaches the truthful `delivery-unavailable` path.

---

## 5. Security headers / CSP

Set in `next.config.ts`, applied to every route. Notable points for operators:

- **Formspree is intentionally absent** from `connect-src`/`form-action`: the browser posts
  same-origin to `/api/forms/*`; the server forwards to Formspree server-to-server (not a browser
  request).
- Allowances: Sanity (CMS/image), Cloudflare **Turnstile** (`frame-src`/`script-src`), Cloudflare
  **Web Analytics** beacon. Fonts are self-hosted.
- `script-src` keeps `'unsafe-inline'` **only** for Next.js's inline bootstrap. Removal criterion:
  per-request nonces once the Cloudflare adapter can stamp one (Node-middleware nonces are
  unsupported by `@opennextjs/cloudflare` today).
- HSTS (`max-age` 2y, `includeSubDomains`, `preload`), `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` are set.

---

## 6. Observability

Each form request emits **PII-free** structured JSON log lines (`src/lib/forms/observability.ts`),
one per lifecycle step (`received` → gate `rejected`/`unavailable` → `delivery-start` →
`delivered`/`delivery-failed`), correlated by the `X-Request-ID` header returned on every response.
No visitor data, message content, tokens, or secrets are ever logged. Tail them with:

```bash
npx wrangler tail --format=pretty      # requires account access; non-mutating
```

Correlate a user report to its log lines via the `X-Request-ID` value from the response.

---

## 7. Deploy & rollback (authorization required)

- Deploy is `npm run cf:deploy` (`opennextjs-cloudflare build && … deploy`). **Never run without
  explicit owner authorization.** All checks above should be green/complete first.
- Rollback: `npx wrangler rollback` (or redeploy the previous known-good build). Cache bindings (R2
  incremental, D1 tag) are durable across deploys; a rollback of the Worker code does not clear them.

---

## 8. Quick reference

```bash
npm run cf:verify            # read-only readiness check (this runbook's automation)
npm run cf:build             # OpenNext → Worker bundle (no deploy)
npx wrangler deploy --dry-run   # validate + bundle, non-mutating
npm run cf:preview           # local Worker preview (stop after verifying)
# npm run cf:deploy          # PRODUCTION DEPLOY — owner authorization required
```
