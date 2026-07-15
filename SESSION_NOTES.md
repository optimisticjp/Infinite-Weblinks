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
