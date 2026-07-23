# V2 Phase 2Q — Implementation Report

**Scope:** the V2 Digital Growth Troubleshooter — migrate exactly `/troubleshooter`, the visual
presentation and accessibility contract of `GrowthTroubleshooter`, and the troubleshooter-specific
presentation components created this phase — plus a contained set of Phase 2P corrections. Branch
`claude/infinite-weblinks-v2-design-yb1yi3`, reviewed base `3bc7ff1`. Light-first Stripe/Clay system.

No other route was migrated (`/starting-points/[slug]`, other routes, error/status routes untouched).
The troubleshooter **content** is unchanged — problem slugs, labels, icons, explanations, reason
titles/bodies, checks, focusFirst copy, `recommendedStageSlug` values, source order and metadata copy
are all preserved. The **interaction contract** is unchanged — the first problem is initially
selected, exactly one problem is selected, clicking a problem changes the visible guidance, selection
is click/keyboard-driven (never hover), the selected state uses `aria-pressed`, selection lives in
React state only, nothing is persisted, no URL query or hash encodes the selection, and no form or API
request is introduced. No AI/diagnosis/certainty/proof/price/guarantee/email-capture was added. The
canonical URL, `noindex, follow`, the eight problem slugs, the growth-stage URLs, the `/growth-plan`
destination and the public content status gates are unchanged. No root colour-scheme flip, no broad
legacy-component deletion, no deploy, no PR.

---

## 1. What Phase 2Q accomplished

- **Completed the contained Phase 2P corrections** (LCP wording, unused preview data, engine-derived
  PlanReveal preview, growth-plan no-JS/fragment/error-axe coverage, OptionCards comment).
- **Proved the troubleshooter content graph** with dedicated integrity tests before touching the
  presentation.
- **Added two static V2 presentation components** — `TroubleshooterReasonCard` and
  `TroubleshooterChecklist`.
- **Migrated `/troubleshooter`** off the custom cosmic hero (GlobeArc + the decorative broken-journey
  diagram) onto the shared V2 `PageHeader`.
- **Rebuilt `GrowthTroubleshooter`** on the V2 light-first system — a two-band selector + active
  guidance region — preserving its interaction and accessibility contract exactly.
- **Added the focus-first next step and one reserved-night `FinalCtaSection`.**
- **Updated `/design-preview`**, extended token-hygiene, and added route / component / card unit
  coverage and a full E2E spec.

## 2. Files changed

**New — components:** `cards/TroubleshooterReasonCard.tsx` + `.module.css`,
`routes/TroubleshooterChecklist.tsx` + `.module.css`.
**New — tests:** `tests/unit/v2-phase-2p-corrections.test.ts`, `tests/unit/troubleshooter-content.test.ts`,
`tests/unit/v2-troubleshooter-route.test.ts`, `tests/unit/v2-growth-troubleshooter.test.tsx`,
`tests/unit/v2-troubleshooter-cards.test.tsx`, `tests/e2e/troubleshooter.spec.ts`.
**Rewritten / edited:** `app/(convert)/troubleshooter/page.tsx` (PageHeader + FinalCtaSection);
`components/troubleshooter/GrowthTroubleshooter.tsx` + `.module.css` (rebuilt);
`app/design-preview/page.tsx` (Phase 2Q preview + engine-derived PlanReveal fixture);
`src/app/(convert)/growth-plan/page.tsx`, `src/lib/content/data/growth-plan.ts`,
`src/lib/content/data/index.ts`, `src/components/primitives/OptionCards.tsx` (2P corrections);
`tests/e2e/growth-plan.spec.ts`, `tests/unit/v2-growth-plan-content.test.ts`,
`tests/unit/v2-token-hygiene.test.ts`; `docs/design/phase-2p-implementation-report.md`.
**Removed:** `app/(convert)/troubleshooter/troubleshooter.module.css` (unused after migration).

## 3. Phase 2P corrections

- **LCP wording** — the unmeasured "server H1 = LCP" claim in the Phase 2P report and the
  `/growth-plan` page comment is replaced: the H1 is server-rendered and a *likely* LCP candidate, but
  the LCP element was not measured (no Lighthouse / field data / trace; no measured LCP/CLS/JS-byte
  result is claimed).
- **Unused preview data** — `growthPlanPreviewItems` (no route or preview consumer, a near-duplicate
  of the six-item `growthPlanIncludes`) is removed from the content module and the data barrel; the
  module documentation records the retirement of the old decorative five-line hero preview, and the
  six-item `growthPlanIncludes` is the retained explanation. Content tests updated.
- **Engine-derived PlanReveal preview** — the design-preview fixture is produced by `resolve()` +
  `growthPlanRuleSet` from one stable set of real public inputs (ecommerce / launch-professional-
  store), not a hand-authored object literal. Deterministic, no API call, no visitor data; PlanReveal
  still never shows `matchedRuleId`. A test proves it is created through the engine, not a cast literal.
- **Growth-plan no-JS** — the no-JS oracle now checks the H1, the complete hero lead, all three trust
  points, both hero actions, the Step 1 heading + subtitle, the fieldset + the "Business type" legend,
  every business-type option's exact value/label/description in source order, that none is initially
  checked, all six plan-inclusion titles/bodies, and the final CTA's `#builder` + `/contact`
  destinations.
- **Growth-plan fragment geometry** — `#builder`, `#what-your-plan-includes` and `#get-started` each
  occur once, are visible meaningful content, and clear the sticky header through ordinary hash
  navigation.
- **Follow-up error-state axe** — a new E2E test reaches the on-screen plan, submits the review form
  with the required fields empty, verifies the accessible error state (role="alert" + aria-invalid),
  and runs axe with no mocked success.
- **OptionCards comment** — the `CardOption.color` comment now states that supplied legacy/domain
  tones map through `domainInk`, missing tones use one restrained V2 fallback ink, and there is no
  palette cycle.

## 4. Corrected LCP wording

See §3. The corrected wording appears in the Phase 2P report (three places), the `/growth-plan` page
comment, and the new `v2-phase-2p-corrections.test.ts`, which fails if "server H1 = LCP" reappears.

## 5. Growth-plan preview-data resolution

`growthPlanPreviewItems` is removed (not replaced with another near-duplicate section). The retirement
is recorded in the content module and this report; `growthPlanIncludes` (six items) remains the single,
non-duplicative "what your plan can include" explanation. `GrowthPlanPreview` (the separate homepage
component) is untouched.

## 6. Engine-derived PlanReveal preview

See §3. The design preview renders a real deterministic result; the preview is clearly labelled
illustrative.

## 7. Completed growth-plan no-JS coverage

See §3. The no-JS test now directly asserts the labels, descriptions, fieldset, legend and both hero
and final-CTA actions from the real dataset; the Phase 2P report's no-JS description is corrected to
match this direct coverage.

## 8. Completed growth-plan fragment and error-state coverage

See §3 — three mid-page fragments receive geometry coverage, and the follow-up validation-error state
receives an axe check (no success mock).

## 9. Troubleshooter content-graph integrity

`troubleshooter-content.test.ts` proves: exactly eight problems; unique non-empty slugs and labels;
every icon resolves through the shared Icon map; every colour maps through the domain bridge to a V2
ink; reasons complete, uniquely-titled and ordered; exactly five non-duplicate checks per problem;
non-empty focusFirst; every `recommendedStageSlug` resolves to one real renderable growth stage (so
every `/how-it-works#<stage>` deep link targets a real stage fragment); and no fabricated
metric/price/guarantee/ranking/certainty/testimonial/rating — with a self-test proving the honesty
guard fires on a planted defect. A source-data defect fails here, not in the presentation layer.

## 10. Troubleshooter page information architecture

Two calm bands instead of four dark/bright/dark route bands: a light PageHeader → an alt-surface
selector SectionShell (`#diagnose`) → a light-surface active-guidance SectionShell (`#diagnosis`)
holding one stable result region → the single reserved-night FinalCtaSection (`#get-started`).

## 11. PageHeader migration

The custom `theme-dark` hero, `GlobeArc`, the route-local `JOURNEY` array and its
Traffic→…→Purchase broken-link diagram, the gradient accent word, the SVG-gradient decoration and the
glow are removed. In their place, `PageHeader` (`id="troubleshooter-hero"`, light surface, a "Growth
troubleshooter" breadcrumb, the eyebrow "The digital growth troubleshooter", a plain server-rendered
H1, the approved lead, a primary CTA to `#diagnose` and a secondary to `/growth-plan`, and a no-email
trust note). Metadata title, description, canonical and `noindex, follow` are preserved exactly.
`GlobeArc` itself is untouched for its other (legacy) consumers.

## 12. Selector design

All eight problems render as native `<button type="button">`s inside a semantic list. Each shows a
flat `IconTile`, the exact problem label and (when selected) a visible tick, on a mapped V2 ink/tint
(via `domainInk`/`domainTint`) — no legacy colours, no `--accent`, no glow/gradient, no fixed height.
`aria-pressed` reflects selection; every button targets `aria-controls="troubleshooter-result"`;
exactly one is pressed; selection is conveyed by the tick + border (not colour alone); there is a V2
focus ring with hover/focus parity; native buttons keep focus after activation; no nested button/link.
The grid is one column on narrow screens and wraps on wide with no horizontal scroll; long labels wrap
at 200% text.

## 13. Selection-state preservation

`useState`, first-problem initial selection with a first-problem fallback, `activeSlug`, exact source
order, one active problem, click/keyboard-driven selection (no hover), no persistence, no query/hash
state and no form/API request — all preserved and unit- and E2E-tested.

## 14. Active-guidance region

One stable region (`id="troubleshooter-result"`, `role="region"`, labelled by the active problem
heading) holds the active heading + explanation, the common-reasons cards, the ordered checks and the
focus-first block. A concise visually-hidden `aria-live="polite"` status ("Showing guidance for:
<label>") announces the change — the long result is not wrapped in a live region. Selection does not
move focus or auto-scroll; no animation or fake loading is required. The rendering contract is now
accurate: every selector choice is always present; only the active problem's detailed guidance is
rendered and it updates on selection.

## 15. Reason-card design

`TroubleshooterReasonCard` — a static article Card (never a link/button) with a flat IconTile, the
reason title as its H3 and the body verbatim, on a mapped V2 ink. No featured/rank/NodeOrb/glow/glass/
gradient/fixed height. Framed as a possible reason, under the heading "Why this may be happening" —
never a certain diagnosis.

## 16. Checklist design

`TroubleshooterChecklist` — a semantic `<ol>` of the checks in source order, each with a small visible
sequence number and the full text, under "Things you can check today". No checkboxes, no
completion/progress or "done" state, no duration, no result claim, no interaction; single column on
narrow screens, no horizontal rail.

## 17. Focus-first presentation

A restrained bordered panel (never a dark hero) with the eyebrow "Focus first", the active problem's
focusFirst copy verbatim, and two contextual next steps — a primary Button to `/growth-plan` and a
secondary Button to `/how-it-works#<recommendedStageSlug>` ("See the connected stage"). No "only fix"
or guaranteed-result claim, no glow, no duplicated signature-CTA styling.

## 18. Recommended-stage integrity

Every problem's `/how-it-works#<recommendedStageSlug>` targets a real, renderable growth-stage
fragment; the content integrity test forbids an orphan/misspelled slug, so the "See the connected
stage" link can never resolve to a missing stage.

## 19. Final CTA

One reserved-night `FinalCtaSection` (`id="get-started"`, "Ready to turn the first check into a
plan?", primary `/growth-plan`, secondary `/contact`). This is the route's only dark section — no
globe, broken journey, InfinityMark, gradient heading or animated decoration.

## 20. Metadata, robots and canonical preservation

Title "Growth Troubleshooter — find where to look first", the existing description, canonical
`/troubleshooter` and `robots: { index: false, follow: true }` are preserved byte-for-byte. No JSON-LD
was added (none existed).

## 21. Fragment results

Retired (no consumer): `#ts-hero-heading`, `#ts-select-heading`, `#ts-checks-heading`,
`#ts-focus-heading`. Final fragments — `#troubleshooter-hero`, `#diagnose`, `#diagnosis`,
`#get-started` — each occur exactly once, carry visible meaningful content, and clear the sticky
header through ordinary hash navigation. The stable active-result region uses `#troubleshooter-result`;
the selected problem slug is never a public fragment.

## 22. No-JavaScript result and switching limitation

With JavaScript disabled, `/troubleshooter` serves the page framing (H1 + lead + both hero actions +
no-email trust note), all eight selector buttons and their identity, the **first problem selected in
the server response**, and the first problem's full guidance (heading, explanation, every reason, all
five checks, focusFirst and the recommended-stage link), plus the growth-plan action, the final CTA
and every route fragment. Page framing and initial guidance are server-rendered; the first problem is
the no-JS result; **switching to another problem requires JavaScript**. No fake all-problems no-JS
experience was claimed, and no form or API fallback was needed (there is none). No noscript-only
duplicate of all eight result panels was added.

## 23. Content-integrity and honesty results

See §9 — the content graph is complete, ordered and connected, and the honesty guard confirms no
fabricated proof/metric/guarantee/rating/price/ranking. Descriptive advice vocabulary
("Reviews, guarantees … are missing") is preserved and not misread as a claim.

## 24. Legacy-route safety

`/growth-plan`, `/contact`, `/pricing`, `/services`, `/starting-points/[slug]` and the rest are
untouched beyond the contained growth-plan 2P corrections; no unrelated component was deleted (only
the route-local `troubleshooter.module.css`, unused after migration, was removed). The cross-route
axe smoke covers `/`, `/growth-plan`, `/contact`, `/pricing`, `/services`, `/how-it-works`, `/about`,
`/starting-points/website-no-traffic`, `/privacy`, `/design-preview` and `/design-preview/shells`.

## 25. Client-JavaScript, SVG and presentation-cost changes

BEFORE: zero canvas; one server-rendered `GlobeArc` SVG + one server-rendered decorative broken-journey
diagram; `GrowthTroubleshooter` is the necessary Client Component. AFTER: still zero canvas; GlobeArc
and the journey diagram removed; no SVG-gradient route decoration; `GrowthTroubleshooter` remains the
single Client Component (no additional client boundary, no external host, no new dependency, no
layout-shifting illustration); page framing remains server-rendered. No canvas-count, JS-boundary,
byte-reduction, measured-LCP/CLS or Lighthouse claim is made.

## 26. Tests actually run

- `npm run lint` — pass.
- `npm run typecheck` (`tsc --noEmit`) — pass.
- `npm run test` (Vitest) — **1820 passed** across 67 files.
- `npm run build` (Next production build) — pass.
- `npm run cf:build` (OpenNext → Cloudflare Worker) — pass.
- `npx playwright test` (full suite, 4 workers) — see §28.

## 27. cf:build result

`npm run cf:build` completes: "OpenNext build complete — Worker saved in `.open-next/worker.js`". No
deploy was run.

## 28. Complete E2E result

Run as one full-suite command (`npx playwright test --workers=4`), then a targeted rerun after fixes,
kept separate from the complete-suite total:

- **Full-suite run 1:** 678 passed, 3 failed — `growth-plan.spec.ts` only:
  1. "the submit button disables while submitting" — load-flaky under 4 workers (the 600 ms mock
     resolved before the disabled state was asserted). Passed in isolation.
  2. + 3. fragment geometry for `#what-your-plan-includes` and `#get-started` — deterministic: an
     initial-load hash scrolls the pre-hydration layout, which the client `PlanBuilder` then reflows,
     leaving the target below the fold.
- **Fixes:** the two mid/bottom fragment tests now navigate the hash on the settled page (as a user
  clicking an in-page anchor does — measured to land the target at top ≈ 88 px, cleanly below the
  73 px sticky-header bottom), and the submit-disabled mock hold is raised to 1.5 s.
- **Targeted reruns (separate from the total):** `growth-plan.spec.ts` — 32/32 passed (4 workers);
  `troubleshooter.spec.ts` — 34/34 passed.
- **Full-suite run 2 (final):** **681 passed, 0 failed** (6.3 min).

## 29. Responsive, zoom, interaction and accessibility results

`troubleshooter.spec.ts` validates: no horizontal overflow at all eight widths (320→1440); one H1;
logical heading hierarchy; the selector above the guidance on mobile; the result not sticky; no canvas;
no horizontal selector rail; all eight buttons reachable and selectable; Enter and Space activate;
exactly one `aria-pressed=true`; selection visible beyond colour (the tick); focus ring visible; the
active guidance updates completely; the concise live status updates; 44px targets; reduced motion;
200% text; and zero serious/critical axe on the initial state and each of the eight problem states.
(axe cannot run with JavaScript disabled — it injects and executes axe-core in the page — so the no-JS
result's accessibility is covered by the initial-state axe run, which loads the identical
server-rendered DOM, the first problem selected, before any interaction.) The selector grid clamps its
column floor with `min(15rem, 100%)` so 200% root text never forces a track wider than the viewport.

## 30. Preview URLs and screenshots

`/design-preview` → "Phase 2Q · Growth troubleshooter" section (internal, noindex,nofollow, off nav
and sitemap). No screenshots are attached to this repo report.

## 31. Known limitations

- Switching problems requires JavaScript (by design — see §22).
- `--yellow` (the "unsure-priority" problem tone) has no dedicated domain mapping and resolves to the
  restrained V2 fallback ink; this is the intended fallback behaviour, not a defect.
- No measured performance figures are claimed (see §25).

## 32. Recommended scope for Phase 2R

With `/troubleshooter` migrated, the remaining cosmic conversion surface is `/starting-points/[slug]`.
Recommended Phase 2R scope: **`/starting-points/[slug]` only.** Explicitly out of scope: Turnstile
production-policy hardening, a new email architecture, persistence/accounts, the root colour-scheme
flip, and any broad legacy-component / galaxy-engine deletion.
