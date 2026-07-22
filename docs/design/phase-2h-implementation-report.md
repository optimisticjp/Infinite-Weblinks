# V2 Phase 2H — Implementation Report

**Scope:** The goal and business-type detail system — migrating the `/goals/[slug]` and
`/business-types/[slug]` dynamic templates onto V2 — plus two contained Phase 2G corrections.
Compatibility-first and additive, on branch `claude/infinite-weblinks-v2-design-yb1yi3`.
Governing spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (603 unit) and
`npm run build` all pass. The e2e result (single final-gate run) is recorded honestly in §18.

---

## 1. What Phase 2H accomplished

- Fixed two Phase 2G issues: **strict article date validation** (ArticleMetaLine now accepts only
  a real `YYYY-MM-DD` calendar date or an RFC3339/ISO timestamp with an explicit timezone), and a
  **corrected, honest Phase 2G test record** (the one observed intermittent full-suite failure and
  its successful reruns).
- Added five components: **GoalPath**, **GoalCard**, **ServiceCard**, **JourneyStageCard** (and
  reused DomainCard / RoadmapCard).
- Migrated **`/goals/[slug]`** (outcome-led goal detail) and **`/business-types/[slug]`** (one kind
  of business) off the cosmic components onto PageHeader + explicit V2 surfaces + the card system.
- Extended previews, relationship-integrity and token-hygiene coverage, and added a per-route e2e
  spec including a goals-hub safety guard. Nothing outside the two named dynamic templates was
  migrated.

## 2. Files changed

| Area | Files |
|---|---|
| Components | `routes/GoalPath.tsx`+css, `cards/GoalCard.tsx`+css, `cards/ServiceCard.tsx`+css, `cards/JourneyStageCard.tsx`+css (new) |
| 2G corrections | `routes/ArticleMetaLine.tsx` (strict date validation); `docs/design/phase-2g-implementation-report.md` (honest test record) |
| Templates | `goals/[slug]/page.tsx`+`goal.module.css` (rewritten), `business-types/[slug]/page.tsx`+`business-type.module.css` (new) |
| Preview | `design-preview/page.tsx` |
| Tests | `unit/v2-article-meta` (extended), `unit/v2-token-hygiene` (extended); `unit/v2-goal-business-type-cards`, `unit/v2-goal-business-type-integrity`, `e2e/goal-business-type-detail` (new) |
| Docs | `docs/design/phase-2h-implementation-report.md` |

## 3. Strict article date validation (§A2)

`ArticleMetaLine.formatDate` no longer trusts `new Date()`. A `<time>` is emitted only when the
value is **either** a strict `YYYY-MM-DD` calendar date **or** an RFC3339/ISO timestamp carrying
an explicit timezone (`Z` or a numeric `±HH:MM` offset). It rejects — and safely omits — free-form
or locale-formatted text, an incomplete or non-padded date, an impossible or JS-normalised date
(`2025-02-30`, a non-leap `29 February`), an out-of-range month/day/time/offset, and a timestamp
with no timezone. The calendar components are round-tripped through `Date.UTC` and must survive
unchanged; the label formats the written date part in UTC so a date-only value never drifts a day;
the exact source string is preserved in `dateTime`; and invalid input never throws. No production
article carries a date, so this path is exercised only by tests and the preview. Covered by new
leap-year, impossible-date, timezone-timestamp, out-of-range and non-ISO cases in
`tests/unit/v2-article-meta.test.tsx`.

## 4. Honest Phase 2G full-suite record (§A1)

The Phase 2G report was corrected. The original `npm run test:e2e` invocation was **not a clean
single-run pass**: the `/services/social-media` "one H1 and anchored services, no overflow" spec
(an unchanged, Phase 2G-external route in the `service-domains` suite) failed **once** under full
parallel worker load. It is an observed intermittent (flaky) failure, not a reproduced defect —
re-running that spec in isolation passed (2/2) and re-running the whole `service-domains` suite
passed (32/32). **No service or application file was changed in Phase 2G.** Per flake discipline,
no service-route presentation was altered, no assertion weakened, no sleep added and no timeout
broadly raised; the report now records the failure alongside its successful reruns rather than
claiming the suite was entirely green.

## 5. GoalPath design (§B)

A goal-detail server component that renders the three parts of a goal as a semantic `<ol>` in
fixed order — **What you need → How we help → Intended outcome** — each a restrained light panel
with a compact visible sequence marker (decorative, `aria-hidden`; the `<ol>` carries the order,
so it is not announced twice), an H3 heading and the goal's own **verbatim** copy. The three
panels wrap 1 → 3 columns as space allows; none is enlarged or featured. Meaning is carried by
number, heading and text, not colour alone, and it stays understandable with CSS disabled. No
node-orb, connector, gradient, glow, progress bar, fixed height, or guarantee — the intended
outcome is the kind of result the work is built for, never a promised figure. The marker tint is
mixed against white at the measured-AA 8% used by the domain Badge, so its ink clears 4.5:1 on
every surface (including the darker alt paper).

## 6. GoalCard design (§C)

An outcome-led whole-card link: a flat IconTile + a visible "Goal" label, the goal title as the
H3, the audience hint **only when the goal genuinely has one**, and the intended outcome as the
prominent element in a soft tone-tinted block. Single tab stop (no nested interaction), soft
neutral elevation, semantic border, ≤2px hover matched by focus, reduced-motion-safe, wrapping
title/outcome. Colour resolves through the bridge to an accessible ink **and** tint; no node-orb,
glow, glass, gradient, artwork, fixed height, featured emphasis, metric or guarantee.

## 7. ServiceCard design (§D)

A delivery/category-led whole-card link: a flat category IconTile + the real category label, the
service name as the H3, the service's own plain description, and its **real** delivery model shown
with `DeliveryModelBadge` (one of the four locked labels). Single tab stop with no nested
link/button, soft elevation, ≤2px hover matched by focus, wrapping text readable at 200%. Category
colour resolves through the bridge. Nothing is invented — no model, provider, partnership,
certification, price, duration or numeric outcome — and no node-orb, glow, glass, gradient or
fixed height. Destination is `/services/[categorySlug]#[serviceSlug]`.

## 8. JourneyStageCard design (§E)

A journey-position-led whole-card link: a flat IconTile + a compact "Stage N" label (the stage's
**real** journey position, not a progress meter), the stage name as the H3, and the stage's own
summary. Single tab stop, soft elevation, ≤2px hover matched by focus, wrapping; stage colour
resolves through the bridge. It reads as a place in the journey, never project progress: no
completion state, percentage, progress bar, duration, or "every visitor follows the same sequence"
claim — and no node-orb, connector, glow, glass, gradient or fixed height. Destination is
`/how-it-works#[stageSlug]`.

## 9. Card-system coherence — eight families (§F)

The content-card system now has eight distinct families that share the Card shell's radii,
borders, neutral shadow, focus ring, hover timing, H3 hierarchy and spacing, yet each is led by
its own signal: **ArticleCard** (editorial), **CaseStudyCard** (proof/status), **ToolCard**
(catalog/connections), **RoadmapCard** (planning/sequence), **DomainCard** (domain nav),
**GoalCard** (outcome-led), **ServiceCard** (delivery/category-led) and **JourneyStageCard**
(journey-position-led). There is no mega boolean component and no forced-identical icon placement;
each keeps a genuinely different head and body while remaining recognisably one system.

## 10. Goal-detail migration (§G)

`CosmicPageHero → PageHeader` (light; breadcrumbs Goals / title; eyebrow "Goal"; mapped V2 accent;
plain H1 = `goal.title`; lead = `goal.outcome`; primary "Build my growth plan" →
`/growth-plan?goal=<slug>`; secondary "Explore services" → `/services`; trustNote = `audienceHint`
**only when present**, no fallback; no node-orb/aside/gradient). The **GoalPath** section (alt
surface) carries all three fields verbatim, with a **visible variability Callout** — not fine
print — stating outcomes vary with market, offer, budget and starting point and are not promised
numbers, and no first item is enlarged. **Example tools** are Chips in source order under "Example
tools we can connect", with ownership meaning stated **once** ("set up in your name") and the exact
disclaimer "Examples only. This does not imply partnership or endorsement." **Related services**
(alt) are an equal CardGrid of ServiceCards — real category label/icon/tone, real delivery model
and plain description, all resolved, source order, **not the goal colour on every service**, none
featured (a neutral "Service" fallback covers an unresolved category). **Related stages** (light)
are an equal CardGrid of JourneyStageCards with each stage's real order/name/summary/icon/tone —
not project-progress-looking. `FinalCtaBannerSection → FinalCtaSection` (primary carries the goal
query; copy says the plan is built around the goal without promising an outcome). Removed:
CosmicPageHero, GlowButton, NodeOrb, BentoCard/Grid, FinalCtaBannerSection, the legacy chips, the
arbitrary featured-first tiles and the goal-hue-on-everything; `goal.module.css` rewritten to V2.

## 11. Business-type-detail migration (§H)

No `/business-types` index is invented; the breadcrumb parent **"Your goal" → /goals** is
preserved, and `/goals#by-business-type` / `#by-where-you-are` are untouched. `CosmicPageHero →
PageHeader` (light; breadcrumbs "Your goal" → /goals, name; eyebrow "Who we help"; mapped accent;
H1 = `name`; lead = `summary`; primary "Build my growth plan" → `/growth-plan`; secondary "What
matters here" → `#matters`; trustNote "Every plan is tailored during discovery."; no
node-orb/aside/gradient). **Situation + goals** (alt, `id="matters"`) is an equal CardGrid of
GoalCards for every resolved goal in source order — real icon/colour/title/outcome, `audienceHint`
only when real, no first-goal feature. **Roadmap** (light, when `roadmapSlug` resolves) is a single
sequence-led **RoadmapCard** → `/roadmaps/<slug>` with the roadmap's real name/tone/icon and every
real phase; the section explains it is a suggested sequence and the detail page has the full
phases — no phase BentoCards, no featured phase, no gradient word, no duplicated fixed-route claim.
**Service domains** (alt) preserve the exact derivation (services whose `businessTypeSlugs` include
this type → `categorySlug` → dedup first-seen → real `ServiceCategory`) rendered as equal
DomainCards → `/services/[categorySlug]`, each in its own category tone; **`getServiceDomainConfig`
is no longer called** and no domain is invented or featured. `FinalCtaBannerSection →
FinalCtaSection` (primary `/growth-plan`; secondary `/goals#by-business-type`; copy says the plan
is tailored, not an identical roadmap for every business like yours). Removed: CosmicPageHero,
GlowButton, NodeOrb, BentoCard/Grid, FinalCtaBannerSection, `getServiceDomainConfig`, the gradient
"phases" word and the featured-first states. A small `business-type.module.css` (V2 tokens) holds
the single roadmap card to a readable width.

## 12. Structured data and routes preserved

- **Goal detail:** breadcrumb `[Home, Goals→/goals, goal.title]`; `generateStaticParams` /
  `generateMetadata` (title = `goal.title`, description = `goal.outcome`, canonical) / `notFound`
  and the status gate unchanged. The `/services/[category]#[service]` and `/how-it-works#[stage]`
  destinations and the `/growth-plan?goal=<slug>` deep link are preserved.
- **Business-type detail:** breadcrumb `[Home, "Your goal"→/goals, name]`; `generateStaticParams`
  / `generateMetadata` (title = `name`, description = `summary`, canonical) / `notFound` and the
  status gate unchanged. The derived `/services/[category]` and `/roadmaps/<slug>` destinations are
  preserved.
- Both routes still prerender every slug (SSG); no route URL, fragment or canonical changed.

## 13. Proof and honesty safeguards

No goal or business-type seed copy was rewritten; no outcome, guarantee, price, timeline, metric,
provider, partnership, certification or proof was invented. Goal outcomes remain the seed's
qualitative statements, reinforced by a visible variability Callout that says they are not promised
numbers. Example tools carry the "Examples only. This does not imply partnership or endorsement."
disclaimer and state ownership once. Delivery models are the four locked labels, taken from the
service's real `deliveryModel`. Roadmaps are framed as suggested sequences, tailored during
discovery.

## 14. Token hygiene (§I)

All new modules and both rewritten/added detail modules use V2 semantic surfaces, ink/tint, radii,
borders, shadows, spacing and motion only — `color-mix()` with V2 tokens is used for tints. None
reintroduces `--domain-*`, the base accent palette (`--violet/--pink/--blue/--cyan/--lime/--orange`),
`--hue`, `--border-glow`, `--glow-*`, `--grad-*`, `--glass-*`, `backdrop-filter`, or raw hex/rgb.
`tests/unit/v2-token-hygiene.test.ts` now also scans `GoalPath.module.css`, `GoalCard.module.css`,
`ServiceCard.module.css`, `JourneyStageCard.module.css`, the rewritten `goal.module.css` and the
new `business-type.module.css`. Unrelated legacy modules were not scanned or touched.

## 15. Relationship-integrity results

All references resolve for every renderable goal (10) and business type (7), verified by
`tests/unit/v2-goal-business-type-integrity.test.ts`, which mirrors the exact resolutions the two
templates perform. Resolved / unresolved:

| Relationship | Unresolved |
|---|---|
| goal → tone (mappable) | 0 |
| goal → service | 0 |
| goal → service → category | 0 |
| goal → stage | 0 |
| business type → tone (mappable) | 0 |
| business type → goal | 0 |
| business type → roadmap | 0 |
| business type → derived service domain | 0 |
| service → one of four delivery models | 0 |

Every business type derives at least one service domain. Total unresolved references: **0**.

## 16. Missing or unresolved relationships

**None.** No goal or business-type detail relationship is unresolved in the current seed.
Production uses safe omission (`.filter(Boolean)`) with a neutral "Service" category fallback on
ServiceCard, so a *future* CMS edit with one unresolved optional relationship omits that single
card (or shows a neutral service label) rather than throwing; the integrity test turns such a seed
defect into an immediate red test. No entities, labels, outcomes or delivery models were invented.

## 17. What intentionally remained legacy / out of scope

`CosmicPageHero`, `GlowButton`, `NodeOrb`, `BentoCard`/`BentoGrid`, `FinalCtaBannerSection`, the
gradient-word helper and `getServiceDomainConfig` are all unchanged and keep their other consumers
(removed from the two migrated templates only). The **`/goals` hub is deliberately NOT migrated**
— it still uses the cosmic kit, and its metadata, ItemList + BreadcrumbList JSON-LD, and the
permanent `#by-where-you-are` / `#by-business-type` redirect anchors are intact (guarded by an
e2e). Not migrated: the `/goals` hub, `StartingPointSelectorSection`, service-category routes,
growth-stage routes, `/how-it-works`, the homepage, contact, growth-plan, troubleshooter and
`ServiceDomainTemplate`. No seed dataset was rewritten; no route URL or anchor changed. No root
body/themeColor/colorScheme flip; no legacy token or component deleted.

## 18. Tests actually run

- **Unit (Vitest): 603 pass (29 files).** New: `v2-goal-business-type-cards`,
  `v2-goal-business-type-integrity`; strict-date cases added to `v2-article-meta`; hygiene extended
  to the four new components + `goal.module.css` + `business-type.module.css`.
- **E2E (Playwright + axe): the complete suite (393 tests, 19 specs) was executed once as the
  final gate — 392 passed, 1 intermittent failure, so NOT a clean single-run pass.** The one
  failure was `services-domains.spec.ts › branding-design › renders the template with one H1 and
  anchored services, no overflow` — a route **unchanged in Phase 2H** — reporting a 606px overflow
  at 360px. That is the same intermittent viewport-resize measurement race observed in Phase 2G
  (there it hit `/services/social-media`): the test reads `scrollWidth − clientWidth` right after
  `setViewportSize(360)`, and under full parallel worker load it occasionally samples before the
  reflow settles, yielding a spurious desktop-width reading. Evidence it is a flake, not a defect:
  branding-design passed **5/5** on `--repeat-each`, and re-running the whole `service-domains`
  suite flaked instead on a *different* route (`strategy-discovery`) — the failure hops with
  scheduling, never sticking to one route. Per flake discipline the cause was identified but **no
  service-route presentation was changed, no assertion weakened, no sleep added and no timeout
  broadly raised**, and the unchanged out-of-scope service test was left as-is. The failure is
  recorded here alongside its successful reruns rather than replaced. Every Phase 2H target
  passed: the new `goal-business-type-detail` spec (40/40 — per-route invariants, GoalPath
  ordered-list, example-tools disclaimer + single ownership mention, ServiceCard/JourneyStageCard
  destinations, business-type roadmap + derived domains, goals-hub safety, the axe matrix and
  no-overflow at 320–1440), and the migrated routes as exercised by `detail-pages`, `routes`,
  `content`, `content-hubs`, `catalog-hubs` and `layout`, all green. (The suite was executed once
  in four batches because a single 393-test invocation exceeds the environment's 10-minute
  per-command ceiling; each test ran exactly once.)
- **Build:** `npm run build` compiles and prerenders both `/goals/[slug]` and
  `/business-types/[slug]` (all slugs; 103 static pages total).

## 19. Responsive, zoom and accessibility results

0 serious/critical axe on the representative goal + business-type matrix (`/goals/launch-professional-store`,
`/goals/understand-whats-working`, `/business-types/ecommerce`, `/business-types/beginner`) and on
the prior sweeps. No horizontal overflow at any tested width (320–1440) on the goal and
business-type detail pages; exactly one H1 per page with no heading skips (H1 → section H2 →
card/step H3); GoalPath renders as a native `<ol>` of three headed steps with verbatim copy;
whole-card single-tab-stop links with focus matching hover; the four locked delivery labels render
exactly; "Stage N" wayfinding is present; the example-tools ownership phrase appears once and the
partnership disclaimer is shown; reduced motion is honoured; and the goals hub keeps its anchors
and JSON-LD. The new axe matrix surfaced — and the fix cleared — a real contrast defect: the
GoalPath sequence marker's surface-relative tint dropped the domain ink below AA on the darker alt
paper, corrected by mixing the marker tint against white at the measured-AA 8% used by the domain
Badge.

## 20. Preview URLs

Internal only, `noindex,nofollow`, off-nav and off-sitemap: `/design-preview` (now including "Goal
& business-type detail blocks": a real GoalPath, GoalCards with and without an audience hint and a
long wrapping title, ServiceCards exercising all four delivery-model labels plus a long wrapping
title, and JourneyStageCards) and `/design-preview/shells`. No screenshots are attached (headless
run); the pages render the real components.

## 21. Known limitations

- The domain-colour bridge remains a migration bridge: goal, business-type and service-category
  seed content still carries legacy tokens, mapped to accessible V2 ink/tint at render time.
- The `/goals` hub and the routes listed in §17 still use the cosmic kit; they are the remaining
  migration surface.
- No goal, business type or article carries a publication date, so `ArticleMetaLine`'s hardened
  `<time>` path is exercised only in tests and the preview, never in production content.

## 22. Recommended scope for the next phase

Migrate the remaining cosmic-kit surfaces — the **`/goals` hub** (with `StartingPointSelectorSection`),
the **service-category** and **growth-stage** routes and **`/how-it-works`** — onto PageHeader +
explicit V2 surfaces + the now-complete eight-family card system, reusing GoalCard, ServiceCard,
JourneyStageCard, DomainCard and RoadmapCard for their relationships and preserving each page's
structured data, redirect anchors and honesty language. Then retire the cosmic components once
their last consumers are migrated.
