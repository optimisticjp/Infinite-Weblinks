# Phase 3C — Release Certification

The consolidated release record for Infinite Weblinks. It states plainly what is done, what is green,
and what is **not** — and it does **not** claim the site is live or "production complete," because the
merge and deploy authorizations were not given and hard go-live blockers remain.

> **Status: RELEASE CANDIDATE — PAUSED AT THE MERGE GATE.** The code/quality candidate is complete and
> green. It is **not merged and not deployed.** Nothing about the production site has changed.

## Candidate

- **PR:** [#29](https://github.com/optimisticjp/Infinite-Weblinks/pull/29) — `claude/infinite-weblinks-v2-design-yb1yi3` → `main`
- **Branch vs `main`:** 0 behind, clean tree. The merge candidate is the branch's final green SHA (this
  file's commit advances HEAD; the same two Actions jobs must be green on the final SHA — see §G note).
- **Security patch:** `next 16.2.10 → 16.2.11` (clears Next.js's 9 own high CVEs).

## What is done and green (repository-controlled)

| Item                                                                                                        | State   |
| ----------------------------------------------------------------------------------------------------------- | ------- |
| §A claims reclassification, HARD/OPTIONAL blocker split, stale-comment removal                              | ✅ done |
| §B owner-decisions register (nothing invented)                                                              | ✅ done |
| §C scoped `next@16.2.11` security patch                                                                     | ✅ done |
| §D durable visual + a11y certification (0 overflow, reflow 54/54, 0 axe serious/critical, proof gate holds) | ✅ done |
| §E clean-install local DoD (unit 2000, e2e 768, build, cf:build, cf:verify 0 blockers)                      | ✅ done |
| Local release-safety (no secrets, legal drafts, seed default, fail-closed forms, no live email)             | ✅ done |
| §G PR opened; CI green on the candidate SHA (Lint·Typecheck·Build + Playwright·axe + Workers Build)         | ✅ done |

## What is NOT done — hard go-live blockers (unresolved)

| Blocker                                                                                                              | Owner           | Why it blocks launch                                                  |
| -------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------- |
| Professional legal review of the 5 legal pages                                                                       | Owner + counsel | All pages are `draft`; publishing unreviewed legal terms is unsafe    |
| Business-policy sign-offs (ownership/no-lock-in/won't-sell/positioning/delivery/quote) + analytics activate-or-amend | Owner           | Truthfulness of core claims must be confirmed                         |
| Cloudflare provisioning + secrets (R2, D1 **real id**, rate-limit rule, Turnstile/Formspree/APP_ENV/site URL)        | Owner/operator  | Forms fail closed until set; **not verifiable here** (no credentials) |
| **Merge authorization (§H)**                                                                                         | Owner           | Explicit authorization required; **not given**                        |
| **Deploy authorization (§I)**                                                                                        | Owner           | Separate explicit authorization required; **not given**               |

**⚠️ Workers Builds deploy risk:** a Cloudflare Workers Builds integration is connected (production
env). If it deploys-on-push to `main`, **merging would auto-deploy** — confirm in the Cloudflare
dashboard before merging. See `docs/release/phase-3c-ci-certification.md` and
`docs/release/phase-3c-cloudflare-verification.md`.

## Optional (safe to launch without; intentionally gated)

Real proof (hidden), numeric pricing ranges (qualitative model), live Sanity content (off), — none is a
launch blocker. See `docs/content/phase-3b-release-blockers.md`.

## Remaining Phase 3C steps (all gated on your authorization)

1. **§H — Merge gate.** On your explicit authorization (and your chosen merge strategy), merge the exact
   green candidate into `main`, then verify `main`.
2. **§I — Deploy gate.** On a **separate** explicit authorization, provision the approved Cloudflare
   resources/secrets, dry-run, `npm run cf:deploy`, record the version, verify the production URL.
3. **§J — Post-deploy certification.** Smoke-test the real production site (routes, legal, sitemap,
   robots, redirects, canonicals, headers, 404, forms with ONE authorized Turnstile+Formspree test,
   analytics state, no proof leak, axe).
4. Update this file to "production complete" **only** when merge + deploy are authorized and done and the
   smoke tests pass.

## Rollback

`wrangler rollback` or redeploy last known-good (R2/D1 caches durable); content → flip
`NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=false`; proof → `approvedForPublication=false`; repo → revert
the merge / close the PR. Forms fail closed by design if secrets are absent.

---

**Certification:** the release candidate is engineering-complete and green. **Production is NOT
complete.** No merge, no deploy, no production change has occurred. The release is paused pending
explicit owner authorization and the resolution of the hard blockers above.
