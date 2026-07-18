# Baseline Measurements — Pre-Change

> Reproducible baseline captured before any application changes, per brief §P0-06.
> Base branch: `feature/complete-product-review-implementation` cut from `origin/main`.

## Environment & provenance

| Item | Value |
|---|---|
| Base SHA (`origin/main`) | `c09e1cdc580e279e28379c66d219e28a985536e7` |
| Capability-first guidance present on main | Yes — commit `02b3cff docs: make AI guidance capability-first and outcome-based (#18)` |
| Node / package manager | Node ≥ 20.9, npm (installed via `npm ci`, exit 0) |
| Framework | Next.js 16.2.10 (App Router, `--webpack` build) |
| Date captured | 2026-07-18 |

### Known environment limitations (cannot reproduce here)
- **Cloudflare/OpenNext production edge behaviour** — no deploy allowed; edge caching, ISR revalidation, and Worker cold-start are unverified (config inspected only).
- **Live Sanity reads** — flag `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED` is `false` by default and no credentials are present; only the seed-content path is exercised (which is what ships).
- **Real form delivery** — Formspree/Turnstile keys are not set, so the code path and graceful-degradation are verified, not a real inbox submission.
- **Live Lighthouse against the deployed edge** — not possible; Core Web Vitals are assessed, not field-measured.

## Toolchain status (baseline = all green)

| Command | Result |
|---|---|
| `npm run typecheck` | Pass (0 errors) |
| `npm run lint` | Pass (0 errors) |
| `npm run test` (Vitest) | **128 passed** across **10 files** |
| `npm run build` | Pass — **91 static pages** generated |

Unit test files (10): `container-contract`, `content-integrity`, `content`, `forms`, `growth-plan`, `nav-integrity`, `rate-limit-adapter`, `sanity-adapter`, `sanity-roundtrip`, `service-redirects`.

E2E specs (6): `contact`, `homepage`, `layout`, `navigation`, `reduced-motion`, `routes`.

## Route inventory (build output)

Static (`○`) + SSG (`●`) + Dynamic (`ƒ`) routes at baseline include:
`/`, `/about`, `/accessibility`, `/api/forms/contact` (ƒ), `/api/forms/growth-plan` (ƒ),
`/business-types/[slug]` (7 paths), `/case-studies`, `/case-studies/[slug]`, `/contact` (ƒ),
`/cookies`, `/examples`, `/examples/[slug]`, `/faq`, `/goals`, `/goals/[slug]` (10 paths),
`/growth-plan`, `/how-it-works`, `/learn`, `/learn/[slug]` (5 paths), `/privacy`, `/resources`,
`/roadmaps`, `/roadmaps/[slug]` (7 paths), `/services`, `/services/[category]` (16 paths),
`/starting-points/[slug]` (8 paths), `/terms`, `/tools`, `/tools/[slug]` (10 paths), `/troubleshooter`,
plus `/opengraph-image`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`.

`/learn/[slug]` baseline guides (5): `how-online-growth-works-as-one-system`,
`choosing-the-right-first-step`, `what-connected-tools-actually-means`, +2 more.

## Bundle / JS weight (measured on disk, `.next/static/chunks`, gzipped)

| Chunk | Raw | Gzip |
|---|---|---|
| vendor `3794-*` | 222 KB | **60.9 KB** |
| vendor `4bd1b696-*` | 200 KB | **62.8 KB** |
| `framework-*` | 190 KB | **59.7 KB** |
| `main-*` | 137 KB | **39.6 KB** |
| `polyfills-*` | 113 KB | **39.5 KB** |
| **GSAP lazy chunk** `c15bf2b0.*` | 52 KB | **19.9 KB** (off critical path, hero-only) |
| homepage `page-bf5f610c*` | 44 KB | 14.0 KB |

- Review-cited first-load JS ≈ **180 KB gzipped**; aspirational ≈ 130 KB. Confirmed order-of-magnitude.
- GSAP is correctly code-split into a lazy chunk (~19.9 KB gz), loaded only for the hero.
- `motion` (Framer-Motion successor) is a declared dependency — to be verified unused and removed (P1-07).

## Media weight
- `public/` total ≈ 56 KB (brand-logo SVGs only). Site is near-imageless (inline SVG + icon components). Zero raster hero images.

## Behavioural baseline (from review, to be re-verified via added e2e)
- Homepage height ≈ **12 screens desktop / ~19.5 screens mobile (~16,486px)** at 390px — to be reduced toward 12–14 mobile screens.
- Horizontal overflow: **0px** on every route (to be preserved).
- Accessibility: review reports **0 axe violations across 8 pages × 2 viewports**; a fresh axe pass is part of P0 e2e and P6 verification.
- CTA contrast: primary CTA uses dark ink on pink→orange gradient (white text fails on the `#ff7a18` end at 2.6:1); fix planned in P1-04.
- Animation inventory: only **two** animations exist — hero universe intro (GSAP) + a slow CSS breathe on the final CTA mark. Everything else static.
- Proof/gating: case studies/testimonials are placeholder-status and gated out of public render; `/case-studies` + `/examples` index/detail exist as routes.
- Builder: 8-step wizard with deterministic recommendation engine; contact capture late in the flow.

## Baseline reference-image inventory (21 images, all present)
`01-work-together-section`, `02-contact-page`, `03-services-mega-menu`, `04-mobile-homepage`,
`05-how-it-works`, `06-growth-troubleshooter` + `06-growth-troubleshooter-full-page` (the two REF-06 views),
`07-desktop-hero`, `08-starting-point-selector`, `09-growth-plan-builder`, `10-goals-grid`,
`11-full-homepage-layout`, `12-services-constellation`, `13-account-ownership`, `14-prioritised-plan`,
`15-customer-journey`, `16-connected-growth-examples`, `17-online-growth-journey`,
`18-digital-world-section`, `19-footer-cta`, `20-alternative-homepage`.
