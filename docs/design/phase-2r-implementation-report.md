# V2 Phase 2R — Implementation Report

**Scope:** the V2 starting-point detail experience — migrate exactly `/starting-points/[slug]` (all
eight public detail pages), the route-local stylesheet and presentation, and the starting-point
integrity + E2E coverage — plus a contained set of Phase 2Q corrections. Branch
`claude/infinite-weblinks-v2-design-yb1yi3`, reviewed base `33a438b`. Light-first Stripe/Clay system.

This is the last of the five fixed visual phases (2R → 2S → 3A → 3B → 3C); no new visual-migration
phase is introduced between 2R and 2S. No other route family, legal/status/error page or gated
`/examples` route was migrated. The eight starting-point slugs, statuses, labels, situations,
recommendations, `recommendedStageSlug` values, CTA labels/routes/styles, icons, colours, source
order, and the stage/service/category records are all unchanged. The `/starting-points` index 308
redirect, the detail canonical URLs, public status gating, the Sanity schemas/queries/mappings and
the service-redirect behaviour are unchanged. No invented recommendation/certainty/price/timeline/
guarantee/proof/testimonial/rating/outcome/endorsement, no persistence/forms/API/accounts, no root
colour-scheme flip, no broad legacy-component deletion, no deploy, no PR.

---

## 1. What Phase 2R accomplished

- **Completed the contained Phase 2Q corrections** (retired ids, frozen order oracle, exhaustive
  eight-state coverage, no-JS slug identity).
- **Proved the starting-point content graph** with a dedicated integrity test before touching the
  presentation.
- **Migrated `/starting-points/[slug]`** off CosmicPageHero + Bento + FinalCtaBannerSection onto the
  shared V2 kit: PageHeader → JourneyStageCard → recommendation Callout → ServiceCard grid → one
  reserved-night FinalCtaSection — with a corrected breadcrumb contract and strict content resolution.
- **Updated `/design-preview`**, extended token-hygiene, and added route-source / legacy-safety unit
  coverage and a full E2E spec across all eight routes.

## 2. Files changed

**New — tests:** `tests/unit/troubleshooter-order-oracle.test.ts`,
`tests/unit/starting-point-content.test.ts`, `tests/unit/v2-starting-point-route.test.ts`,
`tests/e2e/starting-point-detail.spec.ts`.
**Rewritten / edited:** `app/(marketing)/starting-points/[slug]/page.tsx` + `starting-point.module.css`
(migrated); `components/troubleshooter/GrowthTroubleshooter.tsx` (Phase 2Q id renames +
data-problem-slug); `app/design-preview/page.tsx` (Phase 2R preview);
`tests/unit/v2-growth-troubleshooter.test.tsx`, `tests/e2e/troubleshooter.spec.ts`,
`tests/unit/v2-token-hygiene.test.ts`, `tests/unit/v2-service-domain-template.test.tsx`;
`docs/design/phase-2q-implementation-report.md`.

## 3. Phase 2Q corrections

- **Retired ids** — the 2Q rebuild had reused the `ts-` prefix for internal labelling ids while the
  report claimed `#ts-checks-heading` was retired; renamed to the coherent `troubleshooter-*` prefix
  (`troubleshooter-reasons-heading` / `-checks-heading` / `-focus-eyebrow`) so no `ts-*` id remains.
  Visible headings, hierarchy, `aria-labelledby` relationships and public fragments are unchanged; a
  source test proves the `ts-*` ids are absent.
- **Frozen order oracle** — `troubleshooter-order-oracle.test.ts` freezes every reason title and every
  check string per problem slug in exact source order, hardcoded (not derived from the source array),
  so a reorder/omission/duplicate/insertion fails clearly.
- **Exhaustive eight states** — the unit render test and the E2E now verify, for every problem after
  selection: exact active H2, complete explanation, every reason title AND body in source order, all
  five checks in source order, complete focusFirst, exact recommended-stage href, exact live status,
  one `aria-pressed`, and the clicked button retaining focus (axe kept per state).
- **No-JS slug identity** — every selector button carries a stable `data-problem-slug` attribute (no
  URL/query/hash state); the no-JS E2E asserts all eight exact slugs in source order via that
  attribute, every first-problem reason body, and the final CTA's `/growth-plan` + `/contact`
  destinations. The Phase 2Q report is corrected for all four.

## 4. Starting-point content-graph integrity

`starting-point-content.test.ts` proves: exactly eight renderable starting points in the exact
source-order slug list; unique non-empty slugs/labels/situations/recommendations; every icon resolves;
every colour maps through the domain bridge to a V2 ink + tint; and every CTA is exactly
`{ "Build my growth plan", /growth-plan, primary }`. Honesty: no percentage, price, multiplier, star/
out-of-N rating, ranking, certainty, first-person guarantee or testimonial claim (descriptive advice
vocabulary like "Proof, better pages" is not banned), with a self-test proving the guard fires.

## 5. Stage-reference integrity

Every `recommendedStageSlug` resolves to exactly one real, renderable growth stage with a valid
`order` and non-empty `name`/`summary`/`icon`, so `/how-it-works#<stage>` targets a real, visible stage
fragment. No orphan or misspelled stage slug.

## 6. Stage-service integrity

For every recommended stage, each `serviceSlug` resolves to one renderable service (no duplicates), its
`categorySlug` resolves to one renderable category, source order is retained, and the detail
destination is exactly `/services/<categorySlug>#<serviceSlug>`. The route resolves the stage,
services and categories **strictly** (throwing on an unresolved slug), so a broken relationship fails
the static build rather than producing a partially-empty public page.

## 7. Breadcrumb correction

The visible PageHeader breadcrumb is `Goals(/goals) → <label>`. The BreadcrumbList JSON-LD is
`Home(/) → Goals(/goals) → <label>(canonical detail URL)`. The redirecting `/starting-points` index URL
is no longer emitted in either form. The `/starting-points` 308 redirect, the detail canonical URLs and
indexability are preserved, and exactly one BreadcrumbList node is emitted.

## 8. PageHeader migration

CosmicPageHero (with CosmicBackground/StarfieldLazy, NodeOrb aside, GlowButton and the raw hue) is
replaced by PageHeader: `id="starting-point-hero"`, light surface, breadcrumb `Goals → <label>`, the
eyebrow "Where you're starting", the label as the H1, the situation as the lead, a primary Button using
the locked CTA (`Build my growth plan` → `/growth-plan`), a secondary Button to
`/goals#by-where-you-are` ("See other starting points"), and the approved trust note. No second hero
illustration was added.

## 9. Recommended-stage presentation

An alt-surface SectionShell (`id="recommended-stage"`, eyebrow "Recommended starting stage", title
"The best place to begin", the approved lead) renders exactly one JourneyStageCard from the stage's own
data — `stage.order`, `stage.name`, `stage.summary`, `/how-it-works#<slug>`, `stage.icon`,
`stage.color` — in a CardGrid, so it reads as a normal card (not a giant/featured BentoCard, no NodeOrb,
no progress/duration/certainty). The relationship is proven before rendering (and resolved strictly).

## 10. Recommendation presentation

A light-surface SectionShell (`id="recommendation"`, eyebrow "What we'd recommend", title "Our honest
take on your next move") presents the exact `startingPoint.recommendation` verbatim in a restrained
information Callout (no glow/glass/gradient), with the verbatim reassurance preserved: "Most businesses
sit in more than one situation at once, and that's normal. Your plan is tailored to your specifics
during discovery." No diagnosis/certainty/numbered plan/timeline was added.

## 11. Service-card presentation

An alt-surface SectionShell (`id="stage-services"`, the existing eyebrow/title/lead) renders the
recommended stage's services with the shared ServiceCard in a CardGrid: real `service.name`,
`service.plainDescription`, the exact `/services/<categorySlug>#<serviceSlug>` whole-card destination,
the real category label/icon/tone and the real delivery-model badge. No BentoGrid/BentoCard, no
featured-first, no resort by category/title/delivery model, no starting-point colour on the cards, no
price/tool endorsement/invented result.

## 12. Source-order preservation

The stage services render in `stage.serviceSlugs` order (the route maps that array directly; the
integrity test and E2E both assert the rendered link order equals the source order).

## 13. Final CTA

FinalCtaBannerSection is replaced by one reserved-night FinalCtaSection (`id="get-started"`, "Ready to
turn this starting point into a plan?", primary `/growth-plan`, secondary `/contact` "Talk it
through"). No response-time/email-delivery/guaranteed-recommendation promise, no globe/InfinityMark/
NodeOrb/animated decoration. It is the route's only dark section.

## 14. Metadata and static-param preservation

`generateStaticParams` returns exactly the eight renderable slugs; `generateMetadata` still derives the
title from `startingPoint.label` and the description from `startingPoint.situation`, with a clean
canonical `/starting-points/<slug>`, the current OpenGraph behaviour and indexability. Unknown slugs
still 404. Every route prerenders statically.

## 15. Structured-data preservation

Exactly one BreadcrumbList node (see §7). No FAQPage/HowTo/Product/Offer/Review/AggregateRating was
added (none existed).

## 16. Fragment results

`#starting-point-hero`, `#recommended-stage`, `#recommendation`, `#stage-services`, `#get-started` each
occur exactly once on all eight routes, carry visible meaningful content, clear the sticky header
through ordinary hash navigation, and work without JavaScript. No service-level ids were added to the
route; service links continue to target the category-page fragments.

## 17. No-JavaScript results

All route content is server-rendered. With JavaScript disabled, every one of the eight pages serves the
H1, breadcrumb, complete situation, both PageHeader actions, the trust note, the recommended stage card
(order/name/summary + exact destination), the complete recommendation + reassurance, every stage
service card (name + exact destination + category label + delivery-model badge), the final CTA (both
destinations) and every fragment. No route-specific Client Component was introduced. (The shared site
chrome does use JavaScript — not claimed otherwise.)

## 18. Content honesty

See §4 — the starting-point visible data carries no fabricated metric/price/rating/testimonial/
guarantee/certainty, and the integrity test fails on a planted defect.

## 19. Legacy-route safety

`/growth-plan`, `/contact`, `/pricing`, `/services` and `/troubleshooter` are untouched beyond the
contained Phase 2Q corrections. No unrelated component was deleted. `FinalCtaBannerSection` remains live
in the homepage section registry; `CosmicPageHero` is retained but is now unreachable (a Phase 2S
removal candidate, not deleted here). The route-local `starting-point.module.css` is rewritten to V2
(only the recommendation block's layout remains), not removed.

## 20. Canvas/client/presentation-cost changes

BEFORE (each detail route): CosmicPageHero → CosmicBackground/StarfieldLazy canvas path, NodeOrb,
GlowButton, Bento presentation, FinalCtaBannerSection. AFTER: zero route canvas; no CosmicBackground
path; no NodeOrb/GlowButton/BentoCard/BentoGrid/FinalCtaBannerSection; no route-specific Client
Component; page content remains server-rendered; no new dependency, no new external host, no
layout-shifting illustration. No measured LCP/CLS/JavaScript-byte/Lighthouse claim is made.

## 21. Tests actually run

Recorded at Commit 8, all green:

- `npm run lint` (eslint .) — clean, no warnings or errors.
- `npm run typecheck` (tsc --noEmit) — clean.
- `npm run test` (Vitest) — **70 files, 1882 tests passed** (0 failed), incl. the new
  `troubleshooter-order-oracle`, `starting-point-content` and `v2-starting-point-route` suites.
- `npm run build` (Next.js production) — succeeded; all eight `/starting-points/[slug]` pages
  prerender as SSG (`●`), alongside the rest of the static/SSG/dynamic route map.
- `npm run cf:build` (OpenNext → Cloudflare Worker) — see §22.
- Full Playwright suite (`--workers=4`, incl. `starting-point-detail.spec.ts`) — see §23.

## 22. cf:build result

`npm run cf:build` completed: the Next production build ran, then OpenNext generated the middleware,
static, cache and default server functions and wrote the worker to `.open-next/worker.js`
("OpenNext build complete."). Build only — **no deploy** (the only deprecation notice was the
unrelated Node `punycode` warning).

## 23. Complete E2E result

Full Playwright run on `next start` (production build, port 3101, `--workers=4`): **730 passed
(4.9m), 0 failed, 0 flaky** — no targeted rerun was needed. This includes the 49 starting-point
detail tests, the troubleshooter suite, and the cross-route axe smoke (which now also asserts zero
serious/critical violations on `/starting-points/website-no-traffic`). The BreadcrumbList test
(previously failing on double-emission) passes: exactly one `Home → Goals → label` node.

## 24. Responsive, zoom and accessibility results

`starting-point-detail.spec.ts` validates, across the eight routes: HTTP success, one H1, canonical,
visible breadcrumb + a single Goals-aligned BreadcrumbList, complete source content, the exact
recommended stage, the exact service list + order + destinations, the final CTA, every fragment, no
canvas, no cosmic/SVG-gradient decoration, and no horizontal overflow; JavaScript-disabled content on
all eight; an unknown slug 404; fragment geometry at 1280×900; the long-content route at all eight
widths (320→1440) plus every route at 360 and 1280; 200% text and reduced motion; and zero
serious/critical axe on all eight routes.

## 25. Preview location

`/design-preview` → "Phase 2R · Starting-point detail" section (internal, noindex,nofollow, off nav and
sitemap).

## 26. Known limitations

- `CosmicPageHero` is now unreachable but retained (a Phase 2S removal candidate) to avoid broad legacy
  deletion in this phase.
- No measured performance figures are claimed (see §20).

## 27. Exact Phase 2S scope

Phase 2S is the **design-completion** phase and should cover ONLY: final V2 design-system convergence;
a whole-site route inventory; removal of genuinely unreachable visual legacy code (e.g. `CosmicPageHero`
and any other now-orphaned cosmic components); a final visual-regression and screenshot review; and
branch/PR preparation. **Phase 2S completes the redesign but does not replace the separate Phase 3A–3C
production-readiness work** (3A security/infrastructure hardening, 3B legal/trust/content readiness,
3C release certification and deployment). Do not begin Turnstile production hardening, Formspree
transport changes, CSP hardening, Cloudflare binding verification, legal-copy review, proof/testimonial
work or deployment as part of 2S.
