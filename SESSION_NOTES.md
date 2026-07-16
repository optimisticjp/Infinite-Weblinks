# Overnight Build Report — Infinite Weblinks (M5 → M10)

**Branch:** `impl/full-site-build` (based on `origin/main`, GATE-1)
**Status:** All milestones M5–M10 implemented, verified green, and pushed. Nothing merged to `main`.
**Date:** 14 July 2026

---

## 1. Headline outcome

The full marketing site is built on top of the approved GATE-1 opening. The production build generates **140 pages**, the whole test suite is green, and the Cloudflare/OpenNext Worker bundle builds cleanly. The site renders entirely from a typed, status-gated local content layer today and is wired to swap to Sanity when a project is provisioned — with the same public status gate in both paths.

## 2. Verification (all green on the pushed HEAD)

| Check | Result |
|---|---|
| `tsc --noEmit` (typecheck) | 0 errors |
| `eslint .` | 0 errors, 0 warnings |
| `vitest run` (unit) | **78 passed** (4 files) |
| `playwright test` (e2e + axe) | **36 passed** |
| `next build` | ✓ compiled, **140 pages** generated |
| `opennextjs-cloudflare build` | ✓ `.open-next/worker.js` produced |

## 3. Commits (in order)

- `feat(M5)` complete homepage — content data layer, all sections, section renderer
- `feat(M6)` Growth Plan Builder, contact form, forms API + validation
- `feat(M7)` shared route primitives, legal pages, robots + sitemap
- `feat(M7)` service detail template + RelatedLinks + nav slug reconciliation
- `feat(M8)` complete Sanity Studio schema model
- `feat(M9)` branded 404 + web manifest + homepage services-preview cap; M10 test coverage
- `feat(M7)` detail templates (tools, roadmaps, articles, goals, business types, starting points)
- `feat(M7)` listing/hub indexes + how-it-works, faq, about
- `fix(M9)` accessibility — badge contrast on light band + keyboard-scrollable journey rail
- `fix(M9)` give the growth-plan and contact pages a real H1

## 4. Route inventory (140 pages)

- **Homepage** `/` — GATE-1 opening (Hero + Editorial) preserved exactly, then 14 data-driven sections via a section-renderer registry.
- **Journey / hubs:** `/how-it-works` (reuses journey + systems + delivery + process, with anchor wrappers so every mega-menu deep link resolves), `/solutions` (by goal / business type / starting point), `/faq`, `/about`.
- **Services:** `/services` (full index by 16 categories) + `/services/[slug]` (70 pages).
- **Tools:** `/tools` (index) + `/tools/[slug]` (10).
- **Roadmaps:** `/roadmaps` + `/roadmaps/[slug]` (7).
- **Learn:** `/learn` + `/learn/[slug]` (5 articles).
- **Taxonomy detail:** `/goals/[slug]` (10), `/business-types/[slug]` (7), `/starting-points/[slug]` (8).
- **Conversion:** `/growth-plan` (builder), `/contact` — both `noindex`.
- **Legal:** `/privacy`, `/cookies`, `/terms`, `/accessibility`.
- **Infra routes:** `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, branded `/404`.
- **API:** `/api/forms/growth-plan`, `/api/forms/contact` (server-rendered).

## 5. Content architecture

- 169 typed, status-gated seed items under `src/lib/content/data/` (getters apply the `verified`/`readyToPublish` gate in both seed and future-Sanity paths).
- Proof (case studies / testimonials / examples) is `placeholder` → **hidden** until verified; those sections render `null`.
- A 24-case referential-integrity test locks every cross-slug reference (services↔tools↔goals↔stages↔business-types↔roadmaps) and the locked taxonomy names.

## 6. Growth Plan Builder (priority feature)

- Deterministic, reviewed rule engine (specificity + priority + safe fallback) — **never free-form AI**; always returns a non-empty structured recommendation.
- Rule set keyed on the **canonical content slugs**; the builder sources its business-type/goal/stage options from the same getters, so form and engine cannot drift (reconciled during integration).
- Accessible multi-step wizard (fieldset/legend per step, live-region announcements, error summary, no auto-advance); recommendation recomputed server-side.

## 7. Forms behaviour (credential-gated, honest)

- Shared Zod schemas (client UX + server authority), header-injection guard, honeypot + timing + in-memory rate-limit.
- **Turnstile** uses Cloudflare's official vanilla script (no npm dependency, CSP-allowed) — inert until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Formspree** forwarding; when delivery isn't configured the form shows a clear temporary message + `support@infiniteweblinks.com` mailto fallback and **never reports a send as delivered when it wasn't.**

## 8. SEO & structured data

- Per-route metadata + canonical URLs; utility/personalised routes `noindex`.
- JSON-LD: Organization, WebSite, BreadcrumbList, Service, Article, FAQPage (only where rendered), ItemList — **no fabricated Review/AggregateRating**, empty `sameAs` until verified.
- `robots.txt` (excludes API + personalised result), content-driven `sitemap.xml`, web manifest.

## 9. Security posture

- CSP + HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy in `next.config.ts` (allows Sanity, Formspree, Turnstile, Cloudflare Analytics only).
- No secrets committed. Rate-limit/Turnstile/Formspree all env-driven.
- Known hardening TODO: `script-src 'unsafe-inline'` is a pragmatic allowance for Next hydration; per-request nonces are a Worker-level follow-up (documented in `next.config.ts`).

## 10. Accessibility (axe-verified)

- No serious/critical violations on: homepage, open mega-menu, service detail, solutions, services listing, how-it-works, and the Growth Plan builder.
- Fixes made this session: delivery-model **badge contrast** on the light band (mixed toward heading ink), **keyboard-focusable** Growth Journey scroll rail, and a real **H1** on the two conversion pages. Reduced-motion respected; skip link + focus-visible from GATE-1 retained.

## 11. Performance

- 140 pages statically generated (SSG). Homepage services block capped to a focused preview (full catalogue on `/services`). Images `unoptimized` (Cloudflare has no `sharp`; Sanity CDN resizes editor media). Self-hosted fonts via `next/font`.

## 12. Deploy readiness (owner action required)

- `wrangler.jsonc` / `open-next.config.ts` unchanged: R2 incremental cache (`iw-inc-cache`), D1 tag cache (`iw-tag-cache`, id `29042ec8-…`), Workers Assets. `nodejs_compat` set. `opennextjs-cloudflare build` succeeds.
- **The owner deploys.** Nothing here attaches the production domain, alters DNS, or recreates the R2 bucket / D1 database / Worker / GitHub integration.

## 13. Autonomous decisions worth noting

- Reconciled the rules-engine slugs and the mega-menu business-type/starting-point hrefs to the canonical data slugs.
- Replaced the planned `@marsidev/react-turnstile` dependency with Cloudflare's vanilla script (kept the build green with no credential-gated npm dep).
- Capped the homepage services preview to 8 secondary categories.
- On `/how-it-works` the reused journey/systems/delivery sections are all dark-themed, producing a dark run that couldn't be broken without editing shared components — accepted as an intentional "deep journey" treatment for that page.

## 14. Deferred / blocked (needs owner credentials or a decision)

- **Sanity live content:** schema model is complete, but dataset seeding + reads need a provisioned project (`NEXT_PUBLIC_SANITY_PROJECT_ID` etc.). App runs on local seed data until then.
- **Turnstile + Formspree keys:** forms are wired and safe without them; add the four env vars to enable live delivery/spam protection.
- **Legal copy:** the four legal pages are accurate-to-stack structural drafts and carry a visible "requires professional legal review" note.
- **Real proof:** case studies/testimonials stay hidden until real, verified content is added.

## 15. Next steps for the owner

1. Review the branch (do not expect it merged — it isn't).
2. Provide env vars for Turnstile/Formspree (and Sanity when ready).
3. Commission professional legal review of the four legal pages.
4. Deploy from the branch when satisfied.

---

## Integration-correction pass (post-review)

A focused correction pass (no redesign) resolved six items:

1. **Sanity runtime claim.** Removed the misleading `usingSanity` export. Added a real,
   mock-tested read adapter (`src/lib/sanity/fetch.ts` — `sanityFetch` + `fromSanityOrSeed`,
   never throws, per-getter seed fallback) and wired the cleanly-mappable, status-gated
   getters (`getFaqs`, `getCaseStudies`, `getTestimonials`, `getExamples`) through it with
   real GROQ (`src/lib/sanity/queries.ts`). The richer taxonomy types (services/goals/
   stages/tools/roadmaps/articles/legal) remain **intentionally seed-backed and deferred**:
   the Studio schema and app types diverge (name↔title, plainSummary↔summary,
   mainTools↔exampleTools, references↔slugs, text↔string[], portable-text↔blocks[], and
   app-only icon/color/exampleTools/readMinutes with no Sanity source), so a correct query
   path needs a schema↔type reconciliation + a live dataset to validate — larger than a
   correction. `index.ts` documents this precisely.
2. **Route coverage.** Added hubs `/business-types`, `/starting-points`, `/resources`
   (the last fixes a previously-dead top-nav link). Added status-gated proof routes
   `/case-studies(+/[slug])` and `/examples(+/[slug])` — they **404 unless a record is
   Verified/Ready-to-Publish** (no placeholder proof is ever published). **Canonical
   decision:** there is deliberately no `/solutions/[slug]`; the canonical detail is
   `/goals/[slug]` (+ `/business-types/[slug]`, `/starting-points/[slug]`), so `/solutions`
   stays a pure hub and no two near-identical detail pages compete. Sitemap updated
   (hubs added; noindex `/growth-plan` removed; proof listed only once verified).
3. **Conversion-route robots.** `/growth-plan` and `/contact` are now `noindex, follow`
   (was `noindex, nofollow`) with self-canonicals so `?subject=` variants consolidate.
4. **CI.** Root cause of the all-red history: the Playwright job ran `next start` with no
   preceding `next build` (jobs don't share a filesystem with the build job), so the
   webServer failed on every run. Fixed by adding `npm run build` to the e2e job — CI is
   not weakened. (The `build` job — lint/typecheck/test/build/cf:build — was already green.)
5. **Rate-limit readiness.** Added `src/lib/forms/rate-limit-adapter.ts` — `rateLimit(key)`
   prefers a Cloudflare Rate Limiting binding (`FORM_RATE_LIMITER`, wired via
   `getCloudflareContext`) and falls back to the in-memory limiter (dev/preview/tests).
   No Durable Object introduced; the D1 tag-cache DB is not repurposed. To activate in
   production, add the `ratelimits` binding to `wrangler.jsonc` (snippet in the adapter
   header). Both form routes now call the adapter.
6. **Verification** re-run green: lint, typecheck, 89 unit tests, build (145 pages),
   cf:build, and 43 Playwright/axe e2e — including new proof-404 and hub-route coverage.

---

## Site-wide alignment / layout correction pass

**Root cause:** `.iw-container--wide` is a *modifier* (it only sets `max-width`); used
without the base `.iw-container` it loses `margin-inline:auto` + `padding-inline:gutter`,
so the element goes flush-left and touches the viewport edge. Five elements did this: the
header bar, the desktop mega-menu inner panel, the hero inner grid, and the two footer
rows. Fix: add the base `.iw-container` to all five (`GrowthJourneySection` already had it).

**Contract enforced:** standard container `--container` = 1200px, wide `--container-wide` =
1320px, gutter `--gutter` = `clamp(20px,5vw,64px)` (already the token values). Header/hero/
mega-menu use the wide centred container; content sections use the standard one; full-bleed
backgrounds/glows stay full-width while their content centres.

**Other fixes made this pass:**
- **Header fit:** adding the (correct) gutter squeezed the dense header, causing real
  horizontal overflow at 1080px (full nav) and 1280px (2nd CTA). Tightened nav spacing and
  moved the breakpoints so the desktop nav appears ≥1160px and the secondary CTA ≥1400px —
  where they demonstrably fit. Not a redesign; the identity/links are unchanged.
- **Mobile menu bug (real):** the full-screen `position:fixed` overlay was trapped in the
  72px header because the header's `backdrop-filter` establishes a containing block for
  fixed descendants. Fixed by rendering `MobileNav` as a sibling *outside* `<header>`.
- **Production CSS serving:** Next 16.2 Turbopack `next build` + `next start` served a
  broken CSS chunk (one chunk 500s), rendering the page unstyled under `next start` (and
  thus in CI e2e). Switched the build to `next build --webpack`, which serves complete CSS.
  The OpenNext/Cloudflare deploy path was verified styled either way (it repackages the
  build correctly); this change only fixes the local/CI `next start` server.

**Regression guards added:** a source-level unit test forbidding modifier-only
`.iw-container--wide`, and a Playwright `layout.spec.ts` asserting no overflow at 6 widths,
header/hero/mega-menu content insets + centring, container max-widths, and full-viewport
mobile-nav coverage (all tolerance-based, not pixel snapshots).

**Verified:** lint 0, typecheck 0, 90 unit tests, `next build` (webpack) 145 pages,
`cf:build` (OpenNext worker), 89 Playwright/axe e2e. Screenshots at 1440/1024/768/390/360
in `review-artifacts/`.

---

## Launch-readiness pass (branch `polish/launch-readiness`, from `origin/main`)

Preparing the accepted build for its next integrations without touching the domain, DNS,
secrets, or completed systems. Audit-first, grounded fixes only, in focused commits.

**Audit result:** no dangling internal links; content clean (no placeholder/lorem/TODO copy);
every route declared metadata **except the homepage**, which lacked a self-canonical. All prior
layout regression guards still green.

**Grounded fixes + now-doable scaffolding (this branch):**
- **Homepage self-canonical** — the only route missing one; title/description/OG still inherit
  the approved root-layout defaults.
- **Open Graph image** — `app/opengraph-image.tsx`, `force-static` so it is a build-time PNG
  (no runtime image rendering on the Worker). Locked slogan + palette; every route inherits it.
  Owner can swap in a designed asset with no other change. Verified served as `image/png`
  1200×630 through the OpenNext worker.
- **Cloudflare Web Analytics** — env-gated `<Analytics/>` beacon; renders only when
  `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` is set (host already CSP-allowed).
- **Search Console verification** — env-gated `google-site-verification` meta; renders only when
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` is set. Both features verified in off *and* on states.
- **Form rate-limit binding** — declared `FORM_RATE_LIMITER` (5/60s) in `wrangler.jsonc` so the
  production Worker uses a region-consistent counter instead of the per-isolate in-memory
  fallback. Validated via `wrangler deploy --dry-run`.
- **`.env.example`** — documents the two new public variables.

**Deliverable:** `LAUNCH.md` — code-complete-and-verified vs owner-required, a full env-var
inventory, integration-by-integration owner actions (Cloudflare, Sanity/Studio, Formspree,
Turnstile, Analytics, Search Console, verified content, legal, domain/DNS), a prioritised
checklist, and a deploy runbook.

**Verified on this branch:** lint 0, typecheck 0, 90 unit, `build` (webpack) 145 routes,
`cf:build` (OpenNext worker), 89 Playwright/axe e2e, `wrangler deploy --dry-run` (bindings
resolve), local workerd smoke test (real routes 200; hidden proof + unknown 404; OG image PNG).
Not merged to main.

---

## Sanity CMS integration (branch `integration/sanity-cms`, from `origin/main`)

Real CMS wiring for project `ay705p7x` / dataset `production` (owner-provided, public IDs).

**Audit + reconcile (no second content model):** the Studio schema was normalised/reference-based
while the app types are denormalised/slug-based, with real divergences (name↔title, references↔
slug arrays, `text`↔`string[]`, portable-text↔plain, and app-only fields like icon/color/
exampleTools/outcome). Reconciled the EXISTING schema to hold the reviewed seed exactly, and made
the GROQ projection its inverse.

**Delivered (all credential-free, validated offline):**
- **Connect** — app client + Studio config already env-driven; set the public project IDs as the
  concrete `.env.example` values (and fixed a gitignore bug that left `studio/.env.example`
  untracked).
- **Seed pipeline** — `src/lib/sanity/seed-transform.ts` + `npm run seed:export` generate
  `studio/seed/production.ndjson`: 166 docs, deterministic ids (`<type>.<slug>`), 1039 references,
  **0 dangling, 0 duplicates**. `--replace` import is idempotent. Reference targets (stages/
  systems/delivery-models) are seeded so every `_ref` resolves. **Fake placeholder proof is NOT
  seeded** (guardrail).
- **Schema reconciliation** — 12 document schemas extended to hold the seed's editorial fields;
  `startingPoint` reconciled to what the site renders; rich-text fields (`faq.answer`,
  `article.body`) made plain to match the app's plain rendering. Validated with `sanity build`.
- **GROQ + adapters** — full status-gated taxonomy + learn + FAQ wired through `fromSanityOrSeed`
  (was faq + proof only). Each query gates at source and projects to the exact app type; single
  getters resolve against the gated list (unverified → 404).
- **Status gating + fallback preserved** — verified/readyToPublish only, re-checked in the adapter;
  unconfigured/empty/unreachable → seed. Structural reference data, chrome, rules and legal stay
  code-authoritative.
- **Round-trip tests** — 15 tests prove seed → document → projection == seed for every wired item,
  plus dataset integrity (no dupes, refs resolve, no fake proof, valid statuses).

**Verified:** lint 0, typecheck 0, 105 unit (incl. 15 round-trip), `build`, `cf:build`,
`sanity build`, 89 e2e; workerd smoke — content routes 200 rendering seeded taxonomy, proof 404.

**Environment constraint:** the build sandbox cannot reach `*.api.sanity.io` (proxy egress policy),
so live seeding, Studio deploy, admin verification and the live read must run from the owner's
environment (the deployed Cloudflare Worker reaches Sanity fine). Steps are in `LAUNCH-SANITY.md`.
Not merged to main.

### Sanity go-live — completed by owner + pinned config

- **Seed imported:** 166 documents into `ay705p7x` / `production`.
- **Studio deployed:** <https://infinite-weblinks.sanity.studio/>; **both admins verified** they can
  sign in and view/edit content.
- **Deployment pinned:** app id `xfsjbzgp9jvzu7htnt03qtvf` + host `infinite-weblinks` added to
  `studio/sanity.cli.ts` (public identifiers, not secrets) so future `sanity deploy` runs don't
  prompt and can use fine-grained version selection.
- **styled-components warning:** the declared floor (`^6.1.0`) sat below sanity's peer requirement
  (`^6.1.15`); raised the declared range to `^6.1.15` (installed version unchanged at 6.4.3). The
  `sanity build` warning is gone.

### Release-safety flag — public reads seed-backed by default

To make the Sanity PR safe to merge without changing the currently visible site:

- Added build-time flag **`NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED`** (default `false`).
- **Off (default):** every public content getter returns the reviewed seed content and issues **no**
  Sanity query (`fromSanityOrSeed` short-circuits on the flag). Content pages build fully static —
  byte-identical to pre-integration `main`.
- **On (`"true"`):** the completed live path is active — strict status gating, authoritative
  empty-result behaviour, ISR (via the Sanity fetch's `next.revalidate`), and outage → seed fallback.
- Sanity infrastructure is untouched: Studio, schemas, imported 166-doc dataset, `seed:export`, and
  the GROQ integration all remain in place. Enabling live reads is a future flag flip + controlled
  preview verification (documented in LAUNCH-SANITY.md).
- Flag added to both `.env.example` files; adapter tests extended to prove: flag-off → seed with no
  query; flag-on → live reads; request failure → seed; successful empty → authoritative `[]`.

**Verified:** lint 0, typecheck 0, 109 unit, build (flag off → fully static; flag on → ISR 30s),
`cf:build`, `sanity build`, 89 e2e. Not merged to main.

## Phase 0 — project context, review tooling, environment detection (branch `claude/phase-0-setup-2mwcxx`, from `main`)

Setup-only phase. **Zero visual diff** — no component, stylesheet, token, or route touched
(`git status -- src/` is empty; no render-affecting config changed). No npm dependency added
(`npm ci` from the existing lockfile only; `package-lock.json` unchanged). Sanity untouched. No
browser installed or downloaded.

**Verified green:** `npm run lint` 0 · `npm run typecheck` 0 · `npm run test` 109 passed ·
`npm run build` (webpack) succeeds · `npm run probe:e2e` exits 0.

### 1. E2E tier

**TIER 2 — BROWSER-ONLY.** The sandbox Chromium (`/opt/pw-browsers/chromium`, Chromium
141.0.7390.37) **launches** headless fine (probe launched it, evaluated `1+1`, closed it). What is
missing in a fresh session is a running server, not a browser. `playwright.config.ts` will select
the **sandbox** executable (mirrors its own `existsSync(PW_CHROMIUM ?? default)` logic). CDN
(`cdn.playwright.dev`) and external net both reachable (HTTP 403 to HEAD/GET, i.e. reachable).

No blocker — **section 7 ran in full**: built (webpack), served on `PORT=3101 npm run start`, and
captured all 39 baseline shots (0 failed). Remediation for any future TIER-2 session is baked into
`docs/ENVIRONMENT-CAPABILITIES.md`: `npm run build` → `PORT=3101 npm run start` → capture. The
committed probe snapshot reflects a **fresh** session (build absent, no server) on purpose — future
sessions get their own answer via `npm run probe:e2e` (re-runs in ~3s, always exits 0). Nothing was
skipped.

### 2. Skills — kept 15, archived 306 (of 321)

Kept (mapped to the named categories — frontend/UI-UX, design systems, copy/content, CRO/marketing,
SEO, web security, testing, context engineering, git/PR):

`ui-ux-pro-max` · `frontend-design` · `design-system` · `copywriting` · `humanizer` · `cro` ·
`seo` · `seo-technical` · `owasp-security` · `test-driven-development` · `write-tests` ·
`context-engineering` · `review-local-changes` · `commit` · `create-pr`

Everything else (306 dirs — `scanpy`, `rdkit`, `qiskit`, `wowerpoint`, the whole scientific set, plus
the marketing/SEO/context long tail) moved to `.claude/skills-archive/`, structure preserved, all as
tracked git renames (recoverable). The `## Skills` routing table in the new `CLAUDE.md` lists only
these 15 with a "when to reach for it" column.

### 3. For Phase 1 (found, NOT fixed — this phase changes nothing visual)

- **The tracked baseline was never produced by `scripts/screenshots.mjs`.** The old
  `review-artifacts/screenshots/` images were captured at `deviceScaleFactor: 1`
  (old `home-1440.png` = 1440×22111), while the script specifies `2`. Confirms the prompt's "some
  process that is not in the repo." The new baseline is correctly 2× (`home-1440` = 2880×44222).
- **Homepage full-page is enormous** — 2880×44222 @2× (~9.5 MB/PNG). Not a bug, but if the page is
  meant to be that long it dominates artifact weight; Phase 1 may want section-level shots.
- **Route/viewport coverage narrowed to the prompt's required list.** The old set also covered
  `solutions`, `tools`, `business-types`, `starting-points`, and the other detail routes, plus 768 and
  360 widths. The new baseline follows the Phase-0 spec (9 routes × 1440/1280/1024/390 + 3 focused
  shots). Phase 1 can extend `ROUTES`/`VIEWPORTS` in `scripts/screenshots.mjs` to restore full breadth.
- **No component audit performed** (out of scope for a zero-diff phase) — so "no bugs found" here
  means "not looked for," not "verified clean."

### 4. Where the prompt and the repo diverged

- **Accurate:** `.gitignore:31` is `/artifacts/`; `screenshots.mjs` defaulted to port 3100 vs
  Playwright's 3101; it wrote to gitignored `artifacts/screenshots`, was homepage-only, and wasn't
  wired to any npm script. All fixed.
- **Minor:** the "keep `deviceScaleFactor: 2` — already right" note is true of the *script*, but the
  committed images were 1×, so that behaviour was never actually exercised by whatever generated them.
- **Decision worth recording (deviation):** the prompt implies both `review-artifacts/baseline/` and
  `review-artifacts/screenshots/` hold reproducible images. Two identical 84 MB copies of 2× full-page
  PNGs would bloat git history for no benefit at Phase 0, so I committed the reproducible before-picture
  to `baseline/` (the required frozen deliverable) and left `screenshots/` as the empty, tracked
  **default-output** dir (`.gitkeep` + README) that each phase regenerates and diffs against `baseline/`.
  The legacy 1× set was removed (superseded, un-reproducible; recoverable from git history).
- Fresh cloud VM had no `node_modules`; installed via `npm ci` (lockfile only, no new deps).

### What shipped this phase

- `scripts/probe-e2e.mjs` + `npm run probe:e2e`; outputs `review-artifacts/e2e-capability.json` and
  `docs/ENVIRONMENT-CAPABILITIES.md`.
- New `CLAUDE.md` (project-specific); old template moved to `docs/TEMPLATE-NOTES.md`.
- `.claude/agents/{light-budget,motion-critic,perf-guard}.md`.
- `.claude/settings.json` (lint-on-edit; typecheck+test on stop).
- Skills pruned 321 → 15 kept, 306 archived.
- `scripts/screenshots.mjs` rewritten (tracked output, port 3101, route+viewport lists, `--out`,
  kept 2×/reduced-motion/mega-menu/mobile-nav/1900ms settle, same browser resolution) +
  `npm run screenshots`; `review-artifacts/baseline/` captured (39 shots); `review-artifacts/README.md`
  rewritten.

## Phase 1 — typography, spacing, gradient discipline, three bugs (branch `fix/phase-1-foundation`, from `main`)

Foundation pass. No new dependencies, no section added/removed, Sanity untouched.

**Verified green:** `npm run lint` 0 · `npm run typecheck` 0 · `npm run test` 109 · `npm run build`
(webpack) · `npm run test:e2e` **92 passed** (TIER 2: built, served on `PORT=3101 npm run start`,
sandbox Chromium). Screenshots: `review-artifacts/phase-1/` (39 shots).

### 1. What changed, and what moved

- **Type (A):** body `16 → 18px` and now fluid; display tracking tightens on desktop
  (`--ls-display -0.02 → -0.035em @≥900px`); heading tracking split (`--ls-h1 -0.025`, `--ls-h2 -0.018`,
  replacing the single `--ls-heading`; h3/h4 now inherit 0 — looser, per the same optics); `--lh-tight
  → --lh-display 1.04 → 1.06`; body weight `400 → 450`; eyebrow `0.8125 → 0.75rem`; h3/h4/lead rescaled
  to 24 / 18 / 21 (lead now clearly above h4); new `--measure: 68ch` applied to every `p` and `.iw-lead`
  at the base layer.
- **Spacing (B):** added `--section-y-tight` / `--section-y-loose` + `.iw-section--tight/--loose`
  helpers. Loose → `connectedSystem`, `finalCtaBanner`. Tight → `testimonialWall`, `learningResources`.
  Every radius-lg section card carrying a heading + body raised to `var(--space-8)` (32px ≥ radius+12):
  ToolUniverse, DeliveryModels, CaseStudy (grid card), StartingPoint, ServicesExplorer (grid card),
  Testimonial, Learning, GoalExplorer result, GrowthJourney systems.
- **Colour (C):** `--band #f4f1ea → #f2eef6` (warm white, violet undertone). Recomputed band contrast
  after the shift: `band-ink ≈ 17.4:1`, `band-ink-2 ≈ 12.5:1` — both still far above the 7:1 AAA the
  file targets, so the documented figures hold. Added per-theme `--surface-hover` (G3).
- **Gradient discipline (D):** gradient text now appears on **exactly two elements site-wide** — the
  hero H1 accent and the final CTA headline (both `.iw-gradient-text`). Removed it from GrowthJourney
  ("one connected path"), ConnectedSystem ("not separate silos"), the growth-plan H1, **and the 404
  numeral** (an independent gradient the prompt didn't mention — see §2). Those headings are now uniform
  `--text-heading`. Grep proof in the PR.
- **Header alignment (F):** `SectionHeader` is a two-slot grid (text left, optional `aside` right) so
  every section heading sits on the same left edge; removed `align="center"` from Testimonial, Why, and
  GrowthJourney — only `finalCtaBanner` stays centred.
- **Buttons (G):** lift scoped to md/lg (sm nav pills no longer twitch); primary/brand hover is a
  gradient-position slide, not `filter: brightness()` (which went chalky and washed the glow);
  secondary/ghost hover uses the new per-theme `--surface-hover` instead of `currentColor`.
- **Bug 1 (E) — mega menu:** hover opens; click navigates to the hub; Enter/Space toggles (keyboard can
  now open it); touch = tap-opens / tap-again-navigates. Modality via `matchMedia('(hover:hover)')`;
  keyboard-vs-pointer via a `pointerdown` ref; `closeTimer` cleared on unmount. 3 new e2e tests.
- **Screenshot hygiene (H):** `review-artifacts/screenshots/` gitignored (keeps `.gitkeep`; baseline/
  and phase-N/ stay tracked); full-page shots now `deviceScaleFactor: 1`, viewport crops stay 2× —
  phase-1 set is 34 MB vs baseline's 84 MB.
- **Light-budget audit fixes:** the `light-budget` agent flagged one blocker — a 22px accent glow on
  the `.marker` nodes of the `theme-band` (cream/daylight) `ProcessStepsSection`. Removed it (marker
  reads via its solid fill + number). Also removed the dark-surface `--shadow-card` from the band
  `GoalExplorerFilter .card` (a should-fix in a file I was already in) so it matches the other
  border-only band cards. Re-audit: **zero blockers.**

**Side-by-side vs `review-artifacts/baseline/`:** the page is ~2.8% taller (home 1× full-page
22,111 → 22,729 px) — expected from the larger body, the narrower measure, and the two loose sections.
Headings read tighter and more deliberate; the two gradient headlines (hero, final CTA) now carry all
the colour emphasis while every other heading is a confident uniform weight; the cream band is a cleaner
violet-white; cards breathe; section headings share one left edge down the page. (Baseline full-page is
2×, phase-1 full-page is 1× per H — compare layout/flow, not pixels.)

### 2. Where the prompt and the repo diverged

- **No shared `accent` class.** Part D assumed repointing one shared `accent` class ("one change, not
  fifteen"). Reality: gradient text was the global `.iw-gradient-text` applied at ~4 explicit call sites,
  plus `EditorialStatement`'s own solid-violet `.accent` (not a gradient). So `.iw-gradient-text` *is*
  the gradient class — I kept it, applied it at exactly the two allowed sites, and removed it elsewhere.
  No repointing/new class was needed.
- **A third gradient-text instance the prompt missed:** the **404 numeral** (`not-found.module.css .code`)
  had its own `background-clip: text` + `--grad-text`. To honour "exactly twice site-wide" I made it a
  solid dimmed `--text-muted`. (`EditorialStatement`'s solid-violet accent on the cream band is NOT
  gradient text and is the documented, preserved GATE-1 opening — left as-is; see §3.)
- **Weight-based emphasis doesn't map.** Part D suggested emphasis via `font-weight: var(--fw-bold)`
  "against the heading's normal weight." Section headings already render at `--fw-black` (800), so a
  `--fw-bold` (700) accent would read *lighter*, not emphasised. The correct reading of "emphasis from
  weight, not colour" here is uniform headings — which is what CLAUDE.md's "every other heading is
  var(--text-1)" already says. Implemented as uniform.
- **"Keyboard can't open the menu" was already false.** The old `onClick` toggled on Enter too, so
  keyboard *could* open it (the existing passing e2e proves it). The real live bug was the mouse
  hover-then-click dead-menu, which is fixed.
- **Gradient text on the final CTA needed a contrast tweak.** The pink→orange gradient headline over the
  same-direction banner gradient measured ~2.97:1 (just under 3:1 large-text AA) in its worst case, so I
  raised the banner's existing dark scrim `0.5 → 0.6` (its documented job is text contrast) → ≥3.6:1.
- **E2E hydration flake (pre-existing, masked by CI `retries:1`).** Tests that press Enter immediately
  after `goto` race React hydration; exposed locally at `retries:0`. Added `waitForLoadState("networkidle")`
  to the keyboard tests. Hover-based tests were unaffected. Also updated `layout.spec.ts` mega-menu tests
  to `hover()` (they used `click()`, which now navigates).

### 3. For Phase 2 (found, NOT fixed)

- **`EditorialStatement` accent is a solid violet colour** on the cream band (`--violet-deep`, ~6:1).
  It's documented and is the preserved GATE-1 opening, but strictly CLAUDE.md says "emphasis from weight,
  never colour." Worth a deliberate decision in Phase 2 (keep as an approved exception, or make it weight).
- **Radius-xl featured panels** (ServicesExplorer/CaseStudy `.featured`, radius 28px) have desktop
  padding ~36px < radius+12 (40px). The prompt scoped the padding rule to radius-lg (32px); the xl panels
  are a separate call.
- **Pre-existing arbitrary values** not in this phase's scope: `Hero.module.css .areaChip` `padding: 6px`;
  `GrowthJourneySection.module.css .systemName/.systemDesc` `font-size: 1.05rem / 0.92rem`,
  `line-height: 1.5`; a couple of `gap: 6px`. Off the 4px / token scale.
- **`aside` slot is available but unpopulated.** Part F suggested wiring the goal-explorer filter / a
  count into it; the grid-holds-the-edge fix works without it, so population was deferred to avoid
  restructuring sections this phase.
- **`ProcessStepsSection` cycles up to 8 accent hues** on the cream band (`PALETTE`, per-step) — the
  light-budget agent flagged it "more than two accent colours" (should-fix). It's the "connected
  spectrum" motif (GrowthJourney's stage rail does the same on dark), so whether it's sanctioned
  colour-coding or a rainbow to tame on daylight is a deliberate Phase 2 call — not touched here.
- **`StartingPointSelector`** drives per-row `sp.color` (IconTile + badge + left border) — several hues
  in one band section; defensible as domain colour-coding, worth a conscious confirm in Phase 2.

## Hotfix — mega menu, properly (branch `fix/mega-menu-hover-state`, from `main`)

The Phase 1 mega-menu fix was still broken in the same way, re-entered through a different door.
The Phase 1 `onClick` set `setOpenKey(null)` before `router.push` — closing the panel while the
cursor is still on the trigger. `onMouseEnter` is one-shot and only fires on a boundary crossing;
the pointer is already inside, so it can't refire, and the menu sits dead. Same outcome as the
original toggle bug.

**Root cause:** `mouseenter` mirrors a continuous fact (where the cursor is) in a one-shot handler,
so the mirror desyncs and can't self-correct. Patching *when* `setOpenKey` runs keeps failing.

**Fix (self-healing state):**
- Removed the per-`<li>` `onMouseEnter`; added a single `onPointerMove` on the `<nav>` that
  hit-tests `closest("[data-nav-item]")` and syncs `openKey`. `pointermove` fires on every pixel, so
  the state corrects the instant the cursor twitches — no dead window. Guarded on
  `hoverCapable && pointerType === "mouse"`; not throttled (a `closest()` per frame is nothing).
- Deleted `setOpenKey(null)` from the click handler's hover branch. Route changes still close the
  panel via `useEffect([pathname])`; same-route clicks correctly leave it open (cursor is on the trigger).
- Kept everything else intact: keyboard `onKeyDown` toggle, `clickFromPointer` ref, `hoverCapable`
  detection, Esc handler, outside-mousedown close, unmount cleanup, the touch first/second-tap path.
- Added `## Hover is not state` to CLAUDE.md.

**Why the Phase 1 tests missed it:** `.hover()` teleports Playwright's virtual mouse to the target,
crossing the boundary and manufacturing the `mouseenter` a real user (whose cursor is already there)
never generates. The tests simulated a user who moves away after every click and comes back. That
user doesn't exist.

**Which Phase 1 mega-menu tests used `.hover()` to re-establish a hover state after an interaction:**
**exactly one** — the panel-link regression test ("clicking a panel link … reopens on the next
hover"), which re-opened via `trigger.hover()` after clicking a link. Converted it to
`page.mouse.move(cx, cy)` with real coordinates. The other two are clean: the "clicking the trigger
navigates to the hub" test uses `.hover()` only for the *initial* open (never a re-open after an
interaction), and the "Enter toggles" test is keyboard-only. (The pre-existing "pointer: hover opens
the panel" test likewise uses `.hover()` only for an initial open — fine.)

**New reproduction test** (`navigation.spec.ts`): moves the real mouse onto the Services trigger,
clicks it (down/up), waits for the hub URL, waits for the panel to close, then moves **1px without
leaving** and asserts the panel reopens. Confirmed **red on `main`** (fails at the reopen — element
not found) and **green on the branch** (stable over `--repeat-each=5`). Also drove the reported
"click a service link, then move without leaving" path in a real (headless) browser and screenshotted
the reopened panel.

**Verified:** lint 0 · typecheck 0 · 109 unit · webpack build · **93 e2e** (Phase 1's 92 + the new
reproduction test), nav spec stable at `--repeat-each=5`.

## Hotfix 2 — mega menu, the dead-band close (same branch `fix/mega-menu-hover-state`, PR #7)

The first hotfix (pointermove) regressed a different way: the panel disappeared while the cursor
travelled from the trigger toward a panel link. Cause was in the prompt I'd implemented — I gated
`clearClose()` inside `if (label !== openKey)`, so moving *within* the open menu (reaching for a
link) never cancelled the close timer that gets armed while crossing the dead band.

The dead band: `.navItem` is `position: static`, so the panel's containing block is the sticky
header. The panel sits at `top: 100%` (72px) while the nav was only ~40px tall and centred — a ~16px
strip between them belonged to neither. Descending toward a link: leave nav → `mouseleave` →
`scheduleClose(140ms)`; enter panel → `pointermove` with `label === openKey` → gated `clearClose`
never runs → +140ms → gone.

**Fixes:**
- **Fix 1 (state):** `clearClose()` unconditionally at the top of `onPointerMove`, before the
  label check. One line moved out of the condition.
- **Fix 2 (geometry):** `.desktopNav { align-self: stretch }` + `.navList { height: 100% }` so the
  nav fills the full 72px header — trigger, gap and panel are one continuous hover region. Visual
  identical (items still centred); only the hit area grows.
- **Fix 3 (affordance):** the chevron now has its own colour (`--text-3`, dimmer than the `--text-2`
  label, so it reads as a mark not punctuation), 15→16px, optically seated on the cap height, and
  brightens to `--text-1` on hover/open alongside the label. Rotation on `[data-open]` kept. No glow,
  no accent — light budget intact. About Us has no chevron (correct — no menu).

**Did removing the dead band eliminate the spurious `mouseleave`, or is Fix 1 load-bearing?**
Measured directly: during a slow down-then-across reach on all four menus, the nav fired **0
`mouseleave` events** with Fix 2. And with Fix 1 reverted (clearClose re-gated) but Fix 2 kept, both
reproduction tests still pass. So **Fix 2 eliminates the spurious mouseleave entirely; Fix 1 is not
load-bearing for the trigger→panel reach.** Fix 1 is kept anyway — it is the correctness fix for a
genuine `mouseleave`-and-return within the same open menu (e.g. grazing the nav's side edge, where a
real close is armed and only an unconditional clearClose cancels it), and it is free. Both, as the
prompt said, not either alone.

**Test findings (this is where it got interesting):**
- New reproduction `panel survives the trip from trigger to a panel link` — red on the branch head,
  green after the fixes, stable at `--repeat-each=5`.
- **Tests converted off teleporting: 1** — the panel-link regression test (`clicking a panel link…`)
  used a bare `.click()` on the link, which teleports over the gap; converted to a stepped
  `page.mouse.move(..., { steps: 25 })` + down/up. (The other mega-menu tests don't teleport between
  two nav elements: the "hover opens" ones only teleport for an *initial* open, and the rest are
  keyboard.)
- **The prompt's verbatim straight-line travel doesn't isolate this bug — it also trips a separate,
  pre-existing issue.** The Services panel's *first* link is in the left column, at x≈189 — **left of
  the nav** (x 358–941). A straight diagonal from the trigger to it cuts across the **Solutions**
  trigger at the nav row and switches menus (confirmed: `aria-expanded` moves to Solutions). That is
  the classic mega-menu "diagonal problem," present on `main` too, orthogonal to the dead-band close.
  So both new tests travel the way a real cursor reaches a left-column link — **down through the gap
  into the panel, then across** — which isolates the dead-band bug (red on head, green after fix) and
  clicks the actual Services link. Reported for Phase 2 below.
- Added `### Cursors travel. Playwright teleports.` to CLAUDE.md.

**Manual check (headless, real mouse):** all four menus — open, move slowly down into the panel,
pause ~220ms, move across to the furthest link, pause ~260ms (> the 140ms timer): panel **survives
on all four**, link clickable. Chevron reads as an affordance at a glance on all four (screenshot).

**For Phase 2 (found, NOT fixed):** the **diagonal problem** — cutting a straight diagonal from a
trigger to a far (left-column) link crosses the adjacent trigger and switches menus. It is
pre-existing (on `main`), milder than the reported bug (only affects corner-cutting to off-column
links, not the "every sub-link" the owner reported), and the proper fix is a trajectory-aware
safe-triangle or a small intent-delay — deliberately out of scope here to avoid a fourth churn on
this component. Worth a decision next.

**Verified:** lint 0 · typecheck 0 · 109 unit · webpack build · **94 e2e** (adds the survives-the-trip
reproduction), nav spec stable at `--repeat-each=5`.

---

## Session — navigation system repair (branch `fix/navigation-system`, 16 July 2026)

Whole-nav repair, not just Services: four defects, three of which hit every menu. Supersedes the
partial Services-only fix (that PR is closed in favour of this).

**Defect 1 — dead links (20 of 36).** Whole columns shared one href, so only the first click in a
column did anything. Fixed in `seed.ts`, and made the menu reflect the real content model:
- **Services** was a 12-slot grid of invented labels over 16 real categories. Rebuilt as all **16
  category anchors** (`/services#<slug>`), grouped Build (5) / Grow (5) / Operate (6). The shape
  survived; the contents were wrong. Three unmatched labels adjudicated: *Shopify / WooCommerce* was
  a service, not a category → dropped (it lives inside Websites & Development; `/services/<slug>`
  pages are reached from the category sections, not the nav — 67 services isn't a nav set). *Social &
  Video* was one label for two categories → split into **Social Media** + **Social Growth**.
- **How It Works → The growth journey** promised eight stages, listed three → now lists **all 8**
  (each renders an anchor on the page).
- **How we deliver** (4×`#delivery`) → per-card `#delivery-<key>` (added `id` to each
  `DeliveryModelsSection` card).
- **Solutions → By goal** (4×`/solutions`) → `/goals/<slug>` (the hub routes there too).
- **Solutions → By business type**: *"B2B & software"* named two audiences, linked one → split into
  **B2B businesses** (`/business-types/b2b`) + **Software companies** (`/business-types/software`).
  `established`/`beginner` stay hub-only by choice (reachable via `/solutions`).

**Defect 2 — panel didn't close on hash-only / same-URL nav.** Desktop closed only on `pathname`
change; a hash link, a same-page link, or a link to the URL you're already on left it open over the
content just requested. Added the delegated `onClick` on `<nav>` that MobileNav already had in spirit:
any `<a>` click → `setOpenKey(null)`, regardless of whether the URL changes at all.

**Defect 3 — menu swapped mid-reach.** `onPointerMove` switched `openKey` the instant the pointer
touched a different trigger, so a diagonal from a trigger to a far link swapped menus while crossing
the neighbours. Chose a **safe corridor (aim triangle)**, not a dwell delay — a dwell can't meet
"at any speed" (a slow diagonal parks on a neighbour longer than any non-sluggish threshold). While a
panel is open and the pointer is over a *different* trigger, if it's inside the triangle from its
previous position to the panel's two top corners (i.e. descending toward the panel) the panel is
kept; a sideways move to another trigger falls outside → switches at once. Can't get stuck: opening
stays pointer-driven and self-healing (open), and a re-validated ~220ms fallback switches if the
pointer parks on a neighbour (never stuck open); every existing close path is intact.

**Defect 4 — empty reserved column.** `.megaInner` reserved a 300px promo column unconditionally at
≥1160px, squeezing the three promo-less menus. Made it a `.megaInnerPromo` modifier applied only when
`menu.promo` exists.

**Tests — the doctrine (every earlier fix shipped past a test that dodged the bug).** Rewrote the
mega-menu tests to take a straight diagonal from trigger to link *through whatever it crosses* — no
more "down then across". At 1280 the two reaches that genuinely cross a neighbour (the trigger buttons
are only ~40px tall, so most diagonals dive below the row before reaching a neighbour) are
Services→left and Resources→left; the test finds the max-crossing link at runtime and **guards that
one exists**, so layout drift fails loudly instead of passing silently. Close-on-click is
keyboard-driven so Defect 3 can't confound Defect 2. Added the cheap unit guards: every href distinct
**per column**, every href in `seed.ts` resolves.

Red on main → green on branch (all captured against a verified-good production build — see the trap
below):
- unit `nav-integrity`: **5 columns** duplicate-href red (Services Build/Grow/Operate, By-goal,
  How-we-deliver) → **13/13** green.
- e2e Defect 3 (Services, Resources): red = panel `toBeVisible` fails (swapped mid-reach) → green.
- e2e Defect 2 (same-URL, hash-only): red = `toBeHidden` receives `visible` (stays open) → green.
- e2e Defect 4: red = Solutions inner grid has **2 tracks** (300px reserved) → green = **1 track**.

**The trap that ate hours (write it down):** `next start` spawns a child `next-server` that survives
killing the npm wrapper, so zombies accumulate; a new `PORT=… npm run start` then `EADDRINUSE`-exits
and every test silently hits a **stale zombie serving broken CSS** — the desktop nav renders unstyled
(vertical, `header` 1400px tall), so geometry is nonsense and panels "don't open". Symptom: served
HTML references a CSS hash not on disk. Fix: kill next-server by **PID** (not the wrapper, and not
`pkill -f` — that aborts the agent shell with exit 144), verify zero remain, and **gate every run on
`curl`-ing the served CSS for `desktopNav`** before trusting it. All the "broken CSS" scares this
session were this, not the build.

**Reported, not fixed:** `/services/<slug>` has no nav link — deliberate (category-granularity nav).
6 goals / 2 business types (`established`, `beginner`) / 4 starting-points are curated out of nav but
hub-reachable. Footer "Build My Growth Plan" vs nav "Build My Digital Growth Plan" — minor copy drift.

**Verified:** lint **0** · typecheck **0** · unit **122** (incl. 13 nav-integrity) · webpack build ✓
· e2e **97** (workers=1, against a CSS-verified server).
