# V2 Phase 2I — Implementation Report

**Scope:** The goals routing hub and starting-point system — migrating `/goals` and rebuilding
`StartingPointSelectorSection` onto V2 — plus three contained Phase 2H corrections. Compatibility-
first and additive, on branch `claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec:
`docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (711 unit) and
`npm run build` all pass. The complete e2e suite was executed once as four deterministic shards —
**410/410 passed, zero failures** (§18).

---

## 1. What Phase 2I accomplished

- Fixed three Phase 2H issues: the report's component count (five → four), the goal-detail
  "same journey" claim, and GoalPath's raw `white` keyword; and hardened the overflow E2E harness.
- Added two components: **StartingPointCard** (situation-led) and **BusinessTypeCard** (audience-led).
- Rebuilt **StartingPointSelectorSection** on V2 (no daylight spectrum rail) and migrated **`/goals`**
  onto PageHeader + explicit V2 surfaces + the card system, with a new compact hub-jump nav.
- Extended previews, redirect/fragment safety and token-hygiene coverage. Nothing outside `/goals`
  and its starting-point selector was migrated.

## 2. Files changed

| Area | Files |
|---|---|
| Components | `cards/StartingPointCard.tsx`+css, `cards/BusinessTypeCard.tsx`+css (new); `sections/StartingPointSelectorSection.tsx`+css (rebuilt) |
| Route | `goals/page.tsx` (migrated), `goals/goals.module.css` (repurposed to the V2 hub-nav band) |
| 2H corrections | `docs/design/phase-2h-implementation-report.md`, `goals/[slug]/page.tsx` (journey lead), `routes/GoalPath.module.css` (paper token) |
| E2E infra | `tests/e2e/helpers/layout.ts` (new), `tests/e2e/services-domains.spec.ts` (helper applied) |
| Preview | `design-preview/page.tsx` |
| Tests | `unit/v2-token-hygiene` (named-colour rule + new modules), `unit/v2-phase-2h-corrections`, `unit/v2-goals-hub`, `e2e/goals-hub` (new) |
| Docs | `docs/design/phase-2i-implementation-report.md` |

## 3. Phase 2H report correction

The 2H report said "Added five components" but listed four (GoalPath, GoalCard, ServiceCard,
JourneyStageCard); DomainCard and RoadmapCard were reused. Corrected to "Added four components";
the rest of the historical report is unchanged. A regression test (`v2-phase-2h-corrections`)
asserts the report says four, not five.

## 4. Goal journey-copy correction

The goal-detail "where it fits" section lead said "Every business moves through the same journey."
That single route-level sentence is replaced with: *"The growth journey is a useful map, not a
fixed checklist — these are the stages most relevant to this goal. Not every business needs every
stage, and the exact sequence stays tailored to yours."* The section title and every seed-derived
stage field are unchanged. A regression test asserts no goal detail claims every business follows
the same journey or sequence.

## 5. GoalPath token correction

`GoalPath.module.css`'s marker mixed its tint against the raw `white` keyword. It now mixes against
`var(--v2-paper)` (which is `#ffffff`), so the measured-AA contrast is byte-for-byte identical while
the module uses a semantic token. Token hygiene now bans raw named colours (`white`/`black`) in the
migrated V2 modules via a lookaround pattern that ignores hyphenated identifiers (`white-space`) and
the semantic keywords `currentColor`/`transparent` (policy documented in the test). `theme-band-bright`
is banned too. A self-test verifies the rule catches `white`/`black` and spares `currentColor`/
`transparent`/`white-space`.

## 6. Stable-layout E2E helper

`tests/e2e/helpers/layout.ts` removes the immediate-resize measurement race WITHOUT weakening the
assertion:

- `setViewportAndWaitForStableLayout(page, width, height?)` — resizes, then **polls until
  `documentElement.clientWidth` reports the requested width**, awaits `document.fonts.ready` where
  supported, and flushes **two `requestAnimationFrame` turns** so a resize-driven reflow has painted.
- `expectNoHorizontalOverflow(page, context?)` — `expect.poll` on `scrollWidth − clientWidth` with
  the **≤1px tolerance retained**, a finite 3s timeout, and the route/width surfaced in the failure
  message, so a still-settling layout gets a brief chance to stabilise while a **persistent real
  overflow still fails**.

No fixed sleeps, no relaxed threshold, no global timeout bump, no automatic whole-test retries, no
change to service presentation. Applied to `services-domains.spec.ts` and the new `goals-hub.spec.ts`;
the other specs' equivalent checks were left as-is (they have not manifested the race) rather than
refactoring the whole suite.

## 7. Service-domain flake reproduction and result

The historically-flaky assertion (Phase 2G `/services/social-media`; Phase 2H `/services/branding-design`
then `/services/strategy-discovery`) was validated with the helper applied, at the worker settings that
exposed the race. Commands and results, honestly recorded:

```
# targeted stress on the three historically-flaky routes
PW_PORT=3101 npx playwright test services-domains \
  -g "social-media|branding-design|strategy-discovery" --repeat-each=8 --workers=4
→ 48 passed (0 failed)   # 3 routes × 2 tests × 8 repeats

# full service-domain sweep with the helper
PW_PORT=3101 npx playwright test services-domains --workers=4
→ 32 passed (0 failed)
```

No route flaked with the helper in place. (The pre-fix flake itself was already reproduced and
recorded in the Phase 2H report; it is not re-introduced here to re-demonstrate it.)

## 8. StartingPointCard design

A current-situation-led whole-card route into the growth-plan builder (API: `order`, `title`,
`situation`, `href`, `icon`, `tone`, `recommendedStageLabel?`, `recommendation?`, `className?`). It
reads as diagnosis → next step: a flat IconTile + a compact "Starting point N" label, the label as
H3, the real situation sentence, and — its signature — a "Start at &lt;stage&gt;" Badge naming the
resolved recommended stage. Single tab stop (no nested link/button), soft elevation, ≤2px hover
matched by focus, wrapping and readable at 200%; colour mapped through the domain bridge. No rail,
carousel, scroll-snap, node-orb, glow, glass, gradient, fixed height, or selected/progress state.

**Recommendation decision:** the longer `recommendation` sentence is **supported by the API but
deferred on `/goals`** — the where-you-are facet already carries 8 cards alongside 10 goals and 7
business types, so keeping each card to its situation + stage Badge keeps the hub scannable. The
recommendation renders only when a caller passes it (exercised in the preview and unit tests).

## 9. BusinessTypeCard design

An audience-led whole-card destination for the hub's by-business-type facet (API: `title`,
`summary`, `href`, `icon`, `tone`, `className?`). A flat IconTile + a visible "Business type" label,
the name as H3, the real one-line summary, and a quiet affordance to `/business-types/[slug]`. A
compact hub card: no roadmap preview, no fabricated audience qualification, no numbering. Single tab
stop, soft elevation, ≤2px hover matched by focus, wrapping; colour mapped through the bridge. No
node-orb, glow, glass, gradient, giant artwork or fixed height.

## 10. StartingPointSelectorSection migration

**Consumer census:** `/goals` is the only runtime consumer — `getHomepageSections()` deliberately
omits `startingPointSelector`, and `registry.tsx` only maps it (never enabled). So the component was
**replaced directly in V2**, keeping the `{ anchorId?: string }` API so the disabled registry entry
still compiles; no compatibility mode was needed and the homepage is unaffected. The daylight
spectrum rail — `theme-band-bright`, horizontal scroll, scroll-snap, ring-lit node-orbs and the
gradient connection line — is gone. It now renders a `SectionShell` (explicit light surface) with a
calm equal `CardGrid` of `StartingPointCard`s in source order. Preserved: every starting-point
destination (`sp.cta.route`), label, situation, icon, mapped tone, resolved recommended-stage label,
the optional `anchorId` contract, the closing CTA destination + label, and the "fitting more than
one is normal / no wrong answer" copy. The caller anchor becomes the section id and `SectionShell`
derives the heading id from it — no hard-coded duplicate heading id, no selected state, no wizard,
no "one correct starting point" claim, no JavaScript.

## 11. Goals-hub migration

`CosmicPageHero → PageHeader` (light; "Your goal" breadcrumb; eyebrow "Start with your goal"; plain
H1 "What do you want to achieve right now?"; existing lead; primary "Build my growth plan" →
`/growth-plan`; secondary "Browse goals" → `#by-goal`; no NodeOrb/aside/gradient). A compact
**hub-jump nav** (`nav aria-label="Choose how to start"`) of three real internal LinkChips — "Start
with a goal" (`#by-goal`), "Start with where I am" (`#by-where-you-are`), "Start with my business
type" (`#by-business-type`) — wraps, has ≥44px targets, and carries no sticky/tabs/client state. The
three facets: **by goal** (alt, equal CardGrid of GoalCards, every goal, no featured, no numbering),
**where you are** (the rebuilt selector, light), **by business type** (alt, equal CardGrid of
BusinessTypeCards, every type, no featured). `FinalCtaBannerSection → FinalCtaSection` (primary
`/growth-plan`, secondary `/contact`; the copy promises a tailored plan, not a guaranteed result).
Removed from `/goals` only: CosmicPageHero, GlowButton, NodeOrb, BentoCard/Grid,
FinalCtaBannerSection, gradient-word spans and featured-first selection — none deleted globally.

## 12. Structured data preserved

`/goals` keeps its `metadata` (title "Your goal", description, canonical), its `ItemList` JSON-LD of
the ten goals, and its `[Home, "Your goal"→/goals]` breadcrumb JSON-LD — all unchanged. Confirmed by
the goals-hub e2e (title, canonical, `ItemList` + `BreadcrumbList` present). The route stays static
(SSG); no URL, fragment or canonical changed.

## 13. Redirect and fragment safety

The `next.config.ts` redirects are untouched: `/business-types → /goals#by-business-type`,
`/starting-points → /goals#by-where-you-are`, `/solutions → /goals` (all permanent) — re-asserted by
the goals-hub e2e. On `/goals`, `#by-goal`, `#by-where-you-are` and `#by-business-type` each exist
**exactly once**, on their own semantic `SectionShell` sections; fragment navigation clears the
sticky header via the existing global `html { scroll-padding-top: calc(var(--header-h) + var(--space-4)) }`
(verified: computed `scroll-padding-top > 60px`, hash updates, target visible). No `/business-types`
index was created; browser back/forward fragment behaviour is normal (plain anchors, no client state).

## 14. Content-relationship results

All hub references resolve, in source order, for the current seed:

| Relationship | Count | Unresolved |
|---|---|---|
| goal → `/goals/[slug]` (GoalCard) | 10 | 0 |
| starting point → `sp.cta.route` (StartingPointCard) | 8 | 0 |
| starting point → resolved recommended stage | 8 | 0 |
| business type → `/business-types/[slug]` (BusinessTypeCard) | 7 | 0 |

## 15. Missing or unresolved relationships

**None.** Every starting point resolves its recommended stage; every goal and business type resolves
its detail route. Production uses safe omission (a starting point with no resolvable stage simply
omits its Badge; the section returns `null` if there are no starting points). No entities, labels,
recommendations or outcomes were invented; no seed dataset was rewritten.

## 16. What intentionally remained legacy

`CosmicPageHero`, `GlowButton`, `NodeOrb`, `BentoCard`/`BentoGrid` and `FinalCtaBannerSection` keep
their other consumers (removed from `/goals` only). `theme-band-bright` stays in `DeliveryModelsSection`,
`ConnectedSystemSection`, `ServiceDomainTemplate`, `GrowthTroubleshooter` and the growth-plan page —
all out of scope. Not migrated: `/how-it-works`, ConnectedGrowthSection, OneSystemSection,
ProcessStepsSection, DeliveryModelsSection, service-category routes, growth-stage routes, the
homepage, contact, growth-plan, troubleshooter and `ServiceDomainTemplate`. No root
body/themeColor/colorScheme flip; no legacy component or token deleted; the orphaned (unimported)
`goals.module.css` was repurposed to V2 rather than left as dead code.

## 17. Tests actually run

- **Unit (Vitest): 711 pass (31 files).** New: `v2-phase-2h-corrections`, `v2-goals-hub`; the
  named-colour rule + its self-test and the four new modules added to `v2-token-hygiene`.
- **Build:** `npm run build` compiles and prerenders `/goals` (static) among 103 static pages.
- **Lint / typecheck:** clean.

## 18. Complete E2E execution result

The complete Playwright + axe suite (**410 tests, 20 specs**) was executed once as **four
deterministic shards** — every spec and every test ran exactly once across the shards. Because a
single 410-test invocation exceeds the environment's per-command ceiling, this is a **complete
sharded execution, not a single-run invocation**. Commands and counts, honestly recorded:

```
PW_PORT=3101 npx playwright test --shard=1/4 --workers=4   → 103 passed
PW_PORT=3101 npx playwright test --shard=2/4 --workers=4   → 103 passed
PW_PORT=3101 npx playwright test --shard=3/4 --workers=4   → 102 passed
PW_PORT=3101 npx playwright test --shard=4/4 --workers=4   → 102 passed
────────────────────────────────────────────────────────────────────────
Total: 410 passed, 0 failed
```

**No failures and no reruns** in this complete execution — nothing to combine or preserve. Separately,
the flake-validation runs in §7 (helper applied, repeat-each=8 on the three historically-flaky
routes → 48/48; full service-domain sweep → 32/32) are recorded as their own commands, not merged
into the shard totals.

## 19. Responsive, zoom and accessibility results

0 serious/critical axe on `/goals`. No horizontal overflow at any tested width (320 / 360 / 390 /
768 / 1024 / 1160 / 1280 / 1440) — measured with the stable-layout helper. One H1 per page
("What do you want to achieve right now?") with no heading skips (H1 → section H2 → card H3); the
where-you-are facet is a wrapping grid with **no horizontal scroll container** (asserted); the
hub-jump nav is three ≥44px LinkChips that wrap; whole-card links are single tab stops with focus
matching hover; fragment targets exist once and clear the sticky header; reduced motion is honoured;
and the adaptive header holds at 200% (unchanged from prior phases). The goal and business-type
detail routes and the service routes stayed green in the sharded run.

## 20. Preview URLs and screenshots

Internal only, `noindex,nofollow`, off-nav and off-sitemap: `/design-preview` (now including a
"Goals-hub blocks" section — a StartingPointCard with a recommended stage and one with a long
wrapping label, a compact BusinessTypeCard and one with a long name/summary, and the three-link
hub-jump nav) and `/design-preview/shells`. No screenshots are attached (headless run); the pages
render the real components.

## 21. Known limitations

- The domain-colour bridge remains a migration bridge: goal, business-type and starting-point seed
  content still carries legacy tokens, mapped to accessible V2 ink at render time.
- The starting-point `recommendation` is deferred on `/goals` by design (kept compact); it is
  supported by the card API and shown in the preview and tests.
- The other e2e specs still use the naive immediate-resize overflow pattern; they have not
  manifested the race, so they were left unchanged rather than refactoring the whole suite. The
  helper is available for them if a race ever appears.
- `theme-band-bright` and the cosmic components still power the routes listed in §16 — the remaining
  migration surface.

## 22. Recommended scope for Phase 2J

Migrate **`/how-it-works`** and its homepage-shared explanatory sections — **ConnectedGrowthSection /
OneSystemSection**, **ProcessStepsSection** and **DeliveryModelsSection** (the last three still on
`theme-band-bright`) — onto PageHeader + explicit V2 surfaces + the card system, reusing
JourneyStageCard for the stage sequence and DeliveryModelBadge for the delivery models, and
preserving the `#stage` deep-link anchors that the mega-menu and roadmap/goal details link into.
Handle the homepage/`/how-it-works` shared sections with an explicit V2 opt-in (as the starting-point
selector was) so the homepage is not changed silently, and keep every deep-link fragment intact.
Defer the homepage, the conversion routes and `ServiceDomainTemplate` to later phases.
