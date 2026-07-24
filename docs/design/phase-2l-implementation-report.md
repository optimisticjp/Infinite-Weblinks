# V2 Phase 2L — Implementation Report

**Scope:** The brand-story, ownership and connected-growth routes — migrating `/about`,
`/account-ownership` and `/connected-growth` onto V2 and building the reusable V2 blocks they need —
plus four contained Phase 2K corrections. Additive and compatibility-first, on branch
`claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec: `docs/design/v2-design-spec.md`;
principles: `.specify/memory/constitution.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (**1128 unit**),
`npm run build` and `npm run cf:build` all pass. The complete e2e suite ran once as four
deterministic shards — **487/487 passed, zero failures** (§25).

---

## 1. What Phase 2L accomplished

- Completed four Phase 2K corrections: delivery-model fragment targets are now contextual (page-scoped
  to `/how-it-works`); the homepage has direct no-JavaScript e2e coverage; the above-the-fold geometry
  test now checks the complete H1, a full support line and the primary CTA; and the proof-gating report
  now states plainly that proof is deferred.
- Extracted two reusable, composition-only server components — **OwnershipDetails** and
  **HonestExpectationsPanel** — and refactored **HomepageTrustSection** to compose them (unchanged
  homepage output).
- Built **PrincipleCard**, **CustomerJourneyList**, **ConnectedExampleCard** and
  **ConnectedGrowthExamplesSection**.
- Migrated **`/about`**, **`/account-ownership`** and **`/connected-growth`** onto PageHeader + explicit
  V2 surfaces + those blocks, retiring the cosmic hero, glow buttons, node-orbs, InfinityMark, the
  phone-frame strip and the legacy sections from the routes (the shared legacy components stay for the
  section registry).

## 2. Files changed

| Area | Files |
|---|---|
| Delivery correction | `cards/DeliveryModelCard.tsx` (`withFragmentTarget`), `sections/DeliveryModelsExplainerSection.tsx` (`cardFragmentTargets`), `app/(marketing)/page.tsx` + `design-preview/page.tsx` (pass `false`) |
| New building blocks | `routes/OwnershipDetails`, `routes/HonestExpectationsPanel`, `routes/CustomerJourneyList`, `cards/PrincipleCard`, `cards/ConnectedExampleCard`, `sections/ConnectedGrowthExamplesSection` (+ css each) |
| Refactor | `sections/home/HomepageTrustSection.tsx` (+ trimmed css) |
| Migrated routes | `app/(marketing)/about/page.tsx`, `app/(marketing)/account-ownership/page.tsx` (+ css), `app/(marketing)/connected-growth/page.tsx` (+ css) |
| Preview | `app/design-preview/page.tsx` (Phase 2L block) |
| Unit tests | `unit/v2-ownership-honest`, `unit/v2-about-route`, `unit/v2-account-ownership-route`, `unit/v2-customer-journey-list`, `unit/v2-connected-examples` (new); `unit/v2-how-it-works`, `unit/v2-homepage-sections`, `unit/v2-token-hygiene` (extended) |
| E2E tests | `e2e/homepage.spec.ts` (no-JS + above-fold), `e2e/brand-ownership-connected.spec.ts` (new), `e2e/layout.spec.ts` (standard-container sample) |
| Docs | `docs/design/phase-2l-implementation-report.md`; corrections in `phase-2k-implementation-report.md` |

## 3. Phase 2K corrections

- **Delivery fragment target (contextual).** `DeliveryModelCard` gained `withFragmentTarget` (default
  `true`) and `DeliveryModelsExplainerSection` gained `cardFragmentTargets` (default `true`). Callers
  still cannot supply a custom id, and "Our default" is still derived only from `we-do`; the flag only
  toggles the internally-derived `delivery-<key>` id. The homepage, `/about` and the design-preview pass
  `false`; `/how-it-works` keeps all four (the mega-menu links there).
- **Homepage no-JavaScript coverage.** A `test.use({ javaScriptEnabled: false })` block on `/` asserts
  one H1 with the full approved headline, the support copy, both hero CTAs, the ten goal destinations,
  the five connected-system nodes, the three bridges, the four delivery models, ownership, honest
  expectations, Learn, the final CTA, every fragment and fragment navigation — from the server response
  alone.
- **Above-the-fold geometry.** At 390×844 the test now asserts the complete H1 bounding box, at least
  one full support line and the complete primary CTA are inside the viewport, with no overflow, and
  records the measured bounds in the failure context. No approved copy is hidden and the CTA is not
  absolutely positioned over other content.
- **Proof-gating report.** `phase-2k-implementation-report.md` §18 now states that no genuine
  publishable proof exists, the homepage renders no proof section and loads no proof getter, no empty
  placeholder renders, illustrative scenarios are never used as proof, and a verified-proof homepage
  section remains deferred (not dynamically added yet).

## 4. Delivery fragment-target behaviour (final)

`/how-it-works` renders `#delivery-we-do`, `#delivery-we-expert`, `#delivery-we-run`,
`#delivery-you-run` (mega-menu deep links). The homepage and `/about` render the same four delivery
cards with **no** `delivery-*` ids. The design-preview shows the delivery section in its
no-fragment-target configuration, so there are no duplicate delivery ids anywhere.

## 5. Homepage no-JS result

`/` renders its entire spine from the server response with JavaScript disabled — headline, support,
CTAs, ten goal links, five connected-system nodes, three bridges, four delivery models, ownership,
honest expectations, Learn and the final CTA — and all ten fragments resolve. Verified in
`e2e/homepage.spec.ts`.

## 6. Above-the-fold geometry result

At 390×844 the complete H1 (`x∈[0,391]`, fully within `y∈[0,844]`), a full support line and the
complete primary CTA all sit inside the viewport with no horizontal overflow. The measured bounds are
attached to the assertion messages so a regression shows exact geometry.

## 7. OwnershipDetails extraction

`routes/OwnershipDetails` renders the vault Card (label + "Owned and controlled by you" + every asset),
the build flow in source order, every guarantee (H3) and the complete closing statement — from the real
`AccountOwnership` data. No section root, no H1, no CTA, no vault glow, tool constellation, orbit, raw
palette cycling, giant dark panel, NodeOrb or animation; flat IconTiles in mapped V2 tones. Reused by
the homepage trust section and `/account-ownership`.

## 8. HonestExpectationsPanel extraction

`routes/HonestExpectationsPanel` renders "What we won't do" / "What we do promise" from the centralised
`honest-expectations` data (no local arrays), with an optional heading/intro and a configurable column
heading level. No section root, no H1, no NodeOrb, no glowing panel, no gradient heading; meaning is
carried by text and the X/check icons. Reused by the homepage trust section (`columnLevel=4`,
`id="honest"`) and `/about` (`columnLevel=3`, inside its own SectionShell).

## 9. Homepage regression result

`HomepageTrustSection` composes the two blocks and is structurally identical to Phase 2K: same
`id="ownership"`, same H2, same ownership fields, same `#honest` subsection, same heading hierarchy
(H2 → H3 → H4), same order and CTA destinations, and no new client boundary. The homepage e2e (spine
order, fragments, ownership + honest content, axe, overflow) all pass unchanged.

## 10. PrincipleCard design

`cards/PrincipleCard` is a static outlined Card (not a link): a flat IconTile in the mapped V2 tone, the
exact title as its H3 and the exact body. No featured/enlarged state, no NodeOrb, glow, glass, gradient,
fixed height or numeric claim; understandable with CSS disabled. The five approved principles render in
source order, none enlarged.

## 11. About migration

`/about` → PageHeader (server H1 "Your digital growth partner", eyebrow "About us", primary "Build my
growth plan", secondary "See how we work", no InfinityMark aside / NodeOrb / gradient word) →
`#who-we-are` (alt surface, approved copy) → `#principles` (five PrincipleCards, no featured first) →
`#ways-of-working` (DeliveryModelsExplainerSection, ownership strip shown **once here**, no `delivery-*`
ids) → `#honest` (HonestExpectationsPanel) → `#get-started` (the single reserved night FinalCtaSection).
Removes CosmicPageHero, GlowButton, InfinityMark aside, BentoCard/BentoGrid, the legacy
DeliveryModelsSection/HonestExpectationsSection and FinalCtaBannerSection from the route. **Ownership
decision:** the ownership strip is shown once, on the delivery section, because ownership is not
otherwise covered on `/about` (principle four mentions it, but the strip states the no-lock-in promise
concretely).

## 12. Account-ownership migration

`/account-ownership` → PageHeader (server H1 "Your business is built in your name", eyebrow "Owned by
you", the existing lead, primary/secondary CTAs, and a "No lock-in…" trust note; no shield NodeOrb /
gradient word) → a single `#ownership` SectionShell using the real eyebrow/heading/body that composes
OwnershipDetails (no duplicated CTA inside) plus an information Callout on why documented access and
ownership matter when a supplier changes → `#get-started` FinalCtaSection driven by the real
`primaryCta`/`secondaryCta`. Every AccountOwnership field, asset, flow step, guarantee, the closing and
the CTA destinations are retained. Removes CosmicPageHero, GlowButton, the shield NodeOrb and the legacy
AccountOwnershipSection from the route.

## 13. CustomerJourneyList design

`routes/CustomerJourneyList` renders the illustrative customer path as a semantic ordered list of
restrained light cards: a compact sequence marker, a flat IconTile phase marker (mapped V2 tone), the
phase title (H3), the caption, and a clearly-labelled "Illustrative touchpoint" (the generic screen
heading + its lines in source order). Vertical on mobile, two columns on wider screens; no PhoneFrame,
fake device chrome, active item, InfinityMark end marker, horizontal strip, scrollable region, animated
path, price, metric, client logo or result. Understandable with CSS disabled.

## 14. ConnectedExampleCard design

`cards/ConnectedExampleCard` is a static illustrative combination card (not a link): an information
Badge "Illustrative combination", the real goalHint, the title as its H3, the summary and every service
as a static Chip. No false destination affordance, no "See how it works" label, no client name,
testimonial, result or metric, no featured/first-card emphasis, and it never reads the legacy
`theme`/`featured` presentation fields. Mapped V2 tone; no glow/glass/gradient/fixed height.

## 15. Connected-growth migration

`/connected-growth` → PageHeader (server H1 "Simple combinations that compound", a "See the
combinations" → `#examples` CTA, and an "Illustrative examples … not real clients" trust note with an
information Badge; no NodeOrb / gradient word) → `#journey` (alt surface, the existing
eyebrow/heading/intro, a generic-illustrative-path Callout, CustomerJourneyList, a CTA to
`/how-it-works`) → `#examples` (ConnectedGrowthExamplesSection, a prominent "Illustrative examples, not
real clients." Callout, all six examples in source order, no featured first, no data-driven theming, no
false affordance) → `#get-started` FinalCtaSection. All six journey steps + screens and all six examples
+ service labels are retained. Removes CosmicPageHero, GlowButton, NodeOrb, the legacy
CustomerJourneySection (PhoneFrame strip + the horizontal focusable `tabindex` region + InfinityMark)
and ConnectedExamplesSection, and FinalCtaBannerSection from the route.

## 16. Illustrative-content safeguards

`/connected-growth` labels the illustrative nature three ways: a hero Badge ("Illustrative examples")
with "not real clients" text, a journey-section Callout ("a generic, illustrative path … not a real
customer record or a measured case study"), a prominent examples-section Callout ("Illustrative
examples, not real clients."), and a per-card "Illustrative combination" Badge. The legacy `featured`
and `theme` presentation fields are **intentionally ignored** (no enlarged first card, no dark/band
theming). No "See how it works" affordance exists without a real link, and the e2e asserts no Review /
AggregateRating schema and no results/testimonial heading.

## 17. Metadata and structured data preserved

All three routes keep their exact `pageMetadata` (title/description), self-canonical path and
`breadcrumbJsonLd` graph (verified in the route source tests and the `BreadcrumbList` e2e assertion).
Titles, descriptions and URLs are unchanged.

## 18. Fragment results

Every retained fragment resolves exactly once on visible content, works without JavaScript, and — for
mid-page fragments — clears the sticky header (verified with `expectFragmentTargetClearsStickyHeader`):

- `/about`: `about-hero`, `who-we-are`, `principles`, `ways-of-working`, `honest`, `get-started`.
- `/account-ownership`: `ownership-hero`, `ownership`, `get-started`.
- `/connected-growth`: `connected-growth-hero`, `journey`, `examples`, `get-started`.

The `*-hero` ids are the top-of-page PageHeader sections (existence + visibility verified; sticky-header
clearance is not applicable at the very top of the document). No external consumer linked to any
`/about#…`, `/account-ownership#…` or `/connected-growth#…` fragment, and `#examples` is preserved for
the connected-growth hero's own secondary CTA. No obsolete internal-only id was retired (every retained
id carries meaningful content).

## 19. Content-integrity results

All approved copy renders verbatim from the seed/data getters: the five `/about` principles (route-local
const, unchanged) and delivery models; the full `AccountOwnership` graph; the six customer-journey steps
+ screens; the six connected examples + service labels; and the centralised honest-expectations items.
No dataset was rewritten — honest-expectations was *moved* verbatim in Phase 2K and is only *consumed*
here.

## 20. Missing or unresolved content

None. Every field the three routes previously rendered is retained. There is no genuine publishable
client proof in the current seed, so — as before — none of these routes render testimonials, ratings or
measured outcomes; the connected-growth examples remain clearly illustrative.

## 21. Legacy-route safety

`/how-it-works`, `/services`, the service-category routes, `/pricing`, `/contact`, `/growth-plan` and
`/troubleshooter` are unchanged (their e2e specs pass in the full run). The section registry still
imports and maps `AccountOwnershipSection`, `CustomerJourneySection`, `ConnectedExamplesSection`,
`DeliveryModelsSection` and the others, so it compiles; no legacy source file was deleted.
`/services`, `/pricing` and `/starting-points/[slug]` keep `CosmicPageHero` / `FinalCtaBannerSection`
unchanged.

## 22. Client-JavaScript and presentation-cost changes

> **Corrected in Phase 2M (§A.1).** The original wording here was wrong. Each legacy route opened
> with `CosmicPageHero`, whose real dependency chain was `CosmicPageHero → CosmicBackground →
> StarfieldLazy → Starfield`. `CosmicBackground` renders the starfield **by default** (`stars=true`),
> `StarfieldLazy` is a **client-only** boundary (`"use client"`, `next/dynamic` with `ssr:false`),
> and `Starfield` is a **client component that paints a `<canvas>`**. So each old route carried **at
> least one client-only decorative boundary and one canvas** (client-rendered after hydration, which
> is why it never appeared in the prerendered SSR HTML — the earlier "0 canvas" count only measured
> SSR output). `PhoneFrame`, `NodeOrb` and `InfinityMark` *were* themselves server-rendered, but that
> does **not** make the complete old route client-free — the starfield boundary did. This regression
> is pinned by `tests/unit/v2-phase-2l-corrections.test.ts` so the narrative cannot drift while those
> components remain in the repo.

The migrated routes now render **no starfield canvas and no starfield client boundary**; each route
loses at least one client-only decorative boundary and one canvas:

| Aspect | Before | After |
|---|---|---|
| Starfield decorative layer (`CosmicPageHero → CosmicBackground → StarfieldLazy → Starfield`) | one **client-only boundary + one client `<canvas>`** per route | **removed** |
| Full-width dark cosmic surfaces | multiple per route | **one reserved night final CTA** each |
| Glow buttons / node-orbs / InfinityMark decoration (server-rendered) | present | **removed (flat V2)** |
| `/connected-growth` horizontal phone strip with a focusable `tabindex=0` scroll region | present | **replaced by a semantic vertical `<ol>`** (a11y win — no forced-focusable scroller) |
| H1 | server text over an animated starfield background | **server text on a flat light surface** |
| Starfield `<canvas>` on the three routes (client-rendered) | 1 per route | **0** |

Exact JavaScript-byte, LCP and CLS reductions were **not measured** (Lighthouse was not run here; no
invented scores). Structurally, removing the client starfield boundary + canvas and the focusable
scroll region reduces client JS, main-thread and paint work and improves reduced-motion behaviour,
while the H1 stays a server-rendered LCP element.

## 23. Tests actually run

`npm run lint` (0 problems), `npm run typecheck` (pass), `npm run test` (**1128 unit across 41 files**,
0 fail), `npm run build` (pass; `/about`, `/account-ownership`, `/connected-growth` are `○ Static`).

## 24. cf:build result

`npm run cf:build` passes — the OpenNext Cloudflare bundle builds and the worker is saved to
`.open-next/worker.js` (exit 0).

## 25. Complete E2E result (every failure and rerun)

The full suite ran once as four deterministic shards (`--shard=X/4 --workers=4`), each of the 487 tests
executed exactly once:

| Shard | Result |
|---|---|
| `--shard=1/4` | 122 passed |
| `--shard=2/4` | 122 passed |
| `--shard=3/4` | 122 passed |
| `--shard=4/4` | 121 passed |
| **Total** | **487 / 487 passed, 0 failed** |

Failures fixed while building the phase (before the clean run): the new brand spec's "illustrative
combination" count was made unambiguous (count example cards, not nested Badge spans); the container-token
layout guard now samples the standard container from `/design-preview` (the migrated pages use wide
containers throughout); the `/about` and `/account-ownership` legacy-safety unit assertions were updated
to the registry (the routes no longer render the legacy sections); and the homepage delivery unit test
was inverted (no `delivery-*` ids on the homepage). One investigation — the design-preview axe
`link-in-text-block` violation — turned out to be a **stale local `next start` server** holding port 3101
and serving an outdated build with missing CSS chunks; against a fresh server both design-preview axe
tests pass with no code change. No stress or no-JS reruns are merged into the 487 total (the no-JS blocks
run inside the shards, once each).

## 26. Responsive, zoom, no-JS and accessibility results

- **No overflow** at 320 / 360 / 390 / 768 / 1024 / 1160 / 1280 / 1440 px on all three routes (and the
  homepage), via `setViewportAndWaitForStableLayout` + `expectNoHorizontalOverflow`.
- **One H1** per route with the approved text; logical H1 → H2 → H3 → H4 hierarchy.
- **No-JavaScript**: every route renders from the server response. *(Corrected in Phase 2M §A.2:
  the Phase 2L no-JS blocks were strengthened from H1 + first link + fragment presence to
  **directly** assert each route's full content — /about's who-we-are body, five principles, four
  delivery models, eight honest items and CTA destinations; /account-ownership's every asset, flow
  step, guarantee, closing, callout and both CTAs; /connected-growth's six phases, captions, screen
  headings and lines, six examples and every service label — rather than inferring the rest from
  "it's a server component".)*
- **Axe**: 0 serious/critical on `/about`, `/account-ownership`, `/connected-growth`, the homepage and
  both design-preview pages (wcag2a/2aa/21a/21aa/22aa).
- **Reduced motion / adaptive header at 200%**: covered by the existing `reduced-motion` and
  `chrome-adaptive` specs, which pass in the full run.
- **No horizontal customer-journey strip**; long titles, captions and service labels wrap cleanly (a
  long-content case is previewed on `/design-preview`).

## 27. Preview URLs and screenshots

- `/design-preview` — Phase 2L block: PrincipleCard (with a long wrapping title), OwnershipDetails,
  HonestExpectationsPanel, CustomerJourneyList, ConnectedExampleCard (with long content) and
  ConnectedGrowthExamplesSection, plus the delivery section without fragment targets (Phase 2K block).
- `/design-preview/shells` — PageHeader + SectionShell surfaces.
- Both preview pages remain `noindex, nofollow`, off-navigation and off-sitemap. (No screenshots are
  attached; the pages render in any local `npm run start` preview.)

## 28. Known limitations

- Per-route "First Load JS" is not printed by this Next build configuration, so the presentation-cost
  changes in §22 are reported structurally rather than as byte deltas; Lighthouse/LCP/CLS were not run.
- The verified-proof homepage section remains deferred (Phase 2K §A.4) — no route added it.
- The section registry still references the legacy `AccountOwnershipSection` / `CustomerJourneySection` /
  `ConnectedExamplesSection` / `DeliveryModelsSection`; their eventual removal is a later-phase cleanup,
  gated on retiring the registry entries.

## 29. Recommended scope for Phase 2M

> **Corrected in Phase 2M (§A.4).** All **16 current service categories delegate to
> `ServiceDomainTemplate`** (every renderable category has a `DomainConfig`), so migrating the
> category family **requires migrating the shared template** — the two cannot be separated. The
> legacy `PageHero` fallback in `/services/[category]` is unreachable *only while* that one-to-one
> config-coverage invariant holds. Phase 2M therefore covers the **services hub, the category route
> and `ServiceDomainTemplate` together** (not the hub + category routes with the template left out).

Migrate the **service surfaces** as one unit: `/services` (hub), `/services/[category]` and the shared
`ServiceDomainTemplate` onto V2 — replacing `CosmicPageHero` + `FinalCtaBannerSection` + the cosmic
template with PageHeader + V2 cards/sections + FinalCtaSection, and preserving every service, category,
cluster, delivery-model tag, connectsTo/forWho/next relationship, structured-data graph and the 70
service deep-link fragments + folded-service redirects. That is the largest remaining cosmic surface and
reuses the delivery-model components already hardened here. Keep `/pricing`, `/contact`, `/growth-plan`
and `/troubleshooter` out of scope until their own phases, and defer the root colour-scheme flip and any
broad legacy-component / galaxy-engine deletion until every consuming route is migrated.

Stops after Phase 2L. No `/services` migration, root colour-scheme flip, broad legacy-component deletion
or galaxy-engine deletion was begun. No pull request was opened.
