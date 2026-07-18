# Performance Budget

> Realistic, enforceable budget derived from reproducible measurements (brief §P4-01, review §10/§17).
> Goal: add visual richness **without** unbounded regression of the near-imageless speed the
> site has today.

## Measured baseline (production build, gzipped, on disk)

| Asset | Baseline | Budget (ceiling) |
|---|---|---|
| First-load JS (shared: framework + vendor + main + polyfills) | ≈ **180 KB** | **≤ 200 KB** |
| Largest single shared chunk | ≈ 63 KB | ≤ 75 KB |
| GSAP lazy chunk (hero-only, off critical path) | ≈ 20 KB | ≤ 30 KB |
| `public/` media total | ≈ 56 KB (brand-logo SVGs) | ≤ 250 KB (as optimized SVG/AVIF/WebP is added) |
| Homepage HTML (gzipped) | ≈ 38 KB | ≤ 60 KB |
| Client components (`"use client"`) | ~8 islands + Reveal/StickyMobileCta | keep minimal; justify each new island |

> The review cited ≈180 KB first-load with an *aspirational* ≈130 KB. 130 KB isn't realistic
> for this React 19 app without removing framework weight, so the enforceable budget is
> **≤200 KB first-load** (no regression), with 130 KB as a stretch goal, not a gate.

## Rules that keep the budget

- **Richness as vector, not raster.** New scenes (hero, goals, ownership, services, contact,
  journey) are **layered SVG + CSS glow**, not raster or video — they add ~0 to JS/media.
  (All P5 scenes in this change are SVG/CSS.)
- **One animation runtime.** GSAP only (the unused `motion` package was removed). Reveal uses
  CSS transitions + IntersectionObserver — **no** GSAP on the critical path for reveals.
- **Any genuinely raster illustration** must use `next/image` with AVIF/WebP, lazy-loaded
  below the fold. (None added in this change.)
- **No new heavy runtime deps**, no autoplay background video, no second animation library.
- **Server-first.** New sections are Server Components; client islands are small and justified.

## How it's enforced

- **Build guard test:** `tests/unit/performance-budget.test.ts` fails if the built first-load
  shared JS exceeds the ceiling (run after `npm run build`; skips gracefully if no build
  output is present, so it never blocks a unit-only run).
- **Manual check:** `npm run build` prints the route table; compare shared-chunk gzip sizes to
  the table above. `npm run cf:build` must also succeed for hosting-affecting changes.

## Core Web Vitals posture (assessment — field data needs the deployed edge)

- **LCP:** good — hero text is server-rendered; no large hero raster.
- **CLS:** good — `next/font` with swap; no obvious shift sources; reveals are transform-only.
- **INP:** good — minimal JS, few interactive islands.
- Watch the ~180 KB JS on slow mobile networks; the near-imageless design is the mitigation.
