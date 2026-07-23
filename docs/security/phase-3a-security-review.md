# Phase 3A — Security Review (OWASP Top 10:2025)

Focused review of the Phase 3A production-security surfaces: the two form Route Handlers
(`src/app/api/forms/contact`, `/growth-plan`) and their libraries (`turnstile.ts`,
`rate-limit-adapter.ts`, `rate-limit.ts`, `formspree.ts`, `observability.ts`, `request.ts`,
`config.server.ts`, `config.public.ts`), and the CSP / security headers in `next.config.ts`.

**Scope note.** This is a defensive review of _this repo's_ code. There is no user authentication,
no database, and no customer data store — the only server-side actions are (a) validating a form and
(b) forwarding it to Formspree server-to-server. Phase 3A **improved** the posture (fail-closed
gates, bounded reads, timeouts, one-attempt delivery, request-id logging, tighter CSP); this review
found **no Critical or High finding introduced by Phase 3A**.

## Evidence key

Every claim is tagged with how it was established, so nothing reads as more certain than it is:

- **[verified-locally]** — proven by the repo + the passing test/build in this session.
- **[reasoned]** — a security judgement from reading the code (not machine-checked).
- **[external-required]** — depends on the deployed Cloudflare environment / an operator.

---

## Findings by OWASP category

### A01 Broken Access Control — no finding

- The form endpoints are intentionally public; there is no per-user resource to protect and no
  object-id lookup to abuse (no IDOR surface). **[reasoned]**
- The growth-plan `matchedRuleId` is forwarded ONLY to the support inbox and is never in a client
  response — locked by `v2-growth-plan-api-safety.test.ts` (`matchedRuleId` appears exactly 3×, all
  server→inbox; success body is exactly `{ok:true}`). **[verified-locally]**

### A02 Cryptographic Failures — no finding

- HSTS is set (`max-age=63072000; includeSubDomains; preload`); `upgrade-insecure-requests` in CSP.
  **[verified-locally]** (`security-headers.test.ts`)
- No passwords/PII are stored. The Turnstile secret and Formspree ids are **server-only**
  (`config.server.ts` has `import "server-only"`; the ids use non-`NEXT_PUBLIC_` names). The
  client/server boundary is locked by `config-boundary.test.ts` (client-safe code contains no secret
  names and no `server-only` import). **[verified-locally]**
- Whether the real secrets are set correctly on the Worker is **[external-required]** (see the
  runbook §3).

### A03 Injection — no finding

- **Email header injection**: guarded twice — the Zod schemas reject CR/LF/`,`/`;` in header-like
  fields, and `formspree.ts` re-checks `email`/`replyTo`/`name` against `/[\r\n]/` before any POST
  (`forms.test.ts`). **[verified-locally]**
- **JSON parsing**: `request.ts` reads `application/json` only, bounded to 16 KiB, then `JSON.parse` +
  Zod. No `eval`, no dynamic code. **[verified-locally]**
- **XSS**: React auto-escapes; no `dangerouslySetInnerHTML` with user content in the form paths;
  the tightened CSP (`object-src 'none'`, `script-src-attr 'none'`, no `formspree.io`) reduces sink
  surface. Log lines are `JSON.stringify`-encoded. **[reasoned]/[verified-locally]**
- No SQL is authored by the app (the D1 tag cache is OpenNext-managed and not fed user input).
  **[reasoned]**

### A04 Insecure Design — no finding (strengthened)

- Defence in depth, in order: bounded read → Zod re-validate (server is the authority) → honeypot →
  human-timing → rate limit → Turnstile → delivery. Client validation is UX-only. **[verified-locally]**
  (flow-order locks in `v2-contact-page.test.tsx` / `v2-growth-plan-api-safety.test.ts`)
- **Fail-closed** in production/preview: a missing/unreachable Turnstile or a missing/faulting rate
  limiter returns a distinct 503 rather than allowing the request. **[verified-locally]**
  (`forms.test.ts`, `rate-limit-adapter.test.ts`)
- **No duplicate emails**: exactly one Formspree attempt, no blind retry. **[verified-locally]**
- **Never fakes success**: the UI only shows success on a server-confirmed `{ok:true}`.
  **[verified-locally]** (e2e `contact.spec.ts` / `growth-plan.spec.ts`)

### A05 Security Misconfiguration — no finding (strengthened)

- Full security-header set applied to `/:path*`; CSP tightened (Formspree removed from the
  browser-facing directives, `script-src-attr`/`media-src`/`manifest-src` added, Turnstile-only
  `frame-src`). **[verified-locally]** (`security-headers.test.ts` + e2e `security-headers.spec.ts`)
- Unknown/unset environment resolves to **production** (fail-closed) in `deploymentEnv()`;
  `FORMS_ALLOW_INSECURE_BYPASS` is ignored in production/preview. **[verified-locally]**
- User-facing error messages are generic (no stack traces / internals). **[verified-locally]**

### A06 Vulnerable and Outdated Components — see the audit section below

- `npm audit` recorded exactly; applicability analysed. No blind upgrades performed. **[verified-locally]**

### A07 Identification and Authentication Failures — not applicable

- There is no user authentication. The analogous control is bot mitigation (Turnstile + rate limit),
  which Phase 3A made fail-closed. **[reasoned]**

### A08 Software and Data Integrity Failures — LOW (accepted)

- **Finding (Low):** the Turnstile widget script (`challenges.cloudflare.com`) and the Cloudflare Web
  Analytics beacon (`static.cloudflareinsights.com`) load **without Subresource Integrity**. SRI is
  impractical for these because Cloudflare versions the URLs and rotates the payload. **[reasoned]**
- **Mitigation in place:** `script-src` allowlists exactly those two first-party Cloudflare origins
  (plus `'self'`), so no arbitrary third-party script can load. Accepted risk; no action in 3A.
- No insecure deserialization (bounded JSON → Zod); no auto-updating plugins.

### A09 Security Logging and Monitoring Failures — improved

- Added PII-free structured lifecycle logging (`observability.ts`) correlated by `X-Request-ID`:
  `received` → gate `rejected`/`unavailable` → `delivery-start`/`delivered`/`delivery-failed`. Every
  known PII/secret field is branded `never` at the type level and only a whitelist is serialised.
  **[verified-locally]** (`form-observability.test.ts`)
- **Residual [external-required]:** log _alerting_ (e.g. spikes of `rejected`/`unavailable`) is an ops
  concern, not configured in the repo — documented in the runbook §6.

### A10 Server-Side Request Forgery — no finding

- The only outbound server fetches are to **fixed hosts**: `formspree.io/f/${formId}` where `formId`
  comes from **server env**, not user input; and the fixed Turnstile siteverify URL. There is no
  "fetch a user-supplied URL" feature — the `website` field is treated as text (validated, emailed),
  never dereferenced. Redirects/rewrites are static (no attacker-controlled destination). **[reasoned]**
- The client IP forwarded to Turnstile as `remoteip` is taken from `cf-connecting-ip` (authoritative
  on Cloudflare) with an `x-forwarded-for` fallback that only matters off-Cloudflare (dev). It is
  URL-encoded via `URLSearchParams`. **[verified-locally]/[reasoned]**

---

## Dependency audit (A06) — recorded exactly, no blind upgrades

Captured this session (`npm audit`). **No `npm audit fix --force` was run** — per Phase 3A, findings
are recorded and analysed, not blindly upgraded.

| Package                                           | Severity | In production audit (`--omit=dev`)? | Applicability to this app                                                                                                                                                                                                                                                                                        | Action                                                                                                                                                               |
| ------------------------------------------------- | -------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`                                            | high     | **yes**                             | Most advisories are **N/A**: build is `next build --webpack` (not Turbopack), there are **no Server Actions** (`grep "use server"` → none) and **no middleware**, and images are `unoptimized` (Image Optimization API unused). Rewrites are static (no attacker-controlled destination → SSRF-in-rewrites N/A). | Recommend a scoped patch bump `16.2.10 → 16.2.11` as a fast-follow (its own change + full re-validation), not a blind `--force`. **[external-required / follow-up]** |
| `postcss`                                         | moderate | **yes**                             | XSS via CSS stringify output; a **build-time** tool over our own authored CSS (not attacker-controlled). Transitive via `next`.                                                                                                                                                                                  | Cleared by the same `next@16.2.11` bump. Low real risk. **[reasoned]**                                                                                               |
| `sharp`                                           | high     | yes (listed)                        | libvips CVEs. **Not used on the deployed Worker** — `images.unoptimized: true` and Cloudflare Workers has no `sharp` (editor media is resized by the Sanity CDN). Transitive dev/build dependency.                                                                                                               | No production exposure; no action. **[reasoned]**                                                                                                                    |
| `wrangler`, `miniflare`, `@opennextjs/cloudflare` | high     | **no** (dev-only)                   | Build/preview tooling (miniflare vulnerable via `sharp`); not shipped to production. The `--omit=dev` audit does not list them.                                                                                                                                                                                  | Fixing needs a **breaking** wrangler major bump — do **not** apply blindly; schedule as its own upgrade. **[external-required / follow-up]**                         |

Totals recorded: full audit **6 (1 moderate, 5 high)**; production (`--omit=dev`) **3 (1 moderate,
2 high)** — `next`, `postcss`, `sharp` — of which `sharp` has no Worker-runtime exposure and the
`next`/`postcss` advisories are largely N/A to this app's configuration and cleared by a single patch
bump.

---

## Summary

- **Critical/High introduced by Phase 3A: 0.** The change set strengthened A03/A04/A05/A09/A10.
- **Accepted low:** A08 no-SRI on Cloudflare-versioned scripts (mitigated by a strict `script-src`
  allowlist).
- **Follow-ups (external / scheduled):** a scoped `next@16.2.11` patch bump; a scheduled wrangler
  major upgrade for the dev-only chain; log alerting configured in Cloudflare.
- **External-required for go-live:** the real secrets/bindings per the production-readiness runbook.
