# V2 Phase 2N — Implementation Report

**Scope:** the V2 pricing & quoting experience — migrate exactly `/pricing` — plus the contained
Phase 2M verification corrections. Branch `claude/infinite-weblinks-v2-design-yb1yi3`. Light-first
Stripe/Clay system. No conversion route other than `/pricing` was migrated; `/contact`,
`/growth-plan`, `/troubleshooter`, their forms/APIs/schemas/state, the starting-point detail routes
and the error/status routes are untouched. No root colour-scheme flip, no legacy-component deletion,
no deploy, no PR.

---

## 1. What Phase 2N accomplished

- **Completed the Phase 2M verification corrections**: exhaustive per-service fragment geometry (all
  70 + every section fragment, per category), a full per-category no-JS content oracle, a dedicated
  `/services` no-JS contract, browser-level follow-through of all 70 folded-service redirects, and an
  accuracy correction to the Phase 2M report.
- **Centralised the pricing content** into a typed, server-safe module with an exhaustive delivery
  cost-note map and integrity coverage.
- **Built five V2 pricing components** — `PricingFactorCard`, `PricingDeliveryCard`,
  `EngagementShapeCard`, `QuoteProcessList`, `PricingFaqList`.
- **Migrated `/pricing`** off the cosmic hero + Bento + banner onto PageHeader + light `SectionShell`s
  + the new cards + the single reserved-night `FinalCtaSection`, preserving every URL, metadata,
  canonical, JSON-LD graph, fragment id, delivery model, FAQ and CTA destination, and inventing no
  price.
- Updated `/design-preview`, extended token-hygiene, added the route/structured-data/legacy-safety
  contracts and a full pricing E2E/axe/no-JS/responsive spec.

## 2. Files changed

**New — components (`src/components/`):**
`cards/PricingFactorCard.tsx` + `.module.css`, `cards/PricingDeliveryCard.tsx` + `.module.css`,
`cards/EngagementShapeCard.tsx` + `.module.css`, `routes/QuoteProcessList.tsx` + `.module.css`,
`routes/PricingFaqList.tsx` + `.module.css`.

**New — content:** `src/lib/content/data/pricing.ts` (exported from the data barrel).

**New — tests:** `tests/unit/v2-pricing-content.test.ts`, `tests/unit/v2-pricing-factor-card.test.tsx`,
`tests/unit/v2-pricing-delivery-card.test.tsx`, `tests/unit/v2-pricing-blocks.test.tsx`,
`tests/unit/v2-pricing-route.test.tsx`, `tests/e2e/pricing.spec.ts`.

**Rewritten / edited:** `src/app/(marketing)/pricing/page.tsx` + `pricing.module.css` (migrated);
`src/lib/content/data/index.ts` (barrel export); `src/app/design-preview/page.tsx` (Phase 2N block);
`tests/e2e/services-system.spec.ts` (rewritten — the Phase 2M corrections);
`tests/unit/v2-token-hygiene.test.ts` (+6 modules); `tests/unit/v2-service-domain-template.test.tsx`
(legacy-safety re-pointed to `/starting-points/[slug]`);
`docs/design/phase-2m-implementation-report.md` (coverage-accuracy corrections).

## 3. Phase 2M verification corrections

The Phase 2M report now records precisely what the **original** 2M run verified (308s for all 70,
article existence/visibility, geometry only on Strategy & Discovery, no-JS service names + section
IDs, no dedicated Services-hub no-JS test) and that the exhaustive coverage below is Phase 2N — the
original 553-test total is never conflated with the new tests.

`services-system.spec.ts` was rewritten to drive everything from the seed + domain-config oracle:

- **Every service fragment's geometry** — for every category, every section fragment AND every one of
  the category's service slugs is navigated to (real hash navigation on the reused server) and asserted
  to clear the sticky header via `expectFragmentTargetClearsStickyHeader`, with ID uniqueness checked
  first and the route + fragment in every failure message. No fixed sleeps, no weakened threshold, no
  reliance on scroll-padding (the helper measures the rendered top edge).
- **Full per-category no-JS content** — with JavaScript disabled, every category asserts one H1, the
  active-stage name + `/how-it-works#<stage>` link, every outcome title + body, every configured cluster
  heading + intro, every service title, the selected service's summary via the exact `serviceCopy`
  precedence, the exact `DeliveryModelBadge` label, every `whatYouGet` item and example tool, the
  catalog non-endorsement clarification, every `connectsTo` label + body, every related-goal title +
  `/goals/<slug>` link, `config.forWho`, every `config.when` item, the resolved next-category name +
  `/services/<next>` link, the final-CTA destinations, and every section + service fragment.
- **`/services` no-JS contract** — one H1, the approved lead + trust note, both PageHeader CTA
  destinations, all 16 category links in source order, real singular/plural counts, the three hub
  fragments and the final-CTA destinations.
- **Redirect follow-through** — the request-level 308 + exact-Location test is kept; additionally every
  one of the 70 old `/services/<service>` URLs is followed in a real browser to its final pathname +
  hash, the visible `article[id]` matching the slug, the real name + selected summary, and header
  clearance.

## 4. Complete 70-service fragment-geometry result

All 70 service fragments + all section fragments (`domain-outcomes`, `domain-catalog`,
`domain-connects`, `domain-forwho`, `domain-next`, `domain-goals` where present, `get-started`) clear
the sticky header on their real category pages — 16 per-category geometry tests, green. (See §24 for
the sharded totals.)

## 5. Complete service no-JS result

All 16 per-category no-JS oracle tests pass — every service area's content renders from the server
response with JavaScript disabled — plus the `/services` hub no-JS contract. No no-JS-only production
markup was added; this is the same server HTML the JS build hydrates.

> **Coverage note (corrected in Phase 2O).** The Phase 2N no-JS test asserted every service **title**
> plus the full field depth (summary via `serviceCopy` precedence, delivery label, `whatYouGet`,
> tools) for **one selected service** per category. Phase 2O extended it to the **genuinely
> per-service** oracle — every one of the 70 services checks all those fields inside its own article,
> in source order — looping within the same per-category no-JS test (no extra server boots). That
> extension is counted in the Phase 2O e2e total, not the Phase 2N total below.

## 6. Complete redirect-follow result

All 70 folded-service URLs, grouped into 16 per-category browser-follow tests, land on
`/services/<category>#<service>` with the exact visible, header-cleared article — not a representative
sample. The request-level 308 + Location test still asserts all 70.

## 7. Pricing content centralisation

`src/lib/content/data/pricing.ts` holds the **five repeated pricing datasets** verbatim as typed
exports: `pricingFactors` (6), `pricingDeliveryCostNotes`, `pricingEngagementShapes` (3),
`pricingQuoteSteps` (4), `pricingFaqs` (5). Route-level hero, page-jump navigation, section framing
(eyebrows/titles/leads), explanatory prose and CTA copy remain route-local — they are one-off, not
repeated data — and **no route-local pricing data array remains**. The delivery cost notes are an
**exhaustive `Record<DeliveryModelKey, string>`** — all four canonical keys required, an absent key is
a typecheck error, no fallback to a model's own `description`; engagement-shape notes are a fixed
`"Quoted to scope" | "Monthly, quoted to scope"` union. `v2-pricing-content.test.ts` locks the counts,
source order, exact copy, exhaustiveness, no-fallback, and that no **numeric** price, rate, range or
duration appears — while approved **qualitative** duration language ("a few minutes") is preserved.

> **Correction (Phase 2O).** Phase 2O removed `PricingDeliveryCard`'s independent `costNote` prop so
> the card **derives** its note from `pricingDeliveryCostNotes[modelKey]` internally (a caller can no
> longer pair a model with another model's note), and typed `EngagementShapeCard`'s `note` as the
> exported `EngagementShapeNote` union. The visible /pricing and preview output is unchanged.

## 8. PricingFactorCard design

Static `article` Card (not a link, no button): flat IconTile, title as H3, body verbatim, `tone`
mapped through the domain-colour bridge to an accessible V2 ink. No featured/first-card emphasis, no
fragment id, no rank/weighting, no price/numeric estimate, no NodeOrb/Bento/glow/glass/gradient, no
fixed height. Understandable with CSS disabled.

## 9. PricingDeliveryCard design

Static Card whose exact label, glyph and accessible ink come solely from the central
`deliveryModelMeta` (no `DELIVERY_COLOR`, no second icon/label map): flat IconTile, the model name as
its H3 (the textual delivery identification), the real tagline, the exact cost note. No `delivery-*`
fragment id, no `Our default`/`popular`/`best value`/`recommended` marker, no fabricated price, no
featured-first emphasis. Pricing explains cost *shape*, not model choice.

## 10. EngagementShapeCard design

Static Card: flat IconTile, title as H3, body verbatim, and an **information Badge** carrying the exact
"quoted to scope" note. No link, no package/tier/plan-selection semantics, no comparison-table layout,
no price/duration, no popularity/recommendation, no featured state, no glow/glass/gradient; long text
wraps.

## 11. QuoteProcessList design

Semantic `<ol>` of the four steps in source order: a compact decorative step number (the list carries
the real order), the step title as H3, the exact blurb, in restrained neutral panels that reflow
1-col → 2-col with no horizontal scroll. No fake progress/completion, no invented duration, no selected
step, no buttons, no client state, no giant nodes, no glow, no animation.

## 12. PricingFaqList design

Semantic `<dl>` — one `<div>` per FAQ, `<dt>` question, `<dd>` answer — all five in source order, every
answer server-rendered and always visible. No accordion, no search, no client state, no duplicated FAQ
data. The caller passes the same exported `pricingFaqs` array it hands to `faqJsonLd`, so the visible
copy and the structured data can never diverge.

## 13. Pricing route migration

`CosmicPageHero` → `PageHeader` (id `pricing-hero`, light, "How pricing works" as plain server H1 =
LCP, breadcrumb "How pricing works", eyebrow "Pricing", the existing hero lead, primary /growth-plan
"Build my growth plan", secondary /contact "Talk it through", trust note "A clear written quote before
any work starts."). A wrapping, non-sticky page-jump nav (six LinkChips) follows. Then: `why-quotes`
(alt) with the full body paragraph + a written-quote Callout; `what-shapes-a-quote` (light) →
PricingFactorCard grid; `delivery-cost` (alt) → PricingDeliveryCard grid + the preserved
`/how-it-works#delivery-we-do` link; `engagement-shapes` (light) → EngagementShapeCard grid;
`how-to-get-a-quote` (alt) → QuoteProcessList; `pricing-faq` (light) → PricingFaqList;
`FinalCtaBannerSection` → the single reserved-night `FinalCtaSection` (`get-started`, /growth-plan +
/contact). All content reads from the centralised module. Route stays `○ Static`.

## 14. Delivery-model pricing treatment

Four PricingDeliveryCards, one per delivery model in source order, each showing the canonical label +
glyph + ink and the exact cost note (`pricingDeliveryCostNotes[model.key]`, exhaustive — no fallback).
No `delivery-*` ids are emitted on `/pricing` (those anchors belong to `/how-it-works`), no
`DELIVERY_COLOR`, no "Our default", no featured-first model, no price.

## 15. Engagement-shape treatment

Three EngagementShapeCards in source order, each with its exact "Quoted to scope" / "Monthly, quoted to
scope" information Badge. Presented as shapes, never as packages, plans or selectable tiers; no
comparison table, no featured-first shape, no price.

## 16. FAQ and structured-data preservation

`breadcrumbJsonLd` and `faqJsonLd(pricingFaqs)` are unchanged. The FAQPage node emits exactly the five
visible FAQs, once each, in source order, with question/answer text identical to the visible `<dl>`
(same array). No `Product`, `Offer`, `AggregateOffer`, `price`, `priceCurrency`, `Review` or
`AggregateRating` was added; canonical stays `/pricing`. Verified by `v2-pricing-route.test.tsx`.

## 17. Pricing fragment results

All eight fragments — `pricing-hero`, `why-quotes`, `what-shapes-a-quote`, `delivery-cost`,
`engagement-shapes`, `how-to-get-a-quote`, `pricing-faq`, `get-started` — appear exactly once, in
source order, each with visible meaningful content, clearing the sticky header on hash navigation and
working without JavaScript. No `delivery-*` fragment is created on `/pricing`.

## 18. Content-integrity results

Every factor, delivery note, engagement shape, quote step and FAQ renders verbatim from the centralised
module; the counts (6/4/3/4/5), source order and exact copy are locked by the integrity test. No
currency figure or numeric price anywhere. No route-local pricing array remains.

## 19. Missing or unresolved content

None. All approved pricing copy was preserved verbatim; nothing was invented. The only editorial
addition is the written-quote Callout in `why-quotes`, grounded entirely in existing page copy (a
written quote with the scope spelled out, before anything starts).

## 20. Legacy-route safety

`/contact` (+ `ContactForm`, the contact API route, the Zod validation schema, rate-limiting,
Turnstile), `/growth-plan` (+ `PlanBuilder`, the growth-plan engine + rules), `/troubleshooter` (+
`GrowthTroubleshooter`) and the service routes are untouched and present. No legacy source component
was deleted: `CosmicPageHero`, `PageHero`, `CosmicBackground`, `NodeOrb`, `GlowButton`, `BentoCard`,
`BentoGrid` and `FinalCtaBannerSection` all remain (`/starting-points/[slug]` still uses the cosmic
hero + banner), and `DELIVERY_COLOR` is still exported. Verified by the legacy-safety test.

## 21. Client-JavaScript, canvas and presentation-cost changes

Recorded structurally (no invented byte/LCP/CLS/Lighthouse figures):

| | Before (`/pricing`) | After (`/pricing`) |
|---|---|---|
| Canvas elements | 1 (lazy client `Starfield` `<canvas>`) | **0** (asserted in E2E) |
| Decoration-only client boundaries | `StarfieldLazy` (`ssr:false`) via `CosmicPageHero` → `CosmicBackground` | **0** |
| Client CTA | `GlowButton` (client) | server-rendered `Button` links |
| Pricing + FAQ content in server HTML | yes | yes (no JS needed to reveal answers) |
| Layout-shifting visual insertion | starfield paints post-hydration | none |
| New dependency / external host | — | none |
| Route build output | `○ Static` | `○ Static` |

Lighthouse was not run in this environment; no LCP/CLS/byte figures are invented.

## 22. Tests actually run

`npm run lint` (0 problems), `npm run typecheck` (pass), `npm run test` (**1449 unit across 53 files**,
0 fail), `npm run build` (pass; `/pricing` `○ Static`), `npm run cf:build` (pass; worker saved to
`.open-next/worker.js`). E2E below.

## 23. cf:build result

`npm run cf:build` passes — the OpenNext Cloudflare bundle builds and the worker is saved to
`.open-next/worker.js` (exit 0).

## 24. Complete E2E result (every failure and rerun)

The full Playwright + axe suite ran once as four deterministic shards (`--shard=X/4 --workers=4`),
each test executed exactly once:

| Shard | Command | Result |
|---|---|---|
| 1 | `npx playwright test --shard=1/4 --workers=4` | 151 passed |
| 2 | `npx playwright test --shard=2/4 --workers=4` | 150 passed |
| 3 | `npx playwright test --shard=3/4 --workers=4` | 150 passed |
| 4 | `npx playwright test --shard=4/4 --workers=4` | 150 passed |
| **Total** | | **601 / 601 passed, 0 failed, 0 flaky** |

This total includes the rewritten `services-system.spec.ts` (the exhaustive Phase 2M corrections —
per-service geometry, full no-JS oracle, `/services` no-JS, 70-redirect follow) and the new
`pricing.spec.ts` (16). It is a separate run from the Phase 2M report's 553 total.

Targeted rerun during development: the first draft of the rewritten `services-system` geometry test
drove fragments by setting `window.location.hash` in-page; Chromium did not reliably re-scroll, so 16
category geometry tests failed. Switching to a real hash navigation (`about:blank` + `goto("…#id")` on
the reused server, still one web server, no fixed sleeps, threshold unchanged) fixed all 16 — confirmed
by a targeted rerun (16/16) before the clean full run. That rerun is not merged into the totals above.

## 25. Responsive, zoom, no-JS and accessibility results

- **No overflow**: `/pricing` at all eight widths (320/360/390/768/1024/1160/1280/1440) via
  `setViewportAndWaitForStableLayout` + `expectNoHorizontalOverflow`; the service routes at their
  breakpoints as before.
- **One H1** on `/pricing` ("How pricing works"); heading hierarchy never jumps more than one level
  (H1 → H2 sections → H3 cards; FAQ uses `<dt>`, not a heading).
- **No canvas** and **no horizontal card rail** on `/pricing`; the FAQ answers and all pricing content
  are visible without interaction and without JavaScript.
- **Fragment clearance**: every mid-page pricing fragment clears the sticky header.
- **Reduced motion + 200% text**: `/pricing` renders one H1 and holds its width with `reducedMotion:
  reduce` and with the root text scaled to 200%.
- **Focus**: the first jump chip shows a visible focus indicator (shared LinkChip/Button focus ring).
- **Axe**: 0 serious/critical on `/pricing` (wcag2a/2aa/21a/21aa/22aa); the services routes, homepage,
  brand routes and both design-preview pages stay green in the full run.

## 26. Preview URLs and screenshots

- `/design-preview` — Phase 2N block: `PricingFactorCard` (with a long-copy case), all four
  `PricingDeliveryCard`s, all three `EngagementShapeCard`s, `QuoteProcessList`, `PricingFaqList` and the
  pricing page-jump nav — all on the real exported pricing content. Still `noindex, nofollow`,
  off-navigation, off-sitemap, one H1.
- No screenshots attached; the pages render in any local `npm run start` preview.

## 27. Known limitations

- Per-route "First Load JS" is not printed by this Next build configuration, so §21's presentation-cost
  changes are structural (canvas/client-boundary counts), not byte deltas; Lighthouse/LCP/CLS were not
  run.
- The pricing tone tokens still enter as legacy `--domain-*` values in TypeScript content and are mapped
  through the domain bridge at presentation time (the intended migration-bridge behaviour); the bridge
  can be retired once the seeds are re-authored with V2 tokens.
- The legacy cosmic components remain for `/pricing`'s former siblings — `/starting-points/[slug]` and
  the section registry — until their own phases.

## 28. Recommended scope for Phase 2O

**`/contact` only.** Replace `CosmicPageHero` + banner with `PageHeader` + `FinalCtaSection` on a
light surface, keeping the **existing `ContactForm` component, the `/api/forms/contact` route contract,
the Zod validation schema, the rate-limiting (Cloudflare rule + in-memory fallback), the Turnstile
behaviour, the goal-prefill query parameter and the support-email fallback** entirely intact — a
presentation migration around an unchanged form. Keep `/growth-plan`, `/troubleshooter`, the
starting-point detail migration, the root colour-scheme flip, and any broad legacy-component /
galaxy-engine deletion out of scope until their own phases.
