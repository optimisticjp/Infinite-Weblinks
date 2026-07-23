# V2 Redesign — Handoff

The V2 redesign of the Infinite Weblinks marketing site is **complete** (Phases 1 → 2A–2S) on branch
`claude/infinite-weblinks-v2-design-yb1yi3`. This is the handoff for review, PR and the separate
Phase 3 production-readiness track. **Nothing here has been deployed or merged, and no PR is open.**

## 1. Final redesign scope

The site was migrated from the dark/neon "Constellation" cosmic system to **"Clear Systems"** —
~70% Stripe structure/restraint + ~30% Clay warmth/colour, light-first, with dark reserved for a
single signature section. Every route and template family is V2; the document root is light; the
proven-dead cosmic/registry visual code and tokens have been removed.

## 2. Reference documents

- **Route/template inventory:** `docs/design/v2-final-route-inventory.md`
- **Legacy-reachability proof + removals:** `docs/design/v2-legacy-reachability.md`
- **Visual/responsive/a11y review:** `docs/design/phase-2s-visual-review.md`
- **Phase 2S implementation report:** `docs/design/phase-2s-implementation-report.md`
- **Design source of truth:** `docs/design/v2-design-spec.md` (+ `/design-preview`, `/design-preview/shells`)

## 3. Design-system source of truth

CSS Modules + a CSS-variable token system (`src/styles/tokens/`, V2 layer in `v2.css`), the V2
semantic components (`PageHeader`, `SectionShell` light/alt/night, `Card`, `CardGrid`, `Callout`,
`Button`, `FinalCtaSection` + the feature card set), and lucide-react. Tailwind/shadcn are not used and
must not be introduced incidentally (see CLAUDE.md → Design Direction).

## 4. Major architectural decisions

- **Light-first root** via `theme-light` on `<body>` (no token-map duplication); night is an
  explicitly-scoped section only.
- **One section registry retired** — the homepage composes explicit `Homepage*Section` components; the
  old data-driven `SectionType`/`SectionConfig` registry was proven dead and removed.
- **Status + gated-proof surfaces** migrated to the shared V2 kit while preserving their gates.
- **Proof-based dead-code removal** in two reviewable clusters, each verified with
  typecheck/build/cf:build/full-e2e.

## 5. Content and behaviour preserved

All route URLs, the 73 redirects, sitemap/robots/llms.txt, static params, unknown-slug 404s, the
truthful JSON-LD, noindex conversion routes, the gated `/examples` behaviour, legal routes, the form
APIs / Formspree / Turnstile / rate-limiting / validation schemas, CSP + security headers, Sanity
delivery behaviour, proof statuses, pricing and analytics — all unchanged. No invented proof,
testimonial, metric, price or endorsement was added.

## 6. Tests actually run (all green)

lint · typecheck · `npm run test` (74 files / 1,898 unit tests) · `npm run build` · `npm run cf:build`
(worker bundle, no deploy) · `npm run test:e2e` (760 Playwright + axe tests, 0 failed, 0 flaky).

## 7. Branch divergence from main

`origin/main...HEAD`: 0 behind, **142 ahead** (the full V2 redesign; 421 files, +31,873 / −12,188). (An
earlier draft said 141; the reviewed GitHub comparison at the Phase 2S head is 142/0 — corrected in Phase 3A.)
Phase 2S is 10 commits on top of `10722f0`.

## 8. Known non-design limitations

- Phase 3 (security/infra, legal/proof/trust, release/CI/deploy) is **not started**.
- No measured LCP/CLS/INP/JS-byte/Lighthouse numbers are claimed (not run).
- `theme-band` + a few legacy tokens are retained because a live light section still consumes them
  (documented in the reachability report) — a candidate for a later tidy, not a defect.
- CSP still uses `script-src 'unsafe-inline'` for Next's inline bootstrap (a known Phase 3A item).

## 9. Exact Phase 3A scope — security, forms & infrastructure hardening

Turnstile production hardening; Formspree transport review; rate-limiting verification (Cloudflare
rule + in-memory fallback); form-handler + API `/owasp-security` review; validation-schema audit;
Cloudflare bindings / D1 / R2 configuration verification; CSP hardening (per-request nonces to drop
`unsafe-inline`) and the other security headers; secret-handling review. **No design/UI changes.**

## 10. Exact Phase 3B scope — legal, proof, trust & content readiness

Legal-copy review and sign-off (privacy/cookies/terms/refunds/accessibility); the proof pipeline
(when/how a verified case study or example is published through the existing gate — statuses,
review notes); trust/credibility content; final copy pass. **No fabricated proof; the gate stays until
a real record is verified.**

## 11. Exact Phase 3C scope — release certification, PR, CI, merge & deployment

Open the PR; wire/verify CI on the branch (see §14); full green-checks certification; stakeholder
review; merge to `main`; the Cloudflare production deployment (`npm run cf:deploy`) with its
authorization; post-deploy smoke. **Deployment requires explicit authorization.**

## 12. Proposed PR title

`V2 redesign — "Clear Systems" light-first rebuild (Phases 2A–2S)`

## 13. Proposed PR body

> Rebuilds the Infinite Weblinks marketing site from the dark "Constellation" system to **"Clear
> Systems"** — ~70% Stripe / ~30% Clay, light-first, with dark reserved for a single signature CTA
> section. Every route and template family is migrated to the V2 kit (PageHeader / SectionShell /
> Card / CardGrid / Callout / Button / FinalCtaSection); the document root is light; and the
> proven-dead cosmic/registry visual code and tokens are removed.
>
> **What changed:** light-first root convergence; V2 status screens (404/error) and gated `/examples`
> templates; removal of 70 dead files (the orphaned section registry + cosmic viz + legacy heroes) and
> ~27 dead tokens + 3 dead theme classes, each verified with typecheck/build/cf:build/full-e2e.
>
> **What did not change:** route URLs, the 73 redirects, sitemap/robots/llms.txt, form APIs,
> Formspree/Turnstile, rate limiting, validation schemas, CSP/security headers, Sanity delivery, legal
> wording, proof statuses/gate, pricing, analytics and deployment config — all Phase 3 concerns.
>
> **Docs:** final route inventory, legacy-reachability proof, visual-review, and the Phase 2S report
> live under `docs/design/`.
>
> **Checks:** lint · typecheck · 1,898 unit tests · build · cf:build (no deploy) · 760 Playwright + axe
> tests — all green.
>
> **Not included:** Phase 3A (security/infra), 3B (legal/proof/trust), 3C (release/CI/deploy).
>
> 🤖 Generated with [Claude Code](https://claude.com/claude-code)

## 14. Review checklist

- [ ] Light is the default canvas on every route; dark is one reserved section (0 on legal/404).
- [ ] No cosmic canvas / starfield / globe / gradient content heading / legacy hero anywhere live.
- [ ] One H1 per page; no horizontal overflow at 360–1440; 200% text + reduced motion hold.
- [ ] Skip link reaches `#main` on ordinary routes and the 404; no serious/critical axe.
- [ ] All redirects, sitemap, robots, canonical URLs and JSON-LD unchanged; gated `/examples` 404s.
- [ ] No fabricated proof/metric/price/testimonial; no new dependency or external host.
- [ ] Removed files are proven dead (see `v2-legacy-reachability.md`); retained legacy is documented.
- [ ] lint / typecheck / unit / build / cf:build / e2e green.

## 15. Rollback considerations

- The redesign is additive on the branch — reverting the PR (or not merging) leaves `main` untouched.
- The dead-code removals (Commits 7–8) are isolated, reviewable commits; any single cluster can be
  reverted independently if a hidden consumer surfaces (none did across typecheck/build/e2e).
- No data migration, no schema change, no deployment — there is nothing to roll back on the
  production/CMS side until Phase 3C.

## 16. CI note

CI has **no run on this branch yet** because the push workflow (`.github/workflows/ci.yml`) does not
trigger on `claude/**` pushes and no pull request exists. This is expected — **not a test failure.**
CI runs when the PR is opened in Phase 3C (or the trigger is broadened there).
