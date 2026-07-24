# Phase 3A — Implementation Report

**Production Security, Forms, and Cloudflare Infrastructure Hardening**

- **Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
- **Base (reviewed head at start):** `f3f47a2`
- **Commits:** Phase 3A Commits 1–9 (this report is part of Commit 9)
- **Scope discipline:** No page copy, legal wording, proof/testimonial status, pricing/commercial
  claims, SEO strategy, visual design/route composition, analytics behaviour, Sanity content
  delivery, public URLs, redirects, canonicals, or sitemap/robots were changed — except the minimal,
  truthful form messaging required for the new fail-closed states. No PR, merge, deploy, or Cloudflare
  mutation was performed.

## Evidence key

- **[locally-verified]** — proven by the repo + a passing check in this session (test/build/lint/
  typecheck/e2e/audit/dry-run).
- **[Claude-reported]** — a reasoned engineering judgement from reading the code, not machine-proven.
- **[externally-verified]** — confirmed against an external tool this session (npm registry advisories
  via `npm audit`; `wrangler deploy --dry-run` bundling).
- **[external-still-required]** — needs the deployed Cloudflare environment / an operator with account
  access (real secrets, real resource ids, live behaviour).

---

## What changed, by commit

1. **Commit 1 — Phase 2S report/evidence corrections.** Tightened prior-phase report wording and
   dead-token classification; deleted the orphaned `hero/Hero.tsx` and its now-dead
   `--grad-text`/`.iw-gradient-text`. **[locally-verified]**
2. **Commit 2 — split public vs server-only form config.** New `config.public.ts` (site key, support
   email) and `config.server.ts` (`import "server-only"`; function accessors for the Turnstile secret,
   the renamed server-only `FORMSPREE_*` ids, the deployment-env/fail-closed policy helpers). Client
   components import only `config.public`. Locked by `config-boundary.test.ts`. **[locally-verified]**
3. **Commit 3 — bounded request reader + request correlation.** `request.ts`: `application/json`-only,
   16 KiB cap enforced before _and_ during streaming, honest 415/413/400 outcomes, never logs the
   body. Every response now carries `X-Request-ID`. **[locally-verified]** (`request-reader.test.ts`)
4. **Commit 4 — Turnstile fail-closed + action/hostname pinned + bounded.** Typed outcome model with a
   `pass | human-failed | unavailable` disposition; missing keys / unreachable siteverify → 503
   `security-unavailable` in production (dev/test bypass only behind an explicit flag); token pinned to
   the per-form action and allowed hostnames; `AbortController` timeout. **[locally-verified]**
5. **Commit 5 — rate limiting fail-closed + Retry-After.** In production/preview the
   `FORM_RATE_LIMITER` binding is required; missing/faulting → 503 `rate-limit-unavailable` (no
   silent in-memory fallback). Typed decision + `Retry-After` on 429 and 503. **[locally-verified]**
6. **Commit 6 — Formspree timeout + one attempt + PII-safe observability.** One bounded delivery
   attempt, no blind retry (no duplicate emails); typed outcome + duration. New server-only
   `observability.ts` whose input type brands every PII/secret field `never` and serialises only a
   whitelist; both routes emit correlated lifecycle logs. **[locally-verified]**
7. **Commit 7 — CSP tightened + header coverage.** Formspree removed from the browser-facing
   directives; `script-src-attr 'none'`, `media-src 'self'`, `manifest-src 'self'` added; Turnstile-
   only `frame-src`; documented `unsafe-inline` with a removal criterion. Unit + e2e header tests.
   **[locally-verified]**
8. **Commit 8 — read-only Cloudflare verifier + ops runbook.** `scripts/verify-cloudflare-config.mjs`
   (`npm run cf:verify`) cross-checks bindings/OpenNext/rate-limit-name and classifies findings;
   `docs/operations/cloudflare-production-readiness.md`. **[locally-verified]**
9. **Commit 9 — OWASP review, full validation, reports, push.** This report +
   `phase-3a-security-review.md`; full validation below. **[locally-verified]**

---

## Validation results (this session)

| Check                                 | Result                                                                                                                                                                                                                                                                                                   | Evidence                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `npm run lint`                        | pass                                                                                                                                                                                                                                                                                                     | [locally-verified]                           |
| `npm run typecheck`                   | pass                                                                                                                                                                                                                                                                                                     | [locally-verified]                           |
| `npm run test` (unit)                 | **1949 passed** (79 files)                                                                                                                                                                                                                                                                               | [locally-verified]                           |
| `npm run build`                       | pass                                                                                                                                                                                                                                                                                                     | [locally-verified]                           |
| `npm run cf:build` (OpenNext bundle)  | pass — `.open-next/worker.js` written                                                                                                                                                                                                                                                                    | [locally-verified]                           |
| `npm run test:e2e` (Playwright + axe) | **768 passed**                                                                                                                                                                                                                                                                                           | [locally-verified]                           |
| `npx wrangler deploy --dry-run`       | pass (non-mutating): validated the **local** wrangler config and **bundled** the Worker, and the **4 binding declarations** (ASSETS, R2, D1, FORM_RATE_LIMITER) are included in the bundle. It does **NOT** resolve or confirm the account-side resources or secrets — those stay externally unverified. | [locally-verified] (local config + bundling) |
| `npm run cf:verify --bundle`          | **0 blockers** (10 verified locally, 4 external)                                                                                                                                                                                                                                                         | [locally-verified]                           |
| `npm audit` / `--omit=dev`            | recorded exactly (see the security review)                                                                                                                                                                                                                                                               | [externally-verified]                        |

> **Cloudflare evidence, precisely (Phase 3B §A4 correction).** The dry-run verifies **local
> configuration and Worker bundling** and that the **binding declarations are present in the bundle**.
> It performs **no** account API calls, so the R2 bucket, the D1 database and its real id, the
> rate-limit rule, and all secrets **remain externally unverified** — see the production-readiness
> runbook §3. Earlier phrasing that read as "all 4 bindings resolve" overstated this and is corrected.

## Branch comparison at Phase 3A completion

- Head `e513d78`: **151 ahead of `main`, 0 behind** (`git rev-list --count origin/main..HEAD`).

New tests added this phase: `config-boundary`, `request-reader`, `form-observability`,
`security-headers`, `cloudflare-config-verify` (unit) and `security-headers` (e2e); the Turnstile /
rate-limit / Formspree / form-page guards were rewritten for the fail-closed, typed models.

---

## Security posture (summary from the OWASP review)

- **No Critical/High finding introduced by Phase 3A.** The change set strengthened A03 (injection —
  bounded reads, double header-injection guard), A04 (insecure design — fail-closed defence in depth,
  one-attempt delivery, never-fake-success), A05 (misconfiguration — tighter CSP + full header set),
  A09 (logging — PII-free correlated lifecycle logs), and A10 (SSRF — fixed outbound hosts only).
  **[locally-verified]/[Claude-reported]**
- **Accepted Low (A08):** the Cloudflare Turnstile + analytics scripts load without SRI (Cloudflare
  versions/rotates them); mitigated by a strict `script-src` allowlist. **[Claude-reported]**
- **Dependency audit (A06):** full 6 (1 moderate/5 high), production `--omit=dev` 3 (`next`,
  `postcss`, `sharp`). `sharp` has no Worker-runtime exposure; most `next` advisories are N/A to this
  app (webpack build, no Server Actions, no middleware, unoptimized images). **Recorded, not blindly
  upgraded.** **[externally-verified]/[Claude-reported]**

---

## Follow-ups (out of Phase 3A scope)

- **[external-still-required]** Provision and confirm the Worker secrets/vars and the real R2/D1 ids
  per `docs/operations/cloudflare-production-readiness.md` §3. Until then the forms correctly refuse to
  submit in production (fail-closed) — by design.
- **[follow-up]** A scoped `next@16.2.11` patch bump (its own change + full re-validation) to clear the
  `next`/`postcss` advisories; a scheduled wrangler major upgrade for the dev-only chain.
- **[external-still-required]** Configure log alerting in Cloudflare (spikes of `rejected`/
  `unavailable`), and correlate incidents via `X-Request-ID`.

---

## Statements requiring independent confirmation

Everything tagged **[Claude-reported]** above (the OWASP applicability reasoning, the "no SRI is
acceptable" judgement, the advisory-applicability analysis) is an engineering judgement from reading
the code, not a machine-proven fact, and should be independently reviewed. Everything tagged
**[external-still-required]** cannot be verified from the repo and must be checked by an operator with
Cloudflare account access before production reliance.
