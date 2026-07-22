# V2 Phase 2K — Implementation Report

**Scope:** V2 homepage convergence — migrating exactly `/` onto the V2 light-first spine and
building the homepage-specific V2 sections it needs, plus four contained Phase 2J corrections.
Additive and compatibility-first, on branch `claude/infinite-weblinks-v2-design-yb1yi3`. Governing
spec: `docs/design/v2-design-spec.md`; principles: `.specify/memory/constitution.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (**974 unit**),
`npm run build` and `npm run cf:build` all pass. The complete e2e suite ran once as four
deterministic shards — **440/440 passed, zero failures** (§24).

---

## 1. What Phase 2K accomplished

- Completed four Phase 2J corrections: the delivery `DeliveryModelKey` now has a single canonical
  source (`content/types.ts`); `DeliveryModelCard` derives its own id and default flag (callers
  cannot override); the `/how-it-works` explainer gained JavaScript-disabled coverage; and every
  stage / system / section / delivery id gained fragment-geometry clearance coverage.
- Built the homepage-specific V2 sections — **HomepageHeroSection**, **HomepageProblemSection**,
  **HomepageGoalRouterSection**, **HomepageConnectedSystemSection**, **HomepageTrustSection**,
  **HomepageLearningSection** — plus the static **GrowthPlanPreview** and the centralised
  **honest-expectations** data source.
- Reused **DeliveryModelsExplainerSection** for the homepage's ways-of-working section via new
  optional `id` / `showOwnership` props, leaving `/how-it-works` byte-for-byte unchanged by default.
- Migrated **`/`** onto the eight-section light-first spine with a server-rendered H1, no cosmic
  engine, and every homepage fragment on real visible content — retiring the legacy homepage
  sections from the route while leaving them intact for their other consumers.

## 2. Files changed

| Area | Files |
|---|---|
| Delivery hardening (2J) | `lib/design/deliveryModel.ts` (canonical `DeliveryModelKey`), `cards/DeliveryModelCard.tsx` (derives id + default), `sections/DeliveryModelsExplainerSection.tsx` (`id` / `showOwnership`) |
| New homepage components | `routes/GrowthPlanPreview` (+css); `sections/home/HomepageHeroSection`, `HomepageProblemSection`, `HomepageGoalRouterSection`, `HomepageConnectedSystemSection`, `HomepageTrustSection`, `HomepageLearningSection` (+css each) |
| Centralised content | `lib/content/data/honest-expectations.ts` (new); `sections/home/HonestExpectationsSection.tsx` (reads it) |
| Route | `app/(marketing)/page.tsx` (migrated to the V2 spine) |
| Preview | `app/design-preview/page.tsx` + `design-preview.module.css` (Phase 2K spine block) |
| Unit tests | `unit/v2-homepage-sections` (new), `unit/v2-homepage-learning-empty` (new), `unit/v2-homepage-safety` (repurposed for 2K), `unit/v2-how-it-works` + `unit/v2-delivery-metadata` (2J), `unit/v2-token-hygiene` (extended) |
| E2E tests | `e2e/homepage.spec.ts` (rewritten for V2), `e2e/how-it-works.spec.ts` (no-JS + fragment geometry + homepage-scope guard), `e2e/audit-fixes.spec.ts` (V2 ring), `e2e/layout.spec.ts` (standard-container sample) |
| Docs | `docs/design/phase-2k-implementation-report.md` |

## 3. Phase 2J correction — one `DeliveryModelKey`

`deliveryModel.ts` now `import`s and re-exports `DeliveryModelKey` from `content/types.ts`; its
local union is gone. One type flows across content → `ServiceCard` → `DeliveryModelBadge` →
`DeliveryModelCard` → the central metadata. The four keys stay exhaustive with exact labels, an
unknown key still throws, and there is no circular import (`types.ts` imports nothing from
`design/`). Regression: `unit/v2-delivery-metadata` asserts the source declares **no second union**
and carries the import from `content/types`.

## 4. Phase 2J correction — `DeliveryModelCard` is self-deriving

The card takes `{ order, modelKey, tagline, description }`. It derives `id={`delivery-${modelKey}`}`
internally and derives "Our default" **only** when `modelKey === "we-do"` — the `id` and `isDefault`
props are gone, so a caller cannot mislabel a card or forge a duplicate anchor. The four production
fragment ids and the `/how-it-works` output are unchanged; section, preview, unit and fragment tests
were updated accordingly.

## 5. Phase 2J correction — `/how-it-works` without JavaScript

`e2e/how-it-works.spec.ts` gained a `test.use({ javaScriptEnabled: false })` block asserting, from
the server response alone: one H1; the 8 stage, 3 system, 8 process and 4 delivery headings; every
fragment target present; working fragment navigation; the primary CTA destination; and no content
hidden behind interaction. No no-JS-only markup was added to production.

## 6. Phase 2J correction — complete fragment-geometry coverage

Every stage / system / section / delivery-model id is covered by
`expectFragmentTargetClearsStickyHeader`, grouped into a small number of looping tests
(`about:blank` → `goto(/how-it-works#id)` → helper) so each id is checked once. The id-uniqueness
assertions are preserved.

## 7. Homepage information architecture

The spine, in order: **hero** (with the works-with rail) → **the digital-world problem** → **start
with your goal** → **one connected system** (with the growth-journey / customer-journey / services
bridges) → **ways of working** → **ownership + honest expectations** → **learn** → the single dark
**final CTA**. Shorter and more decisive than the legacy homepage; verified proof appears only if the
gate returns genuine publishable client proof (none under the current seed, so none renders).

## 8. What the homepage no longer renders

No full 8-stage `GrowthJourneyOverviewSection` / `GrowthJourneyList` / `StageTimeline`; no legacy
customer phone strip; no `ServicesConstellationSection` or full services catalogue; no second
page-wide router; no fabricated metrics or testimonial placeholders; no illustrative `CaseScenario`
in a proof slot; no empty "coming soon" proof shell. Guarded by `unit/v2-homepage-safety` and
`e2e/homepage.spec.ts`.

## 9. GrowthPlanPreview (`routes/GrowthPlanPreview`)

A truthful **static** preview of how the real Growth Plan organises a recommendation: the label
"Your growth plan", the context it is built from (your business / your goal / your current setup),
the three real ordering buckets (Start here → Connect next → Add later), a "tailored during
discovery" note and an ownership reassurance. It shows the output **structure**, never a fabricated
plan: no invented business, goal, service, percentage, date, price, result, email, submit button,
form control, selected radio or loading/generated state. Server Component; static composition on
light paper; flat IconTiles; no NodeOrb, ConnectorPath, glow, glass, gradient, animation, client
boundary or fixed height; accessible preview label; understandable with CSS off.

## 10. HomepageHeroSection (`sections/home/HomepageHeroSection`)

Uses the existing seed `HeroContent` verbatim: eyebrow, slogan, the complete headline in original
word order (accent as a **solid** `--v2-brand-strong` span, not a gradient), support, reassurance,
both CTAs and all five connected areas. Light surface, server `<h1 id="hero-heading">`, no
breadcrumb, two-column (copy first in the DOM and visually) with `GrowthPlanPreview` alongside; no
canvas, HeroUniverse, starfield, InfinityMark bloom, ambient animation, gradient H1 or full-screen
height. Above the fold at 390×844 the full H1, a support line and the full primary CTA are visible
(asserted in `e2e/homepage.spec.ts`). The works-with rail renders every `BrandLogo` with the label
"Works with the tools your business already uses." and the clarification "Examples only. No
partnership or endorsement implied." — full-colour logos on light tiles, no marquee / auto-scroll /
animation, accessible names, safe wrapping. All hero copy and the H1 are server-rendered with no JS
dependency.

## 11. HomepageProblemSection (`sections/home/HomepageProblemSection`)

The V2 replacement for the legacy `EditorialStatement` on the homepage (the legacy component stays
for its registry mapping). Renders the existing `EditorialSection` verbatim on a V2 alt surface: the
eyebrow, the complete heading as a plain H2, every body paragraph in source order at a readable
measure, and the three points as static outlined Cards with flat IconTiles in their mapped tones. No
platform-logo ring, NotificationCard, fake state, InfinityMark, floating composition, theme-band,
gradient word or featured first point.

## 12. HomepageGoalRouterSection (`sections/home/HomepageGoalRouterSection`)

`id="goals"`. Every renderable goal in source order as a `GoalCard` routing to
`/growth-plan?goal=${goal.slug}` (audience hint omitted for compactness; title and outcome kept). A
restrained "not sure which fits?" panel offers the catch-all `/growth-plan` and `/goals`. No
featured / omitted / ranked / popular goal, BentoCard, ConnectorPath, GlowButton, filtering, tabs,
carousel or horizontal rail; tighter spacing than a catalogue.

## 13. HomepageConnectedSystemSection (`sections/home/HomepageConnectedSystemSection`)

`id="how-it-connects"`, light surface, reusing the legacy `OneSystemSection` eyebrow / title meaning
/ lead. Renders the `ConnectedSystemFlow`, a CTA to `/how-it-works`, then three whole-card bridges
that carry the homepage's fragments on real content: **growth-journey** (`id="growth-journey"`, "The
eight-stage growth journey", → `/how-it-works#growth-journey`), **customer-journey**
(`id="customer-journey"`, grounded heading, → `/connected-growth`, no PhoneFrame), and **services**
("Explore the service catalogue", → `/services`, no constellation). No nested interaction; the whole
card is the link.

## 14. Delivery reuse for the homepage

`DeliveryModelsExplainerSection` gained optional `id` (default `"delivery"`) and `showOwnership`
(default `true`); `surface` is unchanged. `/how-it-works` is unchanged by default. The homepage
renders it with `id="ways-of-working"`, `showOwnership={false}` and an alt surface — the four models,
their order, names, taglines, descriptions and the "Our default" flag on we-do are preserved, and
ownership is not repeated (it lives in the trust section). The legacy `DeliveryModelsSection` and
`/about` are untouched.

## 15. Centralised honest-expectations

The exact WON'T and PROMISE arrays moved verbatim to
`lib/content/data/honest-expectations.ts` (typed), consumed by both the legacy
`HonestExpectationsSection` (/about) and the new `HomepageTrustSection`. Titles, copy and order are
unchanged; `/about` output is identical; no new claims; no Sanity. Guarded by
`unit/v2-homepage-sections` (both consumers import the shared source; neither re-declares a local
array).

## 16. HomepageTrustSection (`sections/home/HomepageTrustSection`)

`id="ownership"`, light surface, plain H2. Ownership uses the real account-ownership data: heading,
body, vault label, the assets list under "Owned and controlled by you", the build flow in source
order, every guarantee and the closing statement — as one restrained Card plus semantic lists, with
no vault glow, orbit, constellation, raw palette or giant dark panel. The honest subsection
(`id="honest"`) reads the centralised data and lists "What we won't do" / "What we do promise" in
source order with X / check wording and icons (no NodeOrb, glow or colour-only meaning). The closing
sentence shows; the old CTA button pair is **not** repeated (the final CTA follows). Heading order:
H2 → H3 (guarantees / honest) → H4 (columns).

## 17. HomepageLearningSection (`sections/home/HomepageLearningSection`)

`id="learn"`, V2 surface. The first three renderable articles in source order as `ArticleCard`s with
real related-goal labels + mapped tones and real reading times, plus a CTA to `/learn`. No positional
glyph, featured-first article, invented date or author, or theme-band. It **renders nothing** when
there are no articles — proven by `unit/v2-homepage-learning-empty` (mocked empty getter → null).

## 18. Proof-gating

No verified-proof, testimonial, logo-wall, numeric-outcome or empty-placeholder block renders under
the current seed; the illustrative `CaseScenario` is never used as proof. `e2e/homepage.spec.ts`
asserts the JSON-LD contains **Organization + WebSite** and **not** Review or AggregateRating, and
that no testimonial / "results" / "case study" heading or verified-client / star wording appears.

## 19. The migrated route (`app/(marketing)/page.tsx`)

Preserves server rendering, the self-canonical (`canonical("/")`), the organization + website
JSON-LD, `getHomepageOpening`, the seed `HeroContent` and `EditorialSection`, one H1, the primary
growth-plan CTA and the secondary how-it-works CTA. Renders the eight sections in order; the
`FinalCtaSection` is `id="get-started"`, dark/night surface, primary `/growth-plan` "Build my growth
plan" with a secondary `/contact` fallback, no globe / orbit / InfinityMark glow / gradient heading.
The legacy homepage sections are no longer rendered here but remain in the codebase for their other
routes and the registry.

## 20. Fragment contract

All ten homepage fragments resolve **exactly once** on meaningful visible content, clear the sticky
header, work without JavaScript and behave under normal back/forward: `#goals`, `#growth-journey`,
`#how-it-connects`, `#customer-journey`, `#services`, `#ways-of-working`, `#ownership`, `#honest`,
`#learn`, `#get-started`. No homepage section named `delivery` is created (the homepage delivery
section is `ways-of-working`; the per-card `#delivery-<key>` ids stay page-scoped to
`/how-it-works`). Verified in `e2e/homepage.spec.ts` (uniqueness + visibility + bridge hrefs +
per-fragment sticky-header clearance).

## 21. CSS / motion discipline

The spine is ~70% light, ~20% alt and exactly one dark section (the final CTA); no other full-width
dark surface and no full-screen section after the hero; one idea per section, compact rhythm, no
decorative backgrounds. The seven new modules pass the extended `unit/v2-token-hygiene` guard — no
`--domain-*` in CSS, no base palette, no `--hue` / legacy `--accent`, no glow / gradient / glass /
theme-band(-bright) / backdrop-filter, no raw hex / rgb / rgba, no raw white / black, no fixed
decorative viewport heights. Motion is limited to focus, a ≤2px lift and reduced-motion-safe
one-shot entrances below the LCP; no loops, parallax, canvas, carousels or hover-only affordances.

## 22. Performance — before / after

Measured from source and from the production build (Lighthouse / LCP / CLS were **not** run in this
environment, so no synthetic scores are invented — the structural reasons they improve are noted).

| Metric | Before (legacy homepage) | After (V2 spine) |
|---|---|---|
| `<canvas>` on `/` | 1 (`Starfield`, via `HeroUniverse`) | **0** |
| Route-level client components pulled onto `/` | ~9 (`HeroUniverse`, `Starfield`, `ConnectorPath`, `RailBar`, `StageTimeline`, `FloatingCards`, `InView`, `ConstellationLayout`, `PhoneFrame`) | **0** |
| H1 | rendered inside the cosmic hero | **server-rendered text** (`id="hero-heading"`, present in prerendered HTML) |
| rAF / animation loops on `/` | several (starfield, in-view, timeline, floating cards) | **0** |
| `HeroUniverse` import | present | **absent** |
| Homepage brand logos | — | dimensioned (`width`/`height`) → no layout shift |
| Prerendered `/` shared framework JS (uncompressed) | 578.2 kB (9 shared chunks) | 578.2 kB (9 shared chunks) |

The shared-framework baseline is identical because it is chrome/runtime, not route code; the real
delta is that the V2 route ships **zero** route-level client-component chunks and **zero** canvas,
versus the legacy route's nine hydrating client components (this Next build configuration does not
print per-route "First Load JS", so that figure is reported structurally rather than as an invented
number). Structurally, LCP improves (the H1 is server text, not a canvas-backed hero), TBT/main-thread
work drops (no rAF loops), and CLS stays ~0 (dimensioned logos, static server preview, no late-mounting
decoration).

## 23. Internal design preview

`/design-preview` gains a "Phase 2K · Homepage spine" block rendering the real components on real
seed content: `GrowthPlanPreview`, a **labelled hero shell** (an H2, never a second document H1) with
the works-with rail, the problem editorial, the goal router, the connected-system bridges, the
delivery section in its no-ownership homepage configuration, the merged trust blocks and the Learn
preview. No fabricated data; the page stays `noindex, nofollow`, off-nav and off-sitemap. The
standalone delivery-card demo moved into the real section so each derived `delivery-<key>` id stays
unique on the page (axe verified).

## 24. Validation

| Check | Result |
|---|---|
| `npm run lint` | pass (0 problems) |
| `npm run typecheck` | pass |
| `npm run test` | **974 unit** across 36 files, 0 fail |
| `npm run build` | pass (`/` is `○ Static`; 103/103 static pages) |
| `npm run cf:build` | pass (OpenNext worker saved to `.open-next/worker.js`) |
| `npm run test:e2e` (sharded 1–4/4, `--workers=4`) | **440/440 pass** (110 + 110 + 110 + 110), 0 fail |

The e2e suite ran once as four deterministic shards (`--shard=X/4`) so each of the 440 tests executed
exactly once. The no-JS `/how-it-works` block and the per-fragment geometry loops run inside those
shards; no reruns or stress passes are counted in the 440 total. The `audit-fixes` focus-ring test
targets the isolated homepage-hero and contact-form cases within the shards.

## 25. Test-guard reconciliations (homepage legitimately changed)

Four guards encoded the pre-2K homepage and were reconciled to the migrated reality (the homepage
change is the task, so these are updated, not weakened):

- `unit/v2-homepage-safety` — repurposed from "homepage is untouched" to "homepage is the V2 spine
  and never re-introduces the cosmic engine, a page-wide router, a services constellation or the
  legacy sections; server contract preserved".
- `e2e/homepage.spec.ts` — rewritten for the V2 spine, fragments, proof-gating, overflow and the
  root canonical (origin-only, trailing slash normalised).
- `e2e/how-it-works.spec.ts` — the "homepage not migrated" block became a page-scope guard (the
  how-it-works page navs never appear on the homepage; the homepage is V2, not legacy).
- `e2e/audit-fixes.spec.ts` — the homepage hero CTA now asserts the **V2** focus ring
  (`--v2-brand` rgb 91,61,245); `/contact` (not migrated) keeps the legacy ring assertion.
- `e2e/layout.spec.ts` — the standard-container token is now sampled from `/about` (the V2 homepage
  uses wide containers throughout); the wide-container check stays on the homepage header.

## 26. Legacy safety (not deleted this phase)

The legacy shared components remain and keep serving their routes: `HonestExpectationsSection` and
`DeliveryModelsSection` on `/about`, `AccountOwnershipSection` on `/account-ownership`,
`CustomerJourneySection` on `/connected-growth`, and `ServicesConstellationSection` /
`OneSystemSection` / `ConnectedGrowthSection` / `GoalBentoSection` / `Hero` / `HeroUniverse` in the
codebase and registry. `unit/v2-homepage-sections` guards these consumers.

## 27. Global bans honored

No migration of `/about`, `/services`, service-category routes, `/pricing`, `/contact`,
`/growth-plan`, `/troubleshooter`, `/connected-growth`, `/account-ownership`, `ServiceDomainTemplate`
or error/status routes. No approved copy rewritten. No client names, testimonials, ratings, measured
outcomes, partner claims, fake dashboards, invented recommendations, prices, timelines or guaranteed
results added. Root body / themeColor / colorScheme not globally flipped. No legacy shared component
deleted. No seed dataset rewritten (honest-expectations was **moved** verbatim, not changed). No
public route URL changed. No deployment. No pull request opened.

## 28. Commits

1. `Phase 2K(1)` — harden delivery type/API + complete Phase 2J test coverage.
2. `Phase 2K(2)` — add GrowthPlanPreview and HomepageHeroSection.
3. `Phase 2K(3)` — add HomepageProblemSection and HomepageGoalRouterSection.
4. `Phase 2K(4)` — add HomepageConnectedSystemSection and anchor bridges.
5. `Phase 2K(5)` — homepage delivery config + HomepageTrustSection.
6. `Phase 2K(6)` — add HomepageLearningSection and migrate the homepage route.
7. `Phase 2K(7)` — homepage previews, token hygiene and unit coverage.
8. `Phase 2K(8)` — this report + full validation + e2e reconciliations.

## 29. Definition of Done

The homepage is the V2 light-first spine: server-rendered H1, no cosmic engine, ~70% light with a
single dark final CTA, every fragment on real content and working without JavaScript, no fabricated
proof, and the four Phase 2J corrections landed. Lint, typecheck, 974 unit tests, the Next build, the
Cloudflare (OpenNext) build and the full 440-test e2e suite all pass. Legacy consumers, seed content
and public URLs are unchanged; no deployment and no pull request. Stops after Phase 2K.
