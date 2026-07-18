# Feature Specification — Complete Product & Design Review Implementation

**Feature branch:** `feature/complete-product-review-implementation`
**Status:** Implemented (see traceability matrix for per-requirement status)
**Source of truth:** `docs/reviews/complete-product-design-review.md` (verbatim) + brief; decomposed in `docs/reviews/implementation-traceability.md`.

## Outcome

Convert the product/design review into shipped software that (1) lifts qualified lead generation,
(2) closes the visual gap to the design references as one coherent "living connected universe",
(3) preserves the strong engineering/accessibility/SEO/validation/anti-spam/test foundations, and
(4) stays strictly honest where real proof, pricing, locations, or customer data are unavailable.

## Users

- **Primary:** small-to-mid business owners/founders overwhelmed by digital-tool choices — not marketers, not developers.
- **Secondary:** the site owner/editor (future proof publication, optional CMS activation).

## Functional requirements (grouped)

1. **Conversion & trust:** honest interim trust layer (methodology/how-we-work/ownership) near hero and above final CTA; builder explainer + plan preview; sticky mobile CTA; troubleshooter surfaced as low-friction route; honest budget-band qualification (no invented prices).
2. **Accessibility-safe visual correction:** white-text CTA gradient (`#d1005f→#c94f00`) passing WCAG AA in all states; footer legal touch targets ≥44px.
3. **Homepage compression:** mobile ~12–14 screens (from ~19.5) via de-duplication + mobile spacing + goal scroller, without becoming a thin landing page.
4. **Builder:** 8→6 steps; earlier plan preview; Now/Next/Later prioritised result; deterministic engine + validation + anti-spam preserved.
5. **Content/SEO:** expand `/learn`; section-specific OG images; enrich proof content architecture + honest schema; keep gating/sitemap/schema in agreement (tested).
6. **Reliability/perf/maintainability:** performance budget + guard; 500/error boundary; rate-limit backing review; content-gating + Sanity-activation docs; remove unused `motion` dep.
7. **Living-universe visual + motion:** reusable reduced-motion-gated GSAP/CSS/SVG reveal foundation; restrained section reveals + staggered cards; logo marquee; reference-driven scene upgrades (hero REF-07, goals REF-10, ownership REF-13, services REF-12, journey REF-05, contact REF-02, troubleshooter REF-06, digital-world REF-18, footer REF-19, ways REF-01, starting-points REF-08, examples REF-16, customer-journey REF-15, prioritised plan REF-14).

## Non-functional / constraints (success criteria)

- No horizontal overflow at 360/390/768/1024/1440.
- axe: zero serious/critical regressions; WCAG 2.1 AA; one H1/page; landmarks; visible focus; reduced-motion complete states.
- All motion: reduced-motion gated, complete static fallback, no transient contrast failure, offscreen pause, mobile scale-down.
- Performance: no unbounded bundle regression vs baseline (~180KB first-load JS); richness via SVG/CSS, not raster/video/second runtime.
- Truth: never fabricate clients, logos, testimonials, case studies, metrics, prices, locations, partnerships, awards. Counters only on real values.
- All validation commands green except the forbidden `cf:deploy`.

## Owner decisions & blocked inputs

D-01 proof strategy (fallback interim trust; real proof blocked), D-02 pricing (honest qualification chosen),
D-03 hero = REF-07 (REF-20 not built), D-04 builder = 6 steps, D-05 geography (blocked), D-06 Sanity (documented, not activated).
Blocked real-world inputs: real logos+permission, verified testimonials+attribution, case study+metrics+permission.

## Out of scope (avoid/postpone)

Live Sanity activation, custom DB, auth/user accounts, client portal, custom CMS, blog comments, enterprise infra,
REF-20 alternative homepage, video backgrounds, heavy WebGL, aggressive parallax, meaningful cursor effects,
glass body-copy panels, autoplay semantic carousels, second animation runtime, and all fabricated content.
