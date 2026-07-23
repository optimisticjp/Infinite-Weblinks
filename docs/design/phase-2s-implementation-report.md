# V2 Phase 2S — Implementation Report (final redesign phase)

**Scope:** the final V2 design convergence and redesign handoff. Branch
`claude/infinite-weblinks-v2-design-yb1yi3`, reviewed base `10722f0`. Phase 2S completes the
redesign; the only remaining planned work is the separate Phase 3A–3C production-readiness track.

**Net change (10722f0..HEAD):** 113 files changed, +1,286 / −6,685 lines — **70 files deleted**, 12
added, 31 modified. No route URLs, form APIs, Formspree/Turnstile behaviour, rate limiting,
validation schemas, CSP/security headers, Sanity delivery, legal wording, proof statuses, pricing,
analytics or deployment config were changed.

---

## 1. What Phase 2S accomplished

- Completed the contained **Phase 2R verification corrections** (E2E service-card coverage + a direct
  `generateStaticParams()` contract + reachability wording).
- Produced the **whole-site route/template inventory** and the **legacy-reachability proof**.
- **Converged the document root to light-first** (viewport + `theme-light` on `<body>`).
- **Migrated the two remaining legacy surface families** — the 404/error status screens and the gated
  `/examples` proof templates — to V2, keeping every behaviour and the proof gate.
- **Converged the project design guidance** (CLAUDE.md + `v2-design-spec.md`).
- **Removed the proven-dead visual legacy code and tokens** in two reviewable clusters.
- Recorded the **final visual/responsive/a11y review** and added **cross-route regression coverage**.

## 2. Files changed (by area)

- **Docs (new):** `v2-final-route-inventory.md`, `v2-legacy-reachability.md`,
  `phase-2s-visual-review.md`, `phase-2s-implementation-report.md`, `v2-redesign-handoff.md`;
  converged `CLAUDE.md` + `v2-design-spec.md`; corrected `phase-2r-implementation-report.md`.
- **Root/theme:** `app/layout.tsx`, `styles/tokens/base.css`, `styles/globals.css`, `tokens/v2.css`,
  `tokens/colors.css`, `tokens/effects.css`, `tokens/constellation.css`.
- **Status:** `StatusScreen.tsx/.css`, `not-found.tsx`, `error.tsx`.
- **Examples:** new `ExampleCard`, `ExamplesIndex`; V2 `ProofDetail`; `examples/page.tsx`.
- **SectionShell** converged to V2-only (legacy surface removed).
- **Deleted (70 files):** the dead section-registry cluster + orphaned home sections + freed viz
  (Commit 7, 49 files) and the cosmic-viz + leaf primitives (Commit 8, 21 files).
- **Tests:** 6 new suites + updated guards; 2 new e2e specs.

## 3. Phase 2R corrections

The starting-point E2E now verifies, per page (normal-JS + no-JS), the recommended stage and every
service card in full (title, plainDescription, category label, delivery-model label from the single
`deliveryModelMeta` source, whole-card destination, source order, one card per service). A new
`v2-starting-point-static-params.test.ts` invokes the route's `generateStaticParams()` directly and
asserts the exact ordered eight slugs. The 2R report's legacy-reachability wording was corrected to
the proven graph.

## 4. Final route inventory

See `docs/design/v2-final-route-inventory.md`: 20 indexable static pages, 9 dynamic detail templates,
4 noindex routes, the gated `/examples` pair, the 404/error status surfaces, all 73 permanent (308)
redirects, and the sitemap/robots/llms.txt/api routes. Every live or potentially-publishable route is
classified.

## 5. Final template-family inventory

All template families are V2 (see the inventory §8). The two families still on legacy cosmic at the
start of 2S — status screens and gated examples — were migrated in this phase.

## 6. Project-guidance convergence

CLAUDE.md's design direction is now "Clear Systems" (light-first, dark reserved, colour as
wayfinding, no cosmic default, one signature gradient, restrained motion). The nonexistent
`docs/design-references/` claim was removed; the source of truth is `v2-design-spec.md` +
`/design-preview`. The settled stack (CSS Modules + tokens + V2 components + lucide-react) is
recorded, and Tailwind/shadcn are noted as not-to-be-introduced incidentally. `v2-design-spec.md` is
marked implemented / redesign complete. The constitution's outcome-based principles are unchanged.

## 7. Root light-default convergence

`viewport.colorScheme` → `light`, `themeColor` → `#ffffff`; `<body className="theme-light">` adopts
the V2 light semantic mapping without duplicating the token map. `base.css` body reads the semantic
`--surface`/`--text-body` (paper propagates to the overscroll canvas — no dark flash); `::selection`
is a soft brand tint; the skip link is a V2 night chip; autofilled controls keep the V2 surface. The
reserved `theme-night` sections remain explicitly scoped. Guarded by `v2-root-convergence.test.ts`.

## 8. StatusScreen migration

A calm light panel: its own `<main id="main">` (so the root skip link resolves), a restrained
non-luminous InfinityMark, a mono code label, one H1, the caller's actions and the helpful-links nav.
No CosmicBackground, glow, GlowButton or animation — identical with/without a motion preference.

## 9. 404 behaviour preservation

`not-found.tsx` keeps its `index:false, follow` metadata, the visible "404", the title/body, and the
Back-to-home + Build-my-growth-plan destinations (now `Button`, not `GlowButton`).

## 10. Error / reset behaviour preservation

`error.tsx` stays a Client Component; keeps `reset()` (Try again), `console.error` logging, the
message and Back-to-home (now `Button`).

## 11. Gated examples behaviour preservation

`/examples` returns 404 while `getExamples()` is empty; `/examples/[slug]` 404s unavailable records.
`generateStaticParams`, metadata, proof statuses, the ItemList + Breadcrumb JSON-LD, and the absence
of Review/AggregateRating are all preserved. No invented proof, no newly published record, no merge
with `/case-studies`.

## 12. Gated examples V2 presentation

Index → `ExamplesIndex` (PageHeader + light SectionShell CardGrid of `ExampleCard` + FinalCtaSection).
Detail → V2 `ProofDetail` (PageHeader with a single Home → collection → title BreadcrumbList + light
content surface + FinalCtaSection). PageHero/theme-band/HubGrid/IndexCard removed. The latent
templates are tested via pure components + fixtures (`v2-examples-templates.test.tsx`) while the
production routes stay gated.

## 13. Legacy import/reachability results

See `docs/design/v2-legacy-reachability.md`. The section registry is orphaned (no route renders it),
which made its 14 registry-only sections, `FinalCtaBannerSection`, and the 5 orphaned home sections
dead. The 2S status/examples migrations freed `GlowButton`, `PageHero`, `HubGrid`, `IndexCard`, and
the cosmic-viz chain (`CosmicPageHero`, `CosmicBackground`, `GlobeArc`, `Starfield`, `StarfieldLazy`,
`ScrollThread`, `StageMarker`, `ConnectorPath`, `RailBar`, `ConstellationLayout`, `StageTimeline`).
`GalaxyEngine` does not exist.

## 14. Files / components removed

70 files: the dead registry system + types/getter, `FinalCtaBannerSection`, 14 registry-only
sections, 5 orphaned home sections, and 15 viz/route/primitive components (cosmic hero/background,
globe, starfield ×2, scroll-thread, stage-marker, connector-path, rail-bar, constellation-layout,
stage-timeline, PageHero, HubGrid, IndexCard, GlowButton) with their CSS modules.

## 15. Components intentionally retained (and why)

`InfinityMark` (learn article + status mark); `BentoGrid`/`BentoCard`/`NodeOrb` (`/resources`, NodeOrb
hidden on V2 surfaces); the V2 kit; the seven `--domain-*` wayfinding hues; `theme-band`
(EditorialStatement + ProcessStepsSection); `theme-light/-alt/-night`; the `domainColor` bridge.

## 16. Tokens / styles removed

`.theme-statement`, `.theme-cosmic`, the `.iw-gradient-word` helper, and ~27 dead custom properties:
glows (`--glow-pink/-orange/-cyan/-lime/-blue/-ambient/-node-soft/-panel/-float/-brand`), gradients
(`--grad-violet-pink/-cyan-blue/-lime/-banner/-spectrum/-constellation`), domain aliases
(`--domain-search/-ecom`), and the constellation deep-space/line/panel-radius group. Each was verified
to have zero consumers across every `.css`/`.tsx`/`.ts` before removal.

## 17. Root and theme token results

The `:root` dark scale in `colors.css` is no longer the document default (it survives only as the
source for individual retained tokens). `constellation.css` is reduced to the live `--domain-*` hues
plus the four NodeOrb tokens. `globals.css`/`v2.css` comments reflect the converged state.

## 18. Metadata, sitemap, robots and redirect preservation

Unchanged: all canonical URLs, sitemap contents, robots behaviour, the 73 redirects, static params,
unknown-slug 404s, the truthful JSON-LD, the noindex conversion routes, the gated proof behaviour, the
legal routes and `llms.txt`. No Review/AggregateRating/Product/Offer/fake-HowTo/fake-FAQPage/price/
testimonial/proof was added. `v2-visual-acceptance.spec.ts` + `status-and-examples.spec.ts` guard the
route/gate outcomes.

## 19. No-JavaScript results

Every server route template renders its content without JS (the detail/hub/legal/status/examples
surfaces). The documented interactive limitations are unchanged: growth-plan progression,
troubleshooter switching, contact submission and error `reset()` require JS.

## 20. Accessibility results

Skip link reaches `#main` on ordinary routes and the 404; keyboard operability, visible focus, 44px
targets, semantic headings, breadcrumb + status-nav labelling, 200% text and reduced motion all hold.
The full axe suite (serious/critical) is green, including the migrated 404. axe is never claimed to
run with JavaScript disabled.

## 21. Responsive & 200%-text results

Zero horizontal overflow at 390 / 768 / 1440 on every template family (visual-review §metrics), plus
the per-route 200%-text/reduced-motion checks in the existing detail specs.

## 22. Screenshot / visual-review findings

See `docs/design/phase-2s-visual-review.md`: light default everywhere, ≤1 night section per ordinary
page (0 on legal/404), no cosmic/canvas/SVG-gradient, one H1, no overflow. Inspected by eye: the 404,
homepage, pricing and starting-point templates. The only exceptions are the internal noindex
design-preview surfaces.

## 23. Client-boundary and canvas results

Live route canvas: **0**. Gated-template canvas: **0**. Removed the one client-only decorative
boundary (`StarfieldLazy` dynamic import) with the cosmic chain. Retained necessary client boundaries
(error boundary, PlanBuilder, GrowthTroubleshooter, ContactForm, MobileNav) unchanged. No new external
host, no new dependency.

## 24. Tests actually run (all green)

`npm run lint` (clean) · `npm run typecheck` (clean) · `npm run test` — **74 files / 1,898 tests
passed** · `npm run build` (all routes prerender) · `npm run cf:build` — see §25 · `npm run test:e2e`
— see §26.

## 25. cf:build result

OpenNext → Cloudflare Worker completed: middleware/static/cache/default server functions bundled,
worker written to `.open-next/worker.js` ("OpenNext build complete."). Build only — **no deploy**
(only the unrelated Node `punycode` deprecation notice).

## 26. Full E2E result

Full Playwright run on the production build (`next start`, port 3101, `--workers=4`): **760 passed
(4.8m), 0 failed, 0 flaky** — no targeted rerun needed. Includes the 30 new Phase 2S tests (25 visual-
acceptance + 5 status/examples) and the migrated 404's axe check.

## 27. Branch comparison with main

`origin/main...HEAD`: 0 behind, **141 ahead** — the whole V2 redesign (421 files, +31,873 / −12,188).
Phase 2S itself is 10 commits on top of `10722f0`.

## 28. Known non-design limitations

The Phase 3 track is not started (security/infra hardening, legal/proof/trust readiness, release/CI/
deploy). No measured performance figures are claimed. `theme-band` + a few legacy tokens remain
because a live light section still consumes them (documented in the reachability report).
