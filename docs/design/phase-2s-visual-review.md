# Phase 2S — Visual, Responsive & Accessibility Review

Final review of the converged V2 system against the acceptance contract (Part H). Metrics were
captured from a **production build** (`next build` → `next start`) with the pre-installed Chromium at
**390 / 768 / 1440** across every unique route/template family. To be precise about the evidence: this
was **automated structural acceptance across every representative template family, plus a four-template
visual spot-check** — only four templates (homepage, pricing, starting-point detail, 404) were inspected
by eye at the edge widths. **Complete manual visual certification of every remaining live and gated
template family (and their states) is deferred to Phase 3C** (release certification); this review does
not claim every template received manual visual approval.

**Method.** A Playwright pass loaded each route at all three widths and measured, per page:
`document.body` computed background, `.theme-cosmic` count, `.theme-night` section count, `<canvas>`
count, `main linearGradient|radialGradient` (SVG-gradient decoration) count, `<h1>` count, and
`scrollWidth − clientWidth` (horizontal overflow). Screenshots live under the session scratchpad
(transient browser artifacts — **not committed**); the durable review is this document and the
`tests/e2e/v2-visual-acceptance.spec.ts` + `tests/e2e/status-and-examples.spec.ts` regression specs.

## Acceptance metrics (every template family)

Legend: **bg** = body background · **cosmic/canvas/svcGrad** = must be 0 · **night** = dark sections
(≤1 on ordinary pages) · **h1** = 1 · **ov** = horizontal overflow at 390/768/1440 (must be 0).

| Template | Route | status | bg | cosmic | canvas | svcGrad | night | h1 | ov |
|---|---|---|---|---|---|---|---|---|---|
| homepage | `/` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| goals-hub | `/goals` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| goal-detail | `/goals/launch-professional-store` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| business-type-detail | `/business-types/ecommerce` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| starting-point-detail | `/starting-points/nothing-built-yet` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| services-hub | `/services` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| service-category | `/services/strategy-discovery` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| tools-hub | `/tools` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| tool-detail | `/tools/websites-hosting-performance` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| roadmaps-hub | `/roadmaps` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| roadmap-detail | `/roadmaps/ecommerce` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| learn-hub | `/learn` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| article-detail | `/learn/how-online-growth-works-as-one-system` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| case-study-hub | `/case-studies` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| case-study-detail | `/case-studies/ecommerce-turn-browsers-into-buyers` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| resources | `/resources` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| faq | `/faq` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| pricing | `/pricing` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| how-it-works | `/how-it-works` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| about | `/about` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| connected-growth | `/connected-growth` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| account-ownership | `/account-ownership` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| contact | `/contact` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| growth-plan | `/growth-plan` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| troubleshooter | `/troubleshooter` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| legal (privacy) | `/privacy` | 200 | #fff | 0 | 0 | 0 | **0** | 1 | 0/0/0 |
| 404 | `/<unknown>` | 404 | #fff | 0 | 0 | 0 | **0** | 1 | 0/0/0 |
| design-preview | `/design-preview` | 200 | #fff | 0 | 0 | 0 | 1 | 1 | 0/0/0 |
| design-preview/shells | `/design-preview/shells` | 200 | #fff | 0 | 0 | 0 | 2 | 1 | 0/0/0 |

## Findings

- **Light is the default canvas everywhere** — every route's `<body>` computes to `#ffffff`. No route
  renders a cosmic surface, `<canvas>`, globe/starfield, or `main` SVG-gradient decoration.
- **One intentional night section per ordinary marketing page** — the reserved `FinalCtaSection`.
  Legal and 404 are fully light (0 night), as required for reading/error surfaces.
- **One `<h1>` per page**; **no horizontal overflow** at 390, 768 or 1440 on any route.
- **404 (inspected, 1440 + 390):** calm light panel — a restrained non-luminous InfinityMark, a mono
  "404" label, a single H1, "Back to home" (solid brand) + "Build my growth plan" (secondary), and a
  helpful-links row under a hairline. No cosmic scene, glow or animation. `id="main"` present, so the
  skip link resolves.
- **Homepage (inspected, 390):** light-first hero — eyebrow, slogan, bold H1 with a single accent word
  (violet, not a gradient heading), lead, primary + secondary buttons, reassurance, a "Connected
  across" wayfinding chip row, and the growth-plan card. Mobile source order is useful; the header is a
  light sticky bar, not a horizontal scroller.
- **Pricing (inspected, 1440 full-page):** light/alt alternating bands, premium cards with semantic
  borders and neutral elevation, domain-tinted icon tiles (colour as wayfinding), and exactly one
  reserved dark final-CTA band before the light footer. No glow, glass, gradient heading or featured
  hero tile.
- **Starting-point detail (inspected, 390):** breadcrumb Home → Goals → label, eyebrow, one H1, lead,
  primary + secondary actions, reassurance, then the light-alt recommended-stage band. Clean mobile.

### Intentional exceptions (documented)

- **`/design-preview/shells`** shows **2** night sections — it is the internal, noindex surface
  gallery that deliberately demonstrates the `night` `SectionShell` (and a night bento). Not a public
  marketing page.
- **`/design-preview`** shows 1 night section (a `FinalCtaSection` preview). Internal, noindex.
- Both design-preview routes are off-nav and off-sitemap (review-only).

### Not measured

No LCP / CLS / INP / JavaScript-byte / Lighthouse numbers are claimed — those were not run. The
metrics above are DOM/computed-style facts captured from the production build, not performance scores.

**Result:** the **automated structural acceptance** contract (Part H) passes on every representative
template family; the **manual visual spot-check** covered four templates (homepage, pricing,
starting-point detail, 404) with no fix required. Complete manual visual certification of the remaining
families is **deferred to Phase 3C**. The two design-preview night counts are accepted as
internal-preview exceptions.
