# Phase 3C — Final Local Certification

The complete local Definition-of-Done for the release candidate, run from a **clean install**
(`npm ci`) on branch `claude/infinite-weblinks-v2-design-yb1yi3` with the `next@16.2.11` security patch
applied. Every check below was run this session; nothing is asserted without a passing command.

## Release candidate

- **Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
- **Vs `origin/main`:** **163 ahead, 0 behind**, working tree clean.
- **Toolchain:** Next.js 16.2.11 (webpack build), React 19.2.7, OpenNext → Cloudflare Workers,
  wrangler 4.110.0, Node 22 (CI) / local.

## Gate results

| Gate                     | Command                         | Result                                                  |
| ------------------------ | ------------------------------- | ------------------------------------------------------- |
| Clean install            | `npm ci`                        | **OK** (from `package-lock.json`)                       |
| Lint                     | `npm run lint`                  | **PASS**                                                |
| Typecheck                | `npm run typecheck`             | **PASS**                                                |
| Unit tests               | `npm run test`                  | **PASS — 2000 / 2000** (86 files)                       |
| Production build         | `npm run build`                 | **PASS**                                                |
| E2E + axe                | `npm run test:e2e`              | **PASS — 768 / 768** (Playwright + axe)                 |
| Worker bundle            | `npm run cf:build`              | **PASS** (`.open-next/worker.js` written)               |
| CF readiness (+ dry-run) | `npm run cf:verify -- --bundle` | **PASS — 0 blockers** (10 verified locally, 4 external) |
| Dependency audit (full)  | `npm audit`                     | 7 (2 moderate, 5 high) — see note                       |
| Dependency audit (prod)  | `npm audit --omit=dev`          | 3 high — see note                                       |

**Audit note.** The 3 production highs are `postcss` + `sharp` (and `next` only as their parent). The
`next@16.2.11` patch cleared Next.js's own 9 high-severity advisories; `postcss`/`sharp` have **no
forward fix** (npm's only offer is a breaking `next@9.3.3` downgrade, rejected) — `postcss` is a
build-time tool over our own CSS, `sharp` has no Worker-runtime exposure. The dev-only
`wrangler`/`miniflare` chain remains a scheduled upgrade. Full analysis in the Phase 3A security review
(Phase 3C update) and `docs/release/phase-3c-owner-decisions.md`.

## Release-safety verifications

| Check                                                             | Result                                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Branch not behind `main`; clean tree                              | **OK** (0 behind, 0 uncommitted)                                                                                                |
| No real `.env` tracked (only `*.env.example`)                     | **OK** (`/.env.example`, `studio/.env.example`)                                                                                 |
| `.env.example` contains only placeholders/flags (no real secrets) | **OK**                                                                                                                          |
| No hardcoded secrets in source                                    | **OK** (form ids/Turnstile secret come from server env; scan matches were npm integrity hashes)                                 |
| Legal pages are drafts (none professionally reviewed)             | **OK** — all `legalReviewStatus:"draft"`; no `professionallyReviewed` value set                                                 |
| Seed is the production default (live Sanity off)                  | **OK** — `sanityLiveContentEnabled = NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED === "true"` (unset → false)                        |
| No placeholder proof rendered publicly                            | **OK** — `/examples` 404s; `/case-studies` shows the illustrative disclaimer (§D visual cert)                                   |
| Canonicals / sitemap / redirects intact                           | **OK** — covered by e2e (`seo`, `redirects`, `sitemap` specs) in the 768 pass                                                   |
| Form APIs fail closed                                             | **OK** — covered by unit (`forms`, `rate-limit-adapter`) + e2e (`contact`, `growth-plan`)                                       |
| No real Formspree submission performed                            | **OK** — no Formspree id configured locally; e2e + preview use the dev-bypass path → `delivery-unavailable`; no live email sent |
| Secrets never printed/committed                                   | **OK** — none read or emitted this session                                                                                      |

## Conclusion

The release candidate passes every **local** Definition-of-Done gate and release-safety check. The
remaining go-live requirements are **not** local: professional legal review, owner business-policy
sign-offs, Cloudflare provisioning + secrets (external verification in §F), the PR + green CI (§G), and
the explicit merge (§H) and deploy (§I) authorizations. Those are tracked in
`docs/release/phase-3c-owner-decisions.md` and `docs/content/phase-3b-release-blockers.md`.
