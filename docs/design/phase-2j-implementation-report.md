# V2 Phase 2J — Implementation Report

**Scope:** The how-it-works explainer system — migrating `/how-it-works` onto V2 and building the
reusable V2 replacement sections it needs — plus three contained Phase 2I test corrections.
Compatibility-first and additive, on branch `claude/infinite-weblinks-v2-design-yb1yi3`. Governing
spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (843 unit) and
`npm run build` all pass. The complete e2e suite was executed once as four deterministic shards —
**434/434 passed, zero failures** (§21).

---

## 1. What Phase 2J accomplished

- Completed three Phase 2I test corrections: a direct layout-helper contract spec, a tightened
  308 redirect assertion, and a geometry-based fragment-clearance helper.
- Added five presentation components — **GrowthJourneyList**, **CrossCuttingSystemCard**,
  **ConnectedSystemFlow**, **ProcessStepList**, **DeliveryModelCard** — plus four reusable V2
  sections (**GrowthJourneyOverviewSection**, **ConnectedSystemExplainerSection**,
  **WorkProcessSection**, **DeliveryModelsExplainerSection**).
- Centralised delivery-model presentation metadata (one exhaustive typed source).
- Migrated **`/how-it-works`** onto PageHeader + explicit V2 surfaces + those sections, moved
  every deep-link id off the hidden anchor band onto real content, and left the homepage untouched.

## 2. Files changed

| Area | Files |
|---|---|
| E2E helpers/tests | `tests/e2e/helpers/layout.ts` (fragment-clearance helper), `tests/e2e/layout-helper.spec.ts` (new), `tests/e2e/goals-hub.spec.ts` (308 + helper) |
| Route components | `routes/GrowthJourneyList`, `routes/ConnectedSystemFlow`, `routes/ProcessStepList` (+ css) |
| Cards | `cards/CrossCuttingSystemCard`, `cards/DeliveryModelCard` (+ css); `primitives/Card.tsx` (optional `id`) |
| Sections | `sections/GrowthJourneyOverviewSection`, `sections/ConnectedSystemExplainerSection`, `sections/WorkProcessSection`, `sections/DeliveryModelsExplainerSection` (+ css) |
| Delivery metadata | `lib/design/deliveryModel.ts` (new); `primitives/DeliveryModelBadge.tsx` (reads it) |
| Route | `how-it-works/page.tsx` (migrated), `how-it-works/how-it-works.module.css` (repurposed) |
| Preview | `design-preview/page.tsx` |
| Tests | `unit/v2-how-it-works`, `unit/v2-delivery-metadata`, `unit/v2-homepage-safety`, `e2e/how-it-works` (new); `unit/v2-token-hygiene` (extended) |
| Docs | `docs/design/phase-2j-implementation-report.md` |

## 3. Phase 2I test corrections

- **Layout-helper contract (`layout-helper.spec.ts`):** drives the real browser with
  `page.setContent` (no production test route, no mocking of the geometry). Confirms
  `setViewportAndWaitForStableLayout` reaches the requested `clientWidth`; a clean page and a 1px
  overflow pass; a persistent 3000px overflow is REJECTED with the caller's context in the message
  (the intentional failure is caught inside the test); and a source contract that the helpers use
  no `page.waitForTimeout` and no arbitrary sleep.
- **Redirect (`goals-hub.spec.ts`):** tightened to the exact contract — HTTP **308** + exact
  `Location` — without broadening the range; `routes.spec.ts` coverage is untouched.
- **Fragment-clearance helper:** added below.

## 4. Layout-helper contract results

The four contract assertions pass, including the intentional-overflow case which rejects within
the helper's bounded poll window (~3s) with `intentional-overflow-marker` in the message, and the
source contract (no `waitForTimeout`, no `setTimeout` sleep). See §21 for the shard the spec ran in.

## 5. Homepage compatibility approach

The **preferred approach** was used: new, separately-named V2 sections imported only from
`/how-it-works`, with the legacy homepage sections left untouched — no shared default, no
legacy/V2 prop on the legacy components. Consumer census: the homepage (`page.tsx`) renders
`ConnectedGrowthSection`, `OneSystemSection` and `DeliveryModelsSection` directly (the last also on
`/about`); `ProcessStepsSection`/`DeliveryModelsSection` are mapped in `registry.tsx`. All of those
are unchanged. **`src/app/(marketing)/page.tsx` is byte-for-byte unchanged** (`git diff` against
the Phase 2J base is empty), guarded by `v2-homepage-safety` (page.tsx still imports the legacy
sections and none of the V2 ones) and an e2e (the homepage keeps its legacy presentation and shows
neither the V2 page-jump nor stage-jump nav).

## 6. GrowthJourneyList design

The eight-stage journey as a semantic `<ol>`: each `<li>` carries its real stage slug as its id
(the mega-menu deep-link target) with `scroll-margin-top` for the sticky header, a compact
"Stage N" label, a flat IconTile, an H3 name, the stage summary and "what happens", and the
intended outcome — clearly labelled "Intended outcome", the kind of result the stage is built for,
never a guarantee. Every field is verbatim seed. A calm vertical reading sequence (two columns only
on very wide screens): no buttons, aria-pressed, selected stage, client panel, horizontal scroller,
carousel, NodeOrb, StageTimeline, animated connector, completion state, percentage or duration —
and it implies no requirement that a project run all eight stages. Understandable with CSS disabled.

## 7. Stage anchor handling

The old hidden `aria-hidden` anchor band is removed. The eight stage slugs now live on the
GrowthJourneyList items, so each `#discovery-plan … #advocacy-growth` link lands on the actual
stage panel (visible text, correct `<li>` semantics, scroll-margin clearance). Verified: each id
occurs exactly once, on a visible `<li>` (e2e), and the fragment clears the sticky header by real
geometry (`#discovery-plan` representative).

## 8. Cross-cutting-system design

`CrossCuttingSystemCard` is a STATIC card (not a link) whose root carries the real system key as
its id (`#ai-automation`, `#analytics-data`, `#maintenance-scale`) with scroll-margin. A flat
IconTile, a visible "Runs across the journey" label, an H3 title and the full verbatim description;
colour maps through the bridge to an accessible ink. No nested interaction, metric, dashboard,
node-orb, rail-bar, glow, gradient or fixed height. (`Card` gained an optional `id` prop —
additive, inert for existing consumers — so a static card can be a fragment target.)

## 9. ConnectedSystemFlow design

The five connected parts (get discovered → your website → analytics → email & SMS → repeat
customers) as a semantic `<ol>` with H3 titles, flat IconTiles and static informational Chips, plus
the loop note after it — titles, blurbs, icons and chips preserved verbatim from the legacy
OneSystemSection. A CSS-only down-chevron conveys direction. It explains a system MODEL, so it
carries no client-evidence styling: no ConnectorPath, NodeOrb, InView, SVG path animation,
ChartCard/StatCard/MessageCard, fake notification, "growing month on month" demo, chart/measured-
proof presentation, fixed height, horizontal overflow or required interaction. Understandable with
CSS disabled.

## 10. ProcessStepList design

The agency's workflow as a semantic `<ol>` in exact source order: a compact number, a flat IconTile
in ONE coherent V2 brand accent (no per-index legacy palette cycle), an H3 title and the exact
description, joined by a neutral static connector rail. No theme-band, giant node, glow, gradient,
fake progress, fixed height, duration or completion percentage. `WorkProcessSection` wraps it
(`id="process"`, explicit V2 surface, the existing eyebrow/title/intro; SectionShell derives the
heading id, so no hard-coded duplicate). ProcessStepsSection (legacy) is left intact for its
registry mapping.

## 11. Central delivery metadata

`lib/design/deliveryModel.ts` is the single source of truth for the four locked keys — exact label,
glyph and accessible V2 ink — with `DELIVERY_MODEL_KEYS`, a compile-time-exhaustive
`Record<DeliveryModelKey, …>`, and `deliveryModelMeta()` that **throws** on an unknown key rather
than inventing a model. `DeliveryModelBadge` now reads its label/icon/ink from it (re-exporting
`DeliveryModelKey`), so `ServiceCard` output is unchanged while the mapping is no longer duplicated.
The legacy `DELIVERY_COLOR`/`MODEL_ICON` remain for their out-of-scope consumers (services,
pricing, ServiceDomainTemplate, the legacy DeliveryModelsSection). Unit-tested for exhaustiveness,
seed-label parity, one distinct ink per key, and unknown-key rejection.

## 12. Delivery-model design

`DeliveryModelCard` is a STATIC card carrying `id="delivery-<key>"` with scroll-margin, a compact
order marker, the shared glyph + ink, the exact model name as its H3, the real tagline and
description, and an "Our default" Badge shown ONLY for `we-do` (grounded in the seed statement that
this is the core model most services use). No nested interaction; no popularity/recommendation label
on any other model. `DeliveryModelsExplainerSection` (`id="delivery"`, explicit V2 surface, the
existing eyebrow/title/intro) renders the four cards in source order plus the ownership statement
and its four assurances as a semantic list — no theme-band-bright, raw DELIVERY_COLOR, duplicated
icon map, filled legacy tiles or hard-coded shared heading id.

## 13. How-it-works migration

`CosmicPageHero → PageHeader` (light; "How it works" breadcrumb + eyebrow, plain H1 "One connected
system, built around your growth", the existing lead, primary /growth-plan, secondary "Explore the
journey" → #growth-journey; no InfinityMark aside, NodeOrb or gradient title). A compact page-jump
`nav aria-label="How it works sections"` of four ≥44px LinkChips → #growth-journey / #how-it-connects
/ #process / #delivery. Content order: **GrowthJourneyOverviewSection (alt) → ConnectedSystem-
ExplainerSection (light) → WorkProcessSection (alt) → DeliveryModelsExplainerSection (light) →
FinalCtaSection (get-started, night)**. The closing CTA reinforces starting from the visitor's
situation and the smallest useful next step, with sequence and scope tailored — no promise of every
stage or a guaranteed outcome. Removed from the route (not globally): CosmicPageHero, GlowButton,
InfinityMark aside, the hidden anchor band, the four legacy section presentations,
FinalCtaBannerSection, StageTimeline, RailBar, NodeOrb, ConnectorPath, FloatingCards, theme-band,
theme-band-bright, gradient-word spans and the cosmic background.

## 14. Structured data preserved

`/how-it-works` keeps its `metadata` (title "How It Works", description, canonical) and its
`[Home, "How It Works"→/how-it-works]` breadcrumb JSON-LD — both unchanged (e2e-verified: title,
canonical, `BreadcrumbList`). The route stays static (SSG); no URL, fragment or canonical changed.

## 15. Deep-link and fragment results

Every required id resolves **exactly once** on the migrated page (measured on the built HTML and in
e2e): 8 stages, 3 systems, 4 delivery models, and the 5 sections (growth-journey, how-it-connects,
process, delivery, get-started) — 20 ids total. Stage ids sit on visible `<li>`s; system and
delivery ids on visible `<article>` cards; section ids on their sections. No hidden empty anchor
band remains. Fragment clearance is verified by real geometry (target top ≥ sticky-header bottom,
inside the viewport) for a representative target from every group: `#discovery-plan` (stage),
`#ai-automation` (system), `#process` (section), `#delivery-we-do` (delivery). Back/forward hash
behaviour is normal (plain anchors, no client state); all targets work without JavaScript (SSG).

## 16. Content-integrity results

All flat seed renders in source order with nothing invented:

| Content | Count | Notes |
|---|---|---|
| Growth-journey stages | 8 | verbatim summary / whatHappens / outcome |
| Cross-cutting systems | 3 | locked keys + verbatim descriptions |
| Process steps | 8 | source order, exact descriptions |
| Delivery models | 4 | locked names/taglines/descriptions; "Our default" on we-do only |
| Connected-flow nodes | 5 | titles/blurbs/icons/chips verbatim + the loop note |

## 17. Missing or unresolved relationships

**None.** No stage, system, process step, delivery model or flow node is missing or unresolved. No
result, timing, metric, progress or proof was invented; no locked stage/system/delivery name was
renamed; no seed dataset was rewritten.

## 18. Homepage safety results

`src/app/(marketing)/page.tsx` is **byte-for-byte unchanged** (empty `git diff` against the Phase 2J
base). The homepage still renders one H1 and its legacy sections in the same order (guarded by
`v2-homepage-safety` unit + an e2e). No V2 how-it-works-only ids or navs appear on the homepage (the
V2 page-jump and stage-jump navs are absent from `/`), and no homepage copy or CTA destination
changed. The legacy `ConnectedGrowthSection`, `OneSystemSection` and `DeliveryModelsSection` keep
their default presentation.

## 19. What intentionally remained legacy

The legacy `ConnectedGrowthSection`, `OneSystemSection`, `ProcessStepsSection` and
`DeliveryModelsSection`, and `StageTimeline`, `RailBar`, `ConnectorPath`, `FloatingCards`,
`NodeOrb`, `InfinityMark`, `DELIVERY_COLOR`/`MODEL_ICON` and `theme-band`/`theme-band-bright` are
all unchanged and keep their other consumers (homepage, /about, services, pricing, growth-plan,
troubleshooter, ServiceDomainTemplate). Not migrated: the homepage, service-category routes, goals
and business-type routes, contact, growth-plan, troubleshooter, ServiceDomainTemplate, and any
growth-stage-into-standalone-route. No root body/themeColor/colorScheme flip; no legacy component or
token deleted; the hidden anchor CSS was repurposed to the V2 jump-nav band.

## 20. Tests actually run

- **Unit (Vitest): 843 pass (34 files).** New: `v2-how-it-works`, `v2-delivery-metadata`,
  `v2-homepage-safety`; token-hygiene extended to the eight new modules + the route CSS.
- **Build:** `npm run build` compiles and prerenders `/how-it-works` (static) among 103 pages.
- **Lint / typecheck:** clean.

## 21. Complete E2E result

The complete Playwright + axe suite (**434 tests, 22 specs**) was executed once as **four
deterministic shards** — every spec and every test ran exactly once across the shards. A single
434-test invocation exceeds the environment's per-command ceiling, so this is a **complete sharded
execution, not a single-run invocation**. Commands and counts, honestly recorded:

```
PW_PORT=3101 npx playwright test --shard=1/4 --workers=4   → 109 passed
PW_PORT=3101 npx playwright test --shard=2/4 --workers=4   → 109 passed
PW_PORT=3101 npx playwright test --shard=3/4 --workers=4   → 108 passed
PW_PORT=3101 npx playwright test --shard=4/4 --workers=4   → 108 passed
────────────────────────────────────────────────────────────────────────
Total: 434 passed, 0 failed
```

**No failures and no reruns** in this complete execution — nothing to preserve separately or merge.
The service-domain overflow sweep ran green inside the shards on the stable-layout helper; no
targeted stress runs were merged into these totals.

## 22. Responsive, zoom and accessibility results

0 serious/critical axe on `/how-it-works` (and on the /goals, goal-detail, service, /, /privacy,
/contact and design-preview sweeps in the sharded run). No horizontal overflow at any tested width
(320 / 360 / 390 / 768 / 1024 / 1160 / 1280 / 1440), measured with the stable-layout helper; no
horizontal stage timeline (the journey is an `<ol>` with no overflow-x scroller — asserted). One H1
("One connected system, built around your growth") with no heading skips (H1 → section H2 → list/
card H3); all content is available without interaction (server-rendered, no client panels); fragment
targets clear the sticky header by real geometry; source ordering preserved; long text wraps; the
four page-jump chips are ≥44px; reduced motion honoured; the adaptive header holds at 200%
(unchanged from prior phases).

## 23. Preview URLs and screenshots

Internal only, `noindex,nofollow`, off-nav and off-sitemap: `/design-preview` (now including a
"How-it-works blocks" section — a GrowthJourneyList with three real stages, a CrossCuttingSystemCard
plus one with a long wrapping title, the ConnectedSystemFlow, a ProcessStepList, all four
DeliveryModelCards, and the page-jump nav) and `/design-preview/shells`. One H1, no duplicate ids.
No screenshots are attached (headless run); the pages render the real components.

## 24. Known limitations

- The domain-colour bridge remains a migration bridge: stage, system and flow-node seed content
  still carries legacy tokens, mapped to accessible V2 ink at render time.
- Two delivery-model icon maps now coexist by design: the central V2 metadata (badge + V2 cards)
  and the legacy `MODEL_ICON`/`DELIVERY_COLOR` still used by the untouched legacy section and the
  out-of-scope service/pricing routes. They converge when those routes migrate.
- The legacy `ConnectedGrowthSection`/`OneSystemSection`/`DeliveryModelsSection` (and StageTimeline,
  RailBar, FloatingCards, ConnectorPath, theme-band) still power the homepage and /about — the
  remaining migration surface.

## 25. Recommended scope for Phase 2K

Migrate the **homepage** (`src/app/(marketing)/page.tsx`) onto the V2 system, swapping its
`ConnectedGrowthSection` → GrowthJourneyOverviewSection, `OneSystemSection` →
ConnectedSystemExplainerSection and `DeliveryModelsSection` → DeliveryModelsExplainerSection (all
now built and proven on /how-it-works), while preserving the hero's LCP text, the homepage's
section ids/anchors (#growth-journey, #how-it-connects, #ways-of-working, #ownership, #learn,
#get-started), its metadata/JSON-LD (organization + website) and the GATE-1 opening. Retire the
legacy StageTimeline/RailBar/FloatingCards/ConnectorPath and the theme-band surfaces once their last
consumers (homepage, /about) are migrated. Defer the service-category and conversion routes,
ServiceDomainTemplate, and any root colour-scheme flip to later phases.
