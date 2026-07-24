# Phase 3C — Durable Visual & Accessibility Certification

A reproducible, evidence-backed certification of the production build across every template family,
at mobile / tablet / desktop, with the specific release checks Phase 3C §D requires. It complements
(does not replace) the automated Playwright + axe e2e suite, which runs in CI.

- **Build under test:** `npm run build` (Next.js 16.2.11, webpack), served by `next start` on `:3120`.
- **Mode:** `APP_ENV=development`, `FORMS_ALLOW_INSECURE_BYPASS=true` so forms render in their
  exercisable state (Turnstile dev-bypass → the truthful "verification unavailable" skip-note + support
  mailto). Visual layout is identical to production; only form submit-behaviour differs.
- **Inspector:** automated Playwright (Chromium 1194) + `@axe-core/playwright`, driven by a scripted
  sweep, with element-level analysis of every flagged metric by the release engineer (Claude Code).
  The curated screenshot set is included for human sign-off.
- **Viewports:** 390 (mobile), 768 (tablet), 1440 (desktop). Reflow additionally tested at 320 & 360.
- **Motion:** the whole sweep ran under `prefers-reduced-motion: reduce`; every route rendered cleanly.
- **Evidence:** `docs/release/phase-3c-visual/manifest.json` (per-route/per-viewport results),
  `reflow-320-360.json`, `text-zoom-200-faithful.json`, and the curated JPEG screenshot set in the
  same directory.

## Template families covered (28 routes)

homepage · goals-hub · goal-detail · business-type-detail · starting-point-detail · services-hub ·
service-category (ServiceDomainTemplate) · tools-hub · tool-detail · roadmaps-hub · roadmap-detail ·
learn-hub · article-detail · case-study-hub · scenario-detail · resources · faq · pricing ·
how-it-works · about · connected-growth · account-ownership · contact (form) · growth-plan (interactive) ·
troubleshooter (interactive) · legal (privacy + terms via LegalPageView) · 404 status surface.

## Results

| Dimension                            | Method                                                                                                   | Result                                                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Horizontal overflow** (100% text)  | scrollWidth vs clientWidth at 390/768/1440, all routes                                                   | **PASS — 0 overflow** anywhere                                                                                       |
| **WCAG 1.4.10 Reflow**               | real narrow viewport at **320 & 360 px**, all routes; assert no 2D scroll + no unclipped content crosser | **PASS — 54/54**                                                                                                     |
| **WCAG 1.4.4 Resize text (200%)**    | root font 200% + real resize + settle; assert page content reflows, page not horizontally scrollable     | **PASS** — content: 0 crossers, `canScrollX:false` on all 27 routes (see note)                                       |
| **One `<h1>` per page**              | count `h1` at every viewport                                                                             | **PASS — exactly 1** on every route                                                                                  |
| **Axe (WCAG 2.0/2.1 A + AA)**        | `@axe-core/playwright` at 390 + 1440, all routes                                                         | **PASS — 0 serious/critical** violations                                                                             |
| **No cosmic/starfield/globe legacy** | scan for canvas / cosmic / starfield / globe / glow / node-orb decoration                                | **PASS** — 0 (the only `globe` matches are 18–24 px lucide **icons**, not backgrounds)                               |
| **No proof leak**                    | `/examples` gate + `/case-studies` disclaimer                                                            | **PASS** — `/examples` **404s**; `/case-studies` shows "illustrative example, not a real client" + "No client names" |
| **Truthful form messaging**          | `/contact` + `/growth-plan`                                                                              | **PASS** — support `mailto:` present, consent copy present, **no fake success on load**                              |
| **Keyboard entry**                   | first `Tab` on homepage                                                                                  | **PASS** — lands on "Skip to main content" → `#main`                                                                 |
| **Reduced motion**                   | whole sweep under `reduce`                                                                               | **PASS** — all routes render                                                                                         |
| **Status codes**                     | every route                                                                                              | **PASS** — all 200; bogus path 404                                                                                   |

## Note on the 200%-text metric (investigated in depth, non-user-facing)

A raw synthetic check (`html{font-size:200%}` then read `scrollWidth`) flagged an inflated `scrollWidth`
on 10 routes (e.g. `/privacy` 493 vs 390). This was investigated element-by-element and is **not** a
real overflow:

- On **every** route, **zero page-content elements** cross the viewport at 200% text
  (`nonHeaderCrossers = 0`), and the page is **not horizontally scrollable** (`canScrollX = false`).
- The only elements whose layout box crosses the viewport are inside `<header>`: the adaptive header's
  **offscreen, `aria-hidden`, `inert` measurement probes** (`SiteHeader_probeRow`), which are clipped by
  `overflow:hidden` and never paint or scroll. They inflate the `scrollWidth` **reading** without
  producing a scrollbar or losing content.
- The artifact only appears under synthetic font injection, which perturbs the header's `ResizeObserver`
  without a real resize. **Real browser zoom fires a resize**, the header settles to compact, and the
  reading is clean — confirmed by the faithful 320/360 px reflow test (54/54 pass).

Conclusion: WCAG 1.4.4 / 1.4.10 pass. No code change is warranted; altering the adaptive header to chip
a non-user-facing measurement number would risk regressing a working component for no real benefit. The
raw and faithful readings are both recorded in `text-zoom-200-faithful.json` for transparency.

## Fixes applied in §D

**None required.** The production build passed every user-facing dimension; the single flagged metric was
proven to be a measurement artifact, not a defect. (Phase 3C §A already removed the stale header/legal
"canary" comments.)

## Curated screenshot set

`docs/release/phase-3c-visual/*.jpg` — mobile (390) + desktop (1440) full-page captures of the
representative template families, plus four interactive states: mobile-nav open, contact validation
errors, a growth-plan builder step, and a troubleshooter selection. Provided for human sign-off; the
checks above are machine-verified in the manifests.
