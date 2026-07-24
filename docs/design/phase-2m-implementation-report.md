# V2 Phase 2M — Implementation Report

**Scope:** The V2 services hub + service-domain system — migrating `/services`, `/services/[category]`
(all 16 categories) and the shared `ServiceDomainTemplate` onto V2 — plus five contained Phase 2L
corrections. Additive and compatibility-first, on branch
`claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (**1324 unit**),
`npm run build` and `npm run cf:build` all pass. The complete e2e suite ran once as four deterministic
shards — **553/553 passed, zero failures** (§26).

---

## 1. What Phase 2M accomplished

- Completed five Phase 2L corrections: the client-only starfield dependency chain is documented and
  regression-pinned; the brand-route no-JS coverage now asserts full route content; the homepage
  above-fold test measures a computed line-height; the next-scope statement correctly bundles the
  template with the category family; and the delivery-card conditional-id doc is fixed.
- Proved the service-domain content graph (89 integrity checks) before touching presentation.
- Built **ServiceCategoryCard**, **ServiceOfferingCard**, **ServiceConnectionList**.
- Migrated **`/services`** onto PageHeader + a ServiceCategoryCard grid + FinalCtaSection.
- Rebuilt **`ServiceDomainTemplate`** as a V2 light-first, fully server-rendered template and
  **simplified `/services/[category]`** (removed the unreachable legacy fallback).

## 2. Files changed

| Area | Files |
|---|---|
| Phase 2L corrections | `docs/design/phase-2l-implementation-report.md`, `tests/e2e/homepage.spec.ts`, `tests/e2e/brand-ownership-connected.spec.ts`, `sections/DeliveryModelsExplainerSection.tsx`, `unit/v2-phase-2l-corrections.test.ts` (new) |
| Integrity + config | `lib/services/domains.ts` (`serviceDomainConfigs` export), `unit/v2-service-domain-integrity.test.ts` (new) |
| New components | `cards/ServiceCategoryCard`, `cards/ServiceOfferingCard`, `routes/ServiceConnectionList` (+ css each) |
| Rebuilt template | `routes/ServiceDomainTemplate.tsx` (+ rewritten css) |
| Migrated routes | `app/(marketing)/services/page.tsx` (+ css), `app/(marketing)/services/[category]/page.tsx` (category.module.css removed) |
| Preview | `app/design-preview/page.tsx` (Phase 2M block) |
| Unit tests | `unit/v2-service-category-card`, `unit/v2-service-offering-card`, `unit/v2-service-connection-list`, `unit/v2-services-hub`, `unit/v2-service-domain-template` (new); `unit/v2-token-hygiene` (extended) |
| E2E tests | `e2e/services-system.spec.ts` (new); `e2e/services-domains`, `e2e/services-strategy`, `e2e/routes` (article anchors + helpers) |
| Docs | `docs/design/phase-2m-implementation-report.md` |

## 3. Phase 2L corrections

- **Performance baseline.** The Phase 2L report §22 now states that each legacy brand route opened
  with `CosmicPageHero → CosmicBackground → StarfieldLazy → Starfield`: `CosmicBackground` renders the
  starfield by default, `StarfieldLazy` is a client-only boundary (`"use client"`, `ssr:false`), and
  `Starfield` paints a `<canvas>`. So each old route carried **at least one client-only decorative
  boundary and one canvas** (client-rendered, absent from the SSR HTML the earlier "0 canvas" count
  measured); `PhoneFrame`/`NodeOrb`/`InfinityMark` being server-rendered does not make the old route
  client-free. Exact JS-byte/LCP/CLS reductions were not measured. Pinned by
  `unit/v2-phase-2l-corrections.test.ts`.
- **Brand no-JS coverage.** The three brand routes' no-JS blocks now assert full server content (§5).
- **Above-the-fold geometry.** The homepage support-line check reads the computed line-height
  (resolving `normal` safely) and requires one full line's visible intersection with the viewport —
  no hard-coded pixel guess (§6).
- **Next-scope statement.** Corrected to say all 16 categories delegate to `ServiceDomainTemplate`, so
  Phase 2M covers the hub, category route and template together.
- **Conditional delivery doc.** `DeliveryModelsExplainerSection`'s comment now says the
  `delivery-<key>` ids are conditional on `cardFragmentTargets`.

## 4. Corrected client-JavaScript / canvas baseline

Because the legacy chain lazy-loaded the starfield **client-side**, the honest before/after for the
service routes is a real client-boundary + canvas removal, not just CSS:

| Route(s) | Before | After |
|---|---|---|
| `/services` | `CosmicPageHero` → 1 client starfield boundary + 1 `<canvas>`; glowing `NodeOrb`; `FinalCtaBanner` constellation | **0 canvas, 0 decoration-only client boundary** |
| `/services/[category]` (×16) | `ScrollThread` (client) + **three** `CosmicBackground` starfields (3 client `<canvas>`) + `ConnectorPath` + node-orbs + `MessageCard` fake state | **0 canvas, 0 decoration-only client boundary** |

`services-system.spec.ts` asserts **`canvas` count = 0** on every one of the 17 service routes; the
H1 is server-rendered text and all service content is in the server HTML. Exact byte/LCP/CLS figures
were not measured (Lighthouse not run; no invented numbers).

## 5. Strengthened no-JS results

Every service route renders its full content with JavaScript disabled: `services-system.spec.ts`
loads each of the 16 categories with `javaScriptEnabled:false` and asserts the H1, **every** service
as a visible `article[id]` containing its name, and all six section fragments — 16 no-JS category
tests, once each. The Phase 2L brand no-JS blocks were likewise upgraded from H1 + first link +
fragment presence to full per-route content.

## 6. Correct above-fold line geometry

At 390×844 the homepage test now reads `getComputedStyle(support).lineHeight` (mapping `normal` to
~1.2× font size), computes the paragraph's visible vertical intersection with the viewport, and
requires **≥ one full computed line-height** visible — alongside the complete-H1 and complete-CTA
box checks and the no-overflow check, with all bounds + the line-height recorded in the failure
message.

## 7. Service-domain content-graph integrity

`unit/v2-service-domain-integrity.test.ts` — **89 checks**, all passing, proving before any
presentation change: exactly 16 renderable categories in stable order, each with exactly one
`DomainConfig` (no orphan, no duplicate); 70 renderable services each resolving to a real category
with a canonical delivery key and a unique slug; per-config clusters that resolve, belong to the
category, never duplicate, and cover every category service exactly once (clustered + stable
leftover, none omitted); `serviceCopy` keys that stay in-category; `stageSlug`/`next`/`connectsTo`
that resolve (`next.name` equals the real category name, `connectsTo` tones recognised); every
service `goalSlug` resolving; and exactly 70 unique-source/unique-destination permanent redirects to
real category anchors. No seed/config value was edited to make these pass.

## 8. Services-hub migration

`/services` → PageHeader (server H1 "Everything your business needs, connected around your goals",
eyebrow "Services", primary /growth-plan, a "See all service areas" → `#service-domains` secondary,
and an "Every service shows who does the work." trust note) → SectionShell (`id="service-domains"`,
alt surface, "The full map" eyebrow, "Sixteen connected service areas", a "you don't need to choose
everything" Callout, and a CardGrid of all 16 ServiceCategoryCards with real renderable service
counts, no featured first) → the single reserved dark FinalCtaSection (`id="get-started"`). URL,
metadata, canonical, breadcrumb + ItemList(16) JSON-LD, category order and destinations preserved;
CosmicPageHero, GlowButton, NodeOrb, BentoCard/BentoGrid, the gradient words and FinalCtaBannerSection
removed from the route.

## 9. ServiceCategoryCard design

A whole-card route (Card href mode, one internal link) into a category: a compact order marker, a
flat IconTile, the category name as its H3, the intro, an exact singular/plural service count and a
quiet affordance. Mapped V2 ink; no featured/selected state, NodeOrb, Bento, glow, glass, gradient,
fixed height or horizontal rail; ≤2px hover matched by focus, reduced-motion-safe, long names wrap.
The name/intro/icon/order come from the `ServiceCategory`; the config only tints the wayfinding.

## 10. ServiceOfferingCard design

A static, anchored article (not a link) for one service: a flat category IconTile, the exact
`DeliveryModelBadge` (from the canonical delivery key), the service name as an H4 (the cluster
heading above is an H3), the supplied summary, the complete `whatYouGet` checklist in source order,
and every example tool as a static Chip (omitted entirely when there are none). The root id is
derived from the slug (the fragment target old service URLs redirect to, with sticky-header scroll
margin) and can be turned off with `withFragmentTarget=false` for previews; callers can never supply
a custom id. No price, duration, guarantee, metric, result, NodeOrb, Bento, glow, glass, gradient or
fixed height. The summary uses the preserved `config.serviceCopy?.[slug] ?? plainDescription`
selection — never concatenated or paraphrased.

## 11. ServiceConnectionList design

A semantic ordered list: the current category first, then one item per `connectsTo` entry in source
order, each with a sequence marker, a flat IconTile, an H3 label and its body in the mapped tone. It
renders **no links** (the `connectsTo` data has no verified destination — labels are never turned
into inferred slugs), no connector-only items, no `ConnectorPath`, NodeOrb, SVG animation, fake
progress, percentages, result language, fixed height or horizontal scroll; a neutral CSS-only left
rail conveys direction while the ordered list stays the source of truth.

## 12. ServiceDomainTemplate migration

Same public name; a V2 light-first, fully server-rendered template: PageHeader (§13) → a wrapping
page-jump nav (LinkChips to the five section anchors, ≥44px, not sticky, no tabs/selected/client) →
**Why it matters** (`id="domain-outcomes"`, alt; every outcome as a flat-IconTile card, H3 titles,
no enlarged first) → **the full catalog** (§14) → **How this connects** (`id="domain-connects"`, alt;
ServiceConnectionList) → **the related goals** (§16) → **Who it's for** (`id="domain-forwho"`, light;
`config.forWho` + every `when` item with a check icon) → **What comes next** (§17) → the single
reserved dark FinalCtaSection (`id="get-started"`). Removed: `ScrollThread`, `CosmicBackground`,
`NodeOrb`, `GlowButton`, `BentoCard`/`BentoGrid`, `DELIVERY_COLOR`, `ConnectorPath`, `StageMarker`,
`MessageCard`, the fragment connector list items, the featured-first service treatment and the cosmic
surfaces.

## 13. Active-stage presentation

The PageHeader trust note reads *"Most closely connected to the `{activeStage.name}` stage."* with the
stage name a normal link to `/how-it-works#{config.stageSlug}` — the real mapped stage, resolved and
passed as a prop by the route. It does **not** claim the category belongs exclusively to that stage,
and there is no `StageMarker` timeline or `MessageCard` "Plan mapped" state.

## 14. Service catalog and cluster handling

`id="domain-catalog"`, light. One visible catalog-level clarification renders once before the
groups — *"Example tools are illustrative. No partnership or endorsement is implied."* — never
repeated per card, and no product logos. Then every non-empty cluster in config order (with a stable
"More in this domain" leftover group swept from any unconfigured service, so nothing is dropped): an
H3 cluster heading, the intro, and a `CardGrid` of `ServiceOfferingCard`s (H4 titles). Every service
renders exactly once — proven per category by `services-system.spec.ts` and the template render test.
No featured-first / solo-featured variant, no Bento.

## 15. Delivery-model handling

Each service card shows the exact `DeliveryModelBadge` for its canonical delivery key (label/glyph/ink
from the central `DELIVERY_MODEL_META`, shared with the rest of the V2 delivery presentation). The
legacy `DELIVERY_COLOR` map and the ad-hoc Badge mapping are gone from the template; the route no
longer passes the delivery-model array at all.

## 16. Related-goal handling

`id="domain-goals"` (a landmark named by `ariaLabel`). The resolved, de-duplicated, source-first
goals render in a `RelationshipCard` titled "Goals these services help with" as `LinkChip`s to
`/goals/<slug>`, each carrying the goal's outcome as its accessible name — no featured first goal. An
unresolved goal is simply omitted (and would fail the integrity test); none is invented.

## 17. Next-domain handling

`id="domain-next"`, alt. A real `DomainCard` links to `/services/${config.next.slug}` using
`config.next.name` and the **resolved** next category's real intro and icon (not the duplicated config
name), in the mapped next-domain tone, plus a visible "View all service areas" link back to
`/services`. A `config.next.name` mismatch fails the integrity test.

## 18. Metadata and structured-data preservation

The hub keeps its metadata, self-canonical, breadcrumb and ItemList(16 categories) JSON-LD. Each
category keeps `generateStaticParams`, `generateMetadata`, `notFound`, its self-canonical, and its
breadcrumb + category-level Service + ItemList(services with `#slug`) JSON-LD — unchanged. No
Product/Offer/price/AggregateRating/Review or numeric result was added. `services-system.spec.ts`
verifies the visible content agrees with the ItemList (every service anchor exists and shows its
name).

## 19. Redirect and fragment results

> **Coverage note (corrected in Phase 2N).** The **original Phase 2M** run directly verified: exact
> **308** responses with the exact `Location` header for **all 70** folded URLs (request level); the
> **existence and visibility** of all service articles on every category page; **fragment geometry
> (sticky-header clearance) only on Strategy & Discovery**; a no-JS check of **service names and
> section IDs** on every category (not every service field); and it had **no dedicated no-JS
> Services-hub test**. The exhaustive per-service geometry, full per-category no-JS field oracle,
> `/services` no-JS contract and browser-level redirect-follow were **added in Phase 2N** and are
> reported in the Phase 2N report — they are **not** part of the 553-test total below.

All **70** folded `/services/<service>` URLs return **HTTP 308** with an exact
`Location: /services/<categorySlug>#<service>` (one data-driven request-level test asserting all 70),
and following the redirect lands on the visible service card. Every service is a unique visible
`article[id]` on its category page (verified per category), with sticky-header scroll margin and
working hash navigation without JavaScript. Section fragments preserved: hub
`services-hero/service-domains/get-started`; category
`domain-outcomes/domain-catalog/domain-connects/domain-forwho/domain-next/get-started` + every service
slug (plus a landmark `domain-goals`). In the original Phase 2M run, fragment clearance was verified
for the strategy section + strategy service anchors only; Phase 2N extends it to every section and
every one of the 70 service anchors.

## 20. Content-integrity results

Every category name/intro/icon/order, every service name/summary(`serviceCopy` precedence)/
`whatYouGet`/`exampleTools`/delivery model, all config outcomes/clusters/`connectsTo`/`forWho`/`when`/
`next`, and the related goals render verbatim from the seed and config. No seed/config value was
rewritten; the only content-layer addition is the `serviceDomainConfigs` export (a list of the
existing configs, no definition change).

## 21. Missing or unresolved relationships

None. The 89 integrity checks pass: all 16 configs, 70 services, every cluster/`serviceCopy`/`stage`/
`next`/`connectsTo`/`goalSlug` and all 70 redirects resolve. No leftover "More in this domain" group
is currently needed (every service is placed in a configured cluster), but the stable sweep remains
so a future unconfigured service can never be dropped.

## 22. Legacy-route safety

`/` , `/how-it-works`, `/about`, `/account-ownership`, `/connected-growth`, `/pricing`, `/contact`,
`/growth-plan` and `/troubleshooter` are unchanged (their e2e specs pass in the full run). No legacy
component was deleted: `CosmicPageHero`, `PageHero`, `CosmicBackground`, `ScrollThread`, `StageMarker`,
`ConnectorPath`, `NodeOrb`, `GlowButton`, `BentoCard`/`BentoGrid` and `FinalCtaBannerSection` remain;
`/pricing` still uses the cosmic hero + banner; `DELIVERY_COLOR` is still exported. Only the dead
route-local `category.module.css` (orphaned by removing the fallback) was removed. No unrelated
service content or redirect changed.

## 23. Client-JavaScript, canvas and presentation-cost changes

Structurally recorded (no invented byte/LCP/CLS/Lighthouse figures — Lighthouse was not run):

- **Canvas count on `/services` + 16 category routes: measured 0 after** (asserted per route); the
  legacy routes lazy-loaded 1 (hub) / 3 (each category) client starfield canvases.
- **Decoration-only client boundaries removed:** `StarfieldLazy` (hub + every category) and
  `ScrollThread` (every category) — the routes introduce **no** client component for decoration.
- **All service content is in the server HTML;** no JS is required to reveal any service, and the H1
  is server-rendered on every route.
- No new dependency, no new external host, and no layout-shifting visual insertion.
- Build: `/services` is `○ Static`; every `/services/[category]` prerenders via `generateStaticParams`.

## 24. Tests actually run

`npm run lint` (0 problems), `npm run typecheck` (pass), `npm run test` (**1324 unit across 48
files**, 0 fail), `npm run build` (pass; `/services` + all 16 category pages prerendered).

## 25. cf:build result

`npm run cf:build` passes — the OpenNext Cloudflare bundle builds and the worker is saved to
`.open-next/worker.js` (exit 0).

## 26. Complete E2E result (every failure and rerun)

The full suite ran once as four deterministic shards (`--shard=X/4 --workers=4`), each of the 553
tests executed exactly once:

| Shard | Result |
|---|---|
| `--shard=1/4` | 139 passed |
| `--shard=2/4` | 138 passed |
| `--shard=3/4` | 138 passed |
| `--shard=4/4` | 138 passed |
| **Total** | **553 / 553 passed, 0 failed** |

Failures fixed while building the phase (before the clean run): the `routes` / `services-domains` /
`services-strategy` specs asserted the service anchor was an `li[id]` — updated to the visible
`article[id]` (the semantic requirement, per §I) plus a no-canvas assertion; and `services-strategy`
replaced its immediate `setViewportSize` + inline overflow read with
`setViewportAndWaitForStableLayout` + `expectNoHorizontalOverflow`. No stress or no-JS reruns are
merged into the 553 total (the no-JS category blocks run inside the shards, once each).

> **This 553-test total is the original Phase 2M run.** The Phase 2N correction pass rewrote
> `services-system.spec.ts` to add exhaustive per-service fragment geometry, a full per-category
> no-JS content oracle, a dedicated `/services` no-JS contract and browser-level redirect-follow for
> all 70 services. Those tests are counted in the **Phase 2N** report's E2E total, never folded back
> into this 553.

## 27. Responsive, zoom, no-JS and accessibility results

- **No overflow**: every category at 360 + 1440; the representative smallest / largest /
  longest-content areas at all eight widths (320–1440); the hub across all widths — via
  `setViewportAndWaitForStableLayout` + `expectNoHorizontalOverflow`.
- **One H1** per route (the category name / the hub headline); logical H1 → H2 → H3 → H4 hierarchy
  (cluster H3 → service H4).
- **No canvas** on any service route; no horizontal service catalogue; no hidden service content.
- **No-JavaScript** (original Phase 2M): every category renders its **service names + section
  fragments** from the server. The full per-field no-JS oracle (outcomes, cluster intros, delivery
  labels, `whatYouGet`, tools, `connectsTo` bodies, related-goal links, `forWho`/`when`, next
  destination, CTA destinations) and the `/services` hub no-JS contract were added in **Phase 2N**.
- **Axe**: 0 serious/critical on `/services`, all 16 category pages, the homepage, the brand routes
  and both design-preview pages (wcag2a/2aa/21a/21aa/22aa).
- **≥44px targets, visible focus, hover/focus parity, reduced motion, adaptive header at 200%**:
  covered by the shared primitives (LinkChip/Card/Button) and the existing `reduced-motion` /
  `chrome-adaptive` specs, which pass in the full run. Long service names and tool chips wrap (a
  long-content case is previewed on `/design-preview`).

## 28. Preview URLs and screenshots

- `/design-preview` — Phase 2M block: ServiceCategoryCard (with a long-title case), ServiceOfferingCard
  with a delivery badge / whatYouGet / example tools and a no-tools variant (both
  `withFragmentTarget={false}` so no production service fragment id leaks), a complete cluster, a
  service-outcome card, the ServiceConnectionList, the next-domain DomainCard and the service page-jump
  nav — all on real seed/config content.
- `/design-preview/shells` — PageHeader + SectionShell surfaces.
- Both preview pages remain `noindex, nofollow`, off-navigation and off-sitemap. (No screenshots
  attached; the pages render in any local `npm run start` preview.)

## 29. Known limitations

- Per-route "First Load JS" is not printed by this Next build configuration, so §23's presentation-cost
  changes are reported structurally (canvas/client-boundary counts) rather than as byte deltas;
  Lighthouse/LCP/CLS were not run.
- The `connectsTo` entries carry no destination slug, so the "How this connects" list is intentionally
  link-free (labels are not turned into inferred routes) — a future data addition could make selected
  entries real links.
- The legacy cosmic components remain in the repo for `/pricing`, `/starting-points/[slug]` and the
  section registry; their eventual removal is gated on migrating every remaining consumer.

## 30. Recommended scope for Phase 2N

Migrate the **conversion routes** next — start with **`/pricing`**, the last route still using
`CosmicPageHero` + `FinalCtaBannerSection` for a mostly-static page, replacing them with PageHeader +
FinalCtaSection and moving the pricing/FAQ content onto V2 cards/sections while preserving every
plan, delivery-model tag and FAQ entry (and inventing no price the seed doesn't already state). Then
`/contact` (PageHeader + the existing V2 ContactForm on a light surface, preserving the Zod schema,
rate-limiting and Turnstile) and `/growth-plan` (PageHeader shell around the existing client builder,
keeping its state machine untouched). Keep `/troubleshooter`, the root colour-scheme flip and any
broad legacy-component / galaxy-engine deletion out of scope until their own phases — the cosmic
components still have live consumers until every route is migrated.

Stops after Phase 2M. No `/pricing`, `/contact`, `/growth-plan` or `/troubleshooter` migration, root
colour-scheme flip, broad legacy-component deletion or galaxy-engine deletion was begun. No pull
request was opened.
